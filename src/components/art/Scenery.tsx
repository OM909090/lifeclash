/**
 * Environment art: floating sky islands, clouds, trees, rocks, banners.
 * These build the "realm hanging in the sky" backdrop from the reference.
 */

const OUTLINE = "#2A1608";

/* ========================================================================== */
/* FLOATING ISLAND — grass cap, rock underside, optional waterfall             */
/* ========================================================================== */

export function FloatingIsland({
  className,
  width = 420,
  waterfall = true,
  id = "isle",
}: {
  className?: string;
  width?: number;
  waterfall?: boolean;
  /** Unique suffix so multiple islands don't share gradient ids. */
  id?: string;
}) {
  return (
    <svg
      viewBox="0 0 420 300"
      width={width}
      height={(width * 300) / 420}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}Grass`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#9FDE55" />
          <stop offset="52%" stopColor="#74BD3D" />
          <stop offset="100%" stopColor="#3E812F" />
        </linearGradient>
        <linearGradient id={`${id}Rock`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#9A7C5A" />
          <stop offset="46%" stopColor="#6E5638" />
          <stop offset="100%" stopColor="#42301C" />
        </linearGradient>
        <linearGradient id={`${id}Water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BFE9FF" />
          <stop offset="60%" stopColor="#5FC7F5" stopOpacity=".85" />
          <stop offset="100%" stopColor="#5FC7F5" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* rocky underside */}
      <path
        d="M52 108h316l-24 62c-14 34-34 58-58 74l-26 18c-18 12-42 12-60 0l-26-18c-24-16-44-40-58-74z"
        fill={`url(#${id}Rock)`}
        stroke={OUTLINE}
        strokeWidth="5"
      />
      {/* rock strata */}
      <path
        d="M74 150c60 14 200 14 274 0M92 190c50 12 168 12 220 0M116 226c38 9 130 9 172 0"
        stroke="#4E3A22"
        strokeWidth="4"
        fill="none"
        opacity=".55"
        strokeLinecap="round"
      />

      {/* grass cap */}
      <ellipse cx="210" cy="104" rx="164" ry="46" fill={`url(#${id}Grass)`} stroke={OUTLINE} strokeWidth="5" />
      {/* grass rim highlight */}
      <ellipse cx="210" cy="98" rx="150" ry="36" fill="#A8E45E" opacity=".55" />
      {/* grass tufts on the lip */}
      <g fill="#3E812F">
        <path d="M62 116c6-10 14-12 20-4-8 0-14 2-20 4z" />
        <path d="M348 112c-6-10-14-12-20-4 8 0 14 2 20 4z" />
      </g>

      {waterfall ? (
        <>
          <path
            d="M172 132h34c4 34 2 84-10 132-4 16-16 16-20 0-10-48-10-98-4-132z"
            fill={`url(#${id}Water)`}
          />
          <path d="M182 140h12c2 30 1 70-4 104-2 8-6 8-7 0-4-34-4-74-1-104z" fill="#FFFFFF" opacity=".4" />
          <ellipse cx="189" cy="118" rx="20" ry="7" fill="#BFE9FF" opacity=".85" />
        </>
      ) : null}
    </svg>
  );
}

/* ========================================================================== */
/* CLOUDS                                                                      */
/* ========================================================================== */

export function Cloud({
  className,
  width = 240,
  opacity = 0.95,
}: {
  className?: string;
  width?: number;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 240 110"
      width={width}
      height={(width * 110) / 240}
      className={className}
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="cldG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F2FAFF" />
          <stop offset="100%" stopColor="#D3ECFB" />
        </linearGradient>
      </defs>
      <g fill="url(#cldG)">
        <ellipse cx="72" cy="66" rx="56" ry="34" />
        <ellipse cx="130" cy="50" rx="50" ry="40" />
        <ellipse cx="180" cy="70" rx="44" ry="28" />
        <ellipse cx="112" cy="80" rx="70" ry="24" />
      </g>
      {/* underside shading keeps them volumetric rather than flat */}
      <ellipse cx="112" cy="92" rx="66" ry="12" fill="#BEDCF0" opacity=".5" />
    </svg>
  );
}

/* ========================================================================== */
/* TREE — perimeter decoration on the village board                            */
/* ========================================================================== */

export function TreeSvg({
  className,
  width = 62,
  variant = 0,
}: {
  className?: string;
  width?: number;
  /** 0 = round canopy, 1 = tall pine, 2 = twin bush */
  variant?: number;
}) {
  if (variant === 1) {
    return (
      <svg viewBox="0 0 62 92" width={width} height={(width * 92) / 62} className={className} aria-hidden="true">
        <ellipse cx="31" cy="86" rx="18" ry="5" fill="#000" opacity=".22" />
        <rect x="26" y="60" width="10" height="26" rx="4" fill="#6E401F" stroke={OUTLINE} strokeWidth="3" />
        <path d="M31 2 52 40H10z" fill="#4E9E38" stroke={OUTLINE} strokeWidth="3.5" />
        <path d="M31 22 56 66H6z" fill="#3E812F" stroke={OUTLINE} strokeWidth="3.5" />
        <path d="M31 10 44 36H24z" fill="#74BD3D" opacity=".8" />
      </svg>
    );
  }

  if (variant === 2) {
    return (
      <svg viewBox="0 0 62 92" width={width} height={(width * 92) / 62} className={className} aria-hidden="true">
        <ellipse cx="31" cy="86" rx="20" ry="5" fill="#000" opacity=".22" />
        <ellipse cx="20" cy="66" rx="17" ry="15" fill="#3E812F" stroke={OUTLINE} strokeWidth="3.5" />
        <ellipse cx="42" cy="70" rx="14" ry="12" fill="#4E9E38" stroke={OUTLINE} strokeWidth="3.5" />
        <ellipse cx="30" cy="52" rx="19" ry="17" fill="#74BD3D" stroke={OUTLINE} strokeWidth="3.5" />
        <ellipse cx="25" cy="45" rx="9" ry="6" fill="#9FDE55" opacity=".8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 62 92" width={width} height={(width * 92) / 62} className={className} aria-hidden="true">
      <ellipse cx="31" cy="86" rx="18" ry="5" fill="#000" opacity=".22" />
      <rect x="26" y="56" width="11" height="30" rx="5" fill="#6E401F" stroke={OUTLINE} strokeWidth="3" />
      <path d="M31 60c-4-8-4-14 0-20" stroke="#4D2815" strokeWidth="2.5" fill="none" />
      <circle cx="31" cy="34" r="25" fill="#4E9E38" stroke={OUTLINE} strokeWidth="3.5" />
      <circle cx="22" cy="26" r="13" fill="#74BD3D" />
      <circle cx="40" cy="30" r="10" fill="#68B038" />
      <circle cx="24" cy="22" r="6" fill="#9FDE55" opacity=".85" />
    </svg>
  );
}

/** Small rock cluster for the village perimeter. */
export function RockSvg({
  className,
  width = 48,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <svg viewBox="0 0 48 40" width={width} height={(width * 40) / 48} className={className} aria-hidden="true">
      <ellipse cx="24" cy="35" rx="18" ry="4" fill="#000" opacity=".2" />
      <path d="M6 34 14 14l12-4 10 8 6 16z" fill="#8D9395" stroke={OUTLINE} strokeWidth="3" />
      <path d="M14 14l12-4 4 10-12 4z" fill="#CBD0CE" opacity=".7" />
      <path d="M30 18l6 6 4 10-10-4z" fill="#6C7375" />
    </svg>
  );
}

/* ========================================================================== */
/* BANNER — used on the landing hero and clan page                             */
/* ========================================================================== */

export function BannerSvg({
  className,
  width = 72,
  color = "#E0453F",
  crest = "🦁",
}: {
  className?: string;
  width?: number;
  color?: string;
  crest?: string;
}) {
  return (
    <div className={className} style={{ width }}>
      <svg viewBox="0 0 72 104" width={width} height={(width * 104) / 72} aria-hidden="true">
        <rect x="4" y="0" width="64" height="8" rx="4" fill="#8B5228" stroke={OUTLINE} strokeWidth="3" />
        <path d="M8 6h56v72l-28-16-28 16z" fill={color} stroke={OUTLINE} strokeWidth="3.5" />
        <path d="M12 10h20v58l-20 11z" fill="#FFFFFF" opacity=".18" />
        <circle cx="36" cy="38" r="17" fill="#FFF7D6" opacity=".22" />
      </svg>
      <span
        className="pointer-events-none relative block text-center"
        style={{ marginTop: -(width * 0.86), fontSize: width * 0.36 }}
      >
        {crest}
      </span>
    </div>
  );
}
