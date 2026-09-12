/**
 * Original resource iconography. All paths hand-authored — nothing traced from
 * or derived from any existing game's assets.
 */

interface IconProps {
  className?: string;
  size?: number;
}

/* ------------------------------------------------------------------ gold coin */

export function GoldCoinSvg({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <radialGradient id="coinFace" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFF8B8" />
          <stop offset="46%" stopColor="#FFD447" />
          <stop offset="100%" stopColor="#DC990E" />
        </radialGradient>
      </defs>
      {/* rim */}
      <circle cx="16" cy="16" r="14" fill="#8A5B06" />
      <circle cx="16" cy="15.2" r="13" fill="url(#coinFace)" />
      {/* inner disc */}
      <circle
        cx="16"
        cy="15.2"
        r="9.4"
        fill="none"
        stroke="#C88712"
        strokeWidth="1.6"
      />
      {/* engraved coin mark */}
      <path
        d="M16 8.6 18.5 13h4.6l-3.7 2.9 1.4 4.6L16 17.7l-4.8 2.8 1.4-4.6L8.9 13h4.6z"
        fill="#B9760F"
        opacity=".55"
      />
      {/* specular */}
      <ellipse cx="11.6" cy="9.4" rx="4.1" ry="2.6" fill="#FFFDF0" opacity=".72" transform="rotate(-28 11.6 9.4)" />
    </svg>
  );
}

/* --------------------------------------------------------------- elixir flask */

export function ElixirFlaskSvg({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="elixLiquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB8FF" />
          <stop offset="46%" stopColor="#E765FF" />
          <stop offset="100%" stopColor="#8E1FB8" />
        </linearGradient>
        <linearGradient id="elixGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity=".05" />
        </linearGradient>
      </defs>
      {/* flask body */}
      <path
        d="M12.6 4h6.8v5.1l5.1 12.2c1.2 2.9-.9 6.1-4.1 6.1h-8.8c-3.2 0-5.3-3.2-4.1-6.1L12.6 9.1z"
        fill="#3B0A50"
      />
      <path
        d="M13.8 5.4h4.4v4.1l4.9 11.7c.8 2-.6 4.2-2.8 4.2h-8.6c-2.2 0-3.6-2.2-2.8-4.2l4.9-11.7z"
        fill="url(#elixLiquid)"
      />
      {/* liquid surface */}
      <path
        d="M10.6 16.4c1.7-.9 2.9.7 4.6 0s2.9.8 4.6 0l2.3 5.4c.6 1.5-.5 3.1-2.1 3.1h-9.6c-1.6 0-2.7-1.6-2.1-3.1z"
        fill="#FFFFFF"
        opacity=".2"
      />
      {/* cork */}
      <rect x="11.6" y="2.2" width="8.8" height="3.4" rx="1.4" fill="#8B5228" />
      <rect x="11.6" y="2.2" width="8.8" height="1.4" rx="0.7" fill="#C47A3C" />
      {/* glass sheen */}
      <path d="M13.9 6.4h1.5v3.4l-3.6 8.6-1.3-.6 3.4-8.2z" fill="url(#elixGlass)" />
      {/* bubbles */}
      <circle cx="17.6" cy="19.4" r="1.5" fill="#FFFFFF" opacity=".42" />
      <circle cx="14.2" cy="22.2" r="1" fill="#FFFFFF" opacity=".32" />
    </svg>
  );
}

/* ------------------------------------------------------------------- gem */

export function GemSvg({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="gemL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8FFDD" />
          <stop offset="100%" stopColor="#48D45A" />
        </linearGradient>
        <linearGradient id="gemR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5CE86B" />
          <stop offset="100%" stopColor="#12751E" />
        </linearGradient>
      </defs>
      {/* cut outline */}
      <path d="M16 1.6 29.4 11 16 30.4 2.6 11z" fill="#0A3A11" />
      {/* crown facets */}
      <path d="M16 3.4 27.2 11.4 16 12.9 4.8 11.4z" fill="url(#gemL)" />
      {/* pavilion facets */}
      <path d="M4.8 12.6 16 14.1v14.2z" fill="url(#gemR)" />
      <path d="M27.2 12.6 16 14.1v14.2z" fill="#2FA83E" />
      {/* table highlight */}
      <path d="M16 4.8 24 11.1 16 12.3z" fill="#FFFFFF" opacity=".45" />
      <path d="M8 11.1 16 4.8v7.5z" fill="#FFFFFF" opacity=".22" />
      {/* sparkle */}
      <path
        d="M11 6.6l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7z"
        fill="#FFFFFF"
        opacity=".85"
      />
    </svg>
  );
}

/* --------------------------------------------------------------- builder icon */

export function BuilderIconSvg({
  className,
  size = 24,
  busy = false,
}: IconProps & { busy?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="hardHat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE680" />
          <stop offset="100%" stopColor="#E0940C" />
        </linearGradient>
      </defs>
      {/* shoulders */}
      <path
        d="M6.4 30c0-5.2 4.3-8.2 9.6-8.2S25.6 24.8 25.6 30z"
        fill={busy ? "#6C7375" : "#2F6EA8"}
      />
      <path
        d="M6.4 30c0-5.2 4.3-8.2 9.6-8.2S25.6 24.8 25.6 30z"
        fill="#FFFFFF"
        opacity=".12"
      />
      {/* head */}
      <circle cx="16" cy="15.4" r="5.6" fill="#F3C08C" />
      <path d="M10.4 15.4a5.6 5.6 0 0 1 11.2 0z" fill="#E8A96C" opacity=".55" />
      {/* hard hat */}
      <path
        d="M6.8 12.4h18.4c0-5.3-4.1-8.6-9.2-8.6s-9.2 3.3-9.2 8.6z"
        fill="url(#hardHat)"
      />
      <rect x="5.6" y="11.6" width="20.8" height="2.8" rx="1.4" fill="#C88712" />
      <path
        d="M15.1 4.4h1.8v7.2h-1.8z"
        fill="#FFF8C6"
        opacity=".7"
      />
      {/* eyes */}
      <circle cx="13.9" cy="16.2" r="0.95" fill="#3B2412" />
      <circle cx="18.1" cy="16.2" r="0.95" fill="#3B2412" />
      {busy ? (
        /* tiny hammer to signal "busy" */
        <g transform="translate(21 17) rotate(-24)">
          <rect x="0" y="3.4" width="8.4" height="1.9" rx="0.9" fill="#8B5228" />
          <rect x="6.8" y="0.8" width="4.2" height="6.6" rx="1.2" fill="#9AA1A4" />
        </g>
      ) : null}
    </svg>
  );
}

/* --------------------------------------------------------------- trophy / xp */

export function TrophySvg({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="cupG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF2A8" />
          <stop offset="48%" stopColor="#FFD447" />
          <stop offset="100%" stopColor="#C88712" />
        </linearGradient>
      </defs>
      {/* base */}
      <rect x="9.6" y="26" width="12.8" height="4" rx="1.6" fill="#8A5B06" />
      <rect x="11.8" y="22.4" width="8.4" height="4.2" rx="1.2" fill="#C88712" />
      {/* cup */}
      <path
        d="M8.4 5h15.2v6.6c0 4.4-3.4 7.9-7.6 7.9s-7.6-3.5-7.6-7.9z"
        fill="url(#cupG)"
        stroke="#8A5B06"
        strokeWidth="1.3"
      />
      {/* handles */}
      <path
        d="M8.4 6.6H5.2c-1.4 0-2.4 1.2-2.1 2.6.5 2.6 2.6 4.4 5.3 4.6"
        fill="none"
        stroke="#C88712"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M23.6 6.6h3.2c1.4 0 2.4 1.2 2.1 2.6-.5 2.6-2.6 4.4-5.3 4.6"
        fill="none"
        stroke="#C88712"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* star */}
      <path
        d="M16 8l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z"
        fill="#FFF8DC"
        opacity=".9"
      />
    </svg>
  );
}

/** Flame used for the streak counter and the Defense Tower beacon. */
export function FlameSvg({
  className,
  size = 24,
  lit = true,
}: IconProps & { lit?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={lit ? "flameLit" : "flameDim"} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={lit ? "#FF6B2C" : "#5A6265"} />
          <stop offset="52%" stopColor={lit ? "#FFA92E" : "#767E81"} />
          <stop offset="100%" stopColor={lit ? "#FFE680" : "#9AA1A4"} />
        </linearGradient>
      </defs>
      <path
        d="M16 2c3.4 4.6 2 7.2.6 9.2-1.2 1.7-2.3 3.1-1.2 5 .5.9-.3 1.7-1.1 1.2-2-1.3-3-3.4-2.7-5.8-2.6 2.3-4.2 5.3-4.2 8.4C7.4 25.9 11.3 30 16 30s8.6-4.1 8.6-9.9c0-6.9-5-11.6-8.6-18.1z"
        fill={`url(#${lit ? "flameLit" : "flameDim"})`}
      />
      <path
        d="M16 14.6c2.2 2.6 3.4 4.6 3.4 7 0 2.7-1.6 4.7-3.4 4.7s-3.4-2-3.4-4.7c0-1.7.8-3.3 2-5z"
        fill={lit ? "#FFF3B0" : "#C3C9CB"}
        opacity={lit ? 0.9 : 0.5}
      />
    </svg>
  );
}
