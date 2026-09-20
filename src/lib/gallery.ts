import fs from "node:fs";
import path from "node:path";
import { getAllFestivals } from "@/lib/festivals";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const LOGO_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isLogoFile(file: string): boolean {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext).toLowerCase();
  return base === "logo" && LOGO_EXTENSIONS.has(ext);
}

function listEventFolders(eventsDir: string): string[] {
  if (!fs.existsSync(eventsDir)) return [];
  return fs
    .readdirSync(eventsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function readImages(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((file) => !isLogoFile(file) && IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
      return a.localeCompare(b);
    });
}

/**
 * Matches each public/events/<folder> to exactly one festival, by normalized
 * id/name comparison. A folder that could plausibly belong to more than one
 * festival (e.g. two "Meeting of Styles" chapters) is left unassigned rather
 * than guessed.
 */
function buildFolderMap(): Map<string, string> {
  const eventsDir = path.join(process.cwd(), "public", "events");
  const folders = listEventFolders(eventsDir);
  const festivals = getAllFestivals();
  const map = new Map<string, string>();

  for (const folder of folders) {
    const key = normalize(folder);
    const matches = festivals.filter((f) => {
      const idKey = normalize(f.id);
      const nameKey = normalize(f.name);
      return key === idKey || key === nameKey || nameKey.startsWith(key) || key.startsWith(nameKey);
    });

    if (matches.length === 1) {
      map.set(matches[0].id, folder);
    }
  }

  return map;
}

function getEventFolder(id: string): string | null {
  return buildFolderMap().get(id) ?? null;
}

export function getEventGalleryImages(id: string): string[] {
  const folder = getEventFolder(id);
  if (!folder) return [];

  const dir = path.join(process.cwd(), "public", "events", folder);
  return readImages(dir).map((file) => `/events/${folder}/${file}`);
}

export function getEventLogo(id: string): string | null {
  const folder = getEventFolder(id);
  if (!folder) return null;

  const dir = path.join(process.cwd(), "public", "events", folder);
  const logoFile = fs.readdirSync(dir).find(isLogoFile);
  return logoFile ? `/events/${folder}/${logoFile}` : null;
}
