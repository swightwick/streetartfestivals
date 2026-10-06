interface ArrowIconProps {
  size?: number;
  className?: string;
  // Points left instead of the SVG's native right — used for "back"
  // links (e.g. "‹ Back to map") instead of swapping in a second,
  // mirror-image path.
  flip?: boolean;
}

// bootstrap-icons' arrow-right-short — also used (duplicated inline, since
// it's injected via MapLibre's popup.setHTML string rather than JSX) for the
// map tooltip's link cue. Keep both in sync if this path ever changes.
export default function ArrowIcon({ size = 16, className = "", flip = false }: ArrowIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        fillRule="evenodd"
        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
      />
    </svg>
  );
}
