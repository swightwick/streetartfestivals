import { NextResponse } from "next/server";
import { SITE, siteUrl } from "@/lib/festivals";

export const dynamic = "force-static";

// Machine-readable API description — referenced as the "service-desc" link
// relation from /.well-known/api-catalog (RFC 9727).
export function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: `${SITE.name} API`,
      description: SITE.tagline,
      version: "1.0.0",
    },
    servers: [{ url: siteUrl("/") }],
    paths: {
      "/api/festivals": {
        get: {
          summary: "List UK & Ireland street art and graffiti festivals",
          description:
            "Full read-only feed of the festival + hotel dataset backing the site — dates, " +
            "location, status, social links and nearby places to stay for every festival.",
          operationId: "listFestivals",
          responses: {
            "200": {
              description: "Festival and hotel dataset",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FestivalData" },
                },
              },
            },
          },
        },
      },
      "/api/status": {
        get: {
          summary: "API health check",
          operationId: "getStatus",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Status" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Status: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            time: { type: "string", format: "date-time" },
          },
          required: ["status", "time"],
        },
        FestivalData: {
          type: "object",
          properties: {
            site: { type: "object" },
            regions: { type: "array", items: { type: "string" } },
            festivals: {
              type: "array",
              items: { $ref: "#/components/schemas/Festival" },
            },
          },
        },
        Festival: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            city: { type: "string" },
            region: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            site: { type: "string", format: "uri" },
            location: { type: "string" },
            postcode: { type: "string" },
            dates: { type: "string" },
            dateShort: { type: "string" },
            start: { type: "string", format: "date", nullable: true },
            end: { type: "string", format: "date", nullable: true },
            month: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["confirmed", "month", "rolling", "tbc", "none"],
            },
            badge: { type: "string" },
            freq: { type: "string" },
            statusNote: { type: "string" },
            summary: { type: "string" },
            prev: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  year: { type: "string" },
                  note: { type: "string" },
                },
              },
            },
            socials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  url: { type: "string", format: "uri" },
                },
              },
            },
            stays: {
              type: "array",
              items: { type: "object" },
            },
          },
          required: ["id", "name", "city", "region", "lat", "lng"],
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
