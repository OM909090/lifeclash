/**
 * Village building artwork — original isometric-styled SVGs.
 *
 * Each building takes a `level` and switches silhouette at three visual tiers
 * so upgrading produces a *visible* change (the whole point of the loop per
 * LIFECLASH-SPEC.md §Principle 2):
 *
 *   tier 0 → level 1-3   (humble)
 *   tier 1 → level 4-7   (established)
 *   tier 2 → level 8+    (grand)
 *
 * Drawn on a 200x180 canvas with the footprint centred at (100, 148) so they
 * seat correctly on an isometric tile.
 */

import type { BuildingType } from "@/types/game";

const OUTLINE = "#2A1608";

export interface BuildingArtProps {
  level?: number;
  width?: number;
  className?: string;
  /** Dulls the art — used for LOCKED plots and a broken streak. */
  dim?: boolean;
}

export function tierFor(level: number): 0 | 1 | 2 {
  if (level >= 8) return 2;
  if (level >= 4) return 1;
  return 0;
}

function Shell({
  children,
  width = 150,
  className,
  dim,
}: BuildingArtProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 180"
      width={width}
      height={(width * 180) / 200}
      className={className}
      style={dim ? { filter: "saturate(.35) brightness(.72)" } : undefined}
      aria-hidden="true"
    >
      {/* contact shadow on the tile */}
      <ellipse cx="100" cy="156" rx="62" ry="16" fill="#000" opacity=".26" />
      {children}
    </svg>
  );
}

/** Shared stone platform every building sits on. */
function Plinth({ w = 62, color = "#8D9395" }: { w?: number; color?: string }) {
  return (
    <g>
      <path
        d={`M100 ${168 - 0} L${100 + w} 148 L100 128 L${100 - w} 148 Z`}
        fill={color}
        stroke={OUTLINE}
        strokeWidth="3.5"
      />
      <path d={`M100 128 L${100 - w} 148 L${100 - w} 154 L100 174 Z`} fill="#5F6669" stroke={OUTLINE} strokeWidth="3" />
      <path d={`M100 128 L${100 + w} 148 L${100 + w} 154 L100 174 Z`} fill="#767D80" stroke={OUTLINE} strokeWidth="3" />
    </g>
  );
}

/* ========================================================================== */
/* TOWN HALL                                                                   */
/* ========================================================================== */

export function TownHallSvg({ level = 1, ...rest }: BuildingArtProps) {
  const tier = tierFor(level);

  return (
    <Shell {...rest}>
      <defs>
        <linearGradient id="thWall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#F6E3C4" />
          <stop offset="55%" stopColor="#DFC098" />
          <stop offset="100%" stopColor="#B08A5E" />
        </linearGradient>
        <linearGradient id="thRoof" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#6FC2F0" />
          <stop offset="52%" stopColor="#3A8FD0" />
          <stop offset="100%" stopColor="#1E5A8E" />
        </linearGradient>
        <linearGradient id="thRoofGold" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#FFE680" />
          <stop offset="52%" stopColor="#F0B429" />
          <stop offset="100%" stopColor="#A8720C" />
        </linearGradient>
      </defs>

      <Plinth w={66} />

      {/* main hall block */}
      <path d="M46 128V78h108v50l-54 20z" fill="url(#thWall)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M46 78h54v70l-54-20z" fill="#000" opacity=".12" />
      {/* stone banding */}
      <path d="M46 104h108" stroke="#A5825A" strokeWidth="3.5" opacity=".7" />

      {/* door */}
      <path d="M84 148v-38c0-9 7-16 16-16s16 7 16 16v38l-16 6z" fill="#6E401F" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M100 96c-8 0-14 6-14 14v34l14 5z" fill="#4D2815" />
      <circle cx="108" cy="124" r="3" fill="#F0B429" />

      {/* windows */}
      <g stroke={OUTLINE} strokeWidth="3">
        <path d="M60 92h14v18H60z" fill="#3A8FD0" />
        <path d="M126 92h14v18h-14z" fill="#3A8FD0" />
      </g>
      <path d="M62 94h5v14h-5z" fill="#BFE9FF" opacity=".7" />
      <path d="M128 94h5v14h-5z" fill="#BFE9FF" opacity=".7" />

      {/* roof */}
      <path
        d="M100 22 168 82H32z"
        fill={tier === 2 ? "url(#thRoofGold)" : "url(#thRoof)"}
        stroke={OUTLINE}
        strokeWidth="4.5"
      />
      <path d="M100 22 34 82h30L100 40z" fill="#FFFFFF" opacity=".22" />
      {/* eave */}
      <path d="M28 78h144l4 8H24z" fill={tier === 2 ? "#A8720C" : "#1E5A8E"} stroke={OUTLINE} strokeWidth="3.5" />

      {tier >= 1 ? (
        <>
          {/* side towers appear at tier 1 */}
          <path d="M28 128V92h20v36l-10 4z" fill="url(#thWall)" stroke={OUTLINE} strokeWidth="3.5" />
          <path d="M152 128V92h20v36l-10 4z" fill="url(#thWall)" stroke={OUTLINE} strokeWidth="3.5" />
          <path d="M38 74l14 20H24z" fill={tier === 2 ? "url(#thRoofGold)" : "url(#thRoof)"} stroke={OUTLINE} strokeWidth="3.5" />
          <path d="M162 74l14 20h-28z" fill={tier === 2 ? "url(#thRoofGold)" : "url(#thRoof)"} stroke={OUTLINE} strokeWidth="3.5" />
        </>
      ) : null}

      {/* central spire */}
      <rect x="94" y="8" width="12" height="20" rx="3" fill="#8B5228" stroke={OUTLINE} strokeWidth="3" />
      {tier === 2 ? (
        <>
          {/* crown at max tier */}
          <path d="M100 0l7 12h-14z" fill="#FFE680" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="100" cy="4" r="4" fill="#5CE86B" stroke={OUTLINE} strokeWidth="2" />
        </>
      ) : (
        <path d="M100 2l16 8-16 8z" fill="#E0453F" stroke={OUTLINE} strokeWidth="2.5" />
      )}
    </Shell>
  );
}

/* ========================================================================== */
/* ACADEMY — stone library + glowing arcane book                               */
/* ========================================================================== */

export function AcademySvg({ level = 1, ...rest }: BuildingArtProps) {
  const tier = tierFor(level);

  return (
    <Shell {...rest}>
      <defs>
        <linearGradient id="acWall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#DDE3F2" />
          <stop offset="52%" stopColor="#A8B2CE" />
          <stop offset="100%" stopColor="#6C769A" />
        </linearGradient>
        <linearGradient id="acRoof" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#8A97FF" />
          <stop offset="52%" stopColor="#4453C6" />
          <stop offset="100%" stopColor="#232C7E" />
        </linearGradient>
        <radialGradient id="acGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7DF0FF" stopOpacity=".95" />
          <stop offset="100%" stopColor="#5FE8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Plinth w={60} color="#7E88A6" />

      {/* library body */}
      <path d="M50 132V80h100v52l-50 18z" fill="url(#acWall)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M50 80h50v70l-50-18z" fill="#000" opacity=".14" />

      {/* pillars */}
      <g stroke={OUTLINE} strokeWidth="3" fill="#EDF1F9">
        <path d="M58 130V86h11v48z" />
        <path d="M131 130V86h11v48z" />
      </g>

      {/* arched entry */}
      <path d="M86 150v-34c0-8 6-14 14-14s14 6 14 14v34z" fill="#2E3A9E" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M100 106c-6 0-10 4-10 10v30l10 4z" fill="#1A2266" />

      {/* shelf windows */}
      <g stroke={OUTLINE} strokeWidth="2.5" fill="#2E3A9E">
        <rect x="74" y="88" width="12" height="10" rx="2" />
        <rect x="114" y="88" width="12" height="10" rx="2" />
      </g>

      {/* roof */}
      <path d="M100 34 162 84H38z" fill="url(#acRoof)" stroke={OUTLINE} strokeWidth="4.5" />
      <path d="M100 34 40 84h28l32-40z" fill="#FFFFFF" opacity=".2" />
      <path d="M34 80h132l4 8H30z" fill="#232C7E" stroke={OUTLINE} strokeWidth="3.5" />

      {tier >= 1 ? (
        /* observatory wing at tier 1 */
        <>
          <path d="M150 132V96h22v36l-11 4z" fill="url(#acWall)" stroke={OUTLINE} strokeWidth="3.5" />
          <path d="M161 78c9 0 16 8 16 18h-32c0-10 7-18 16-18z" fill="url(#acRoof)" stroke={OUTLINE} strokeWidth="3.5" />
        </>
      ) : null}

      {/* floating arcane book above the roof */}
      <g className="animate-bob" style={{ transformOrigin: "100px 22px" }}>
        <circle cx="100" cy="22" r={tier === 2 ? 30 : 22} fill="url(#acGlow)" />
        <g transform="translate(78 10)">
          <path d="M0 4h44v22H0z" fill="#5A3417" stroke={OUTLINE} strokeWidth="2.5" />
          <path d="M3 6h18v18H3z" fill="#FFF7D6" />
          <path d="M23 6h18v18H23z" fill="#F1E4BE" />
          <path d="M20 4h4v22h-4z" fill="#3B220E" />
          <path d="M6 11h11M6 15h11M6 19h8" stroke="#5FE8FF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M26 11h11M26 15h11M26 19h8" stroke="#5FE8FF" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        {/* orbiting runes */}
        <g fill="#5FE8FF">
          <circle cx="70" cy="18" r="3" opacity=".9" />
          <circle cx="132" cy="26" r="2.4" opacity=".75" />
          {tier === 2 ? <circle cx="100" cy="0" r="3.4" opacity=".95" /> : null}
        </g>
      </g>
    </Shell>
  );
}

/* ========================================================================== */
/* TRAINING GROUNDS — colosseum arena + barbell                                */
/* ========================================================================== */

export function TrainingGroundsSvg({ level = 1, ...rest }: BuildingArtProps) {
  const tier = tierFor(level);

  return (
    <Shell {...rest}>
      <defs>
        <linearGradient id="tgWall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#F3D9BE" />
          <stop offset="52%" stopColor="#D2AA82" />
          <stop offset="100%" stopColor="#9A6E48" />
        </linearGradient>
        <linearGradient id="tgSand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0CE97" />
          <stop offset="100%" stopColor="#C9A067" />
        </linearGradient>
        <linearGradient id="tgSteel" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#F2F7FA" />
          <stop offset="100%" stopColor="#7E8B94" />
        </linearGradient>
      </defs>

      <Plinth w={64} color="#A9835C" />

      {/* arena sand floor */}
      <ellipse cx="100" cy="112" rx="58" ry="26" fill="url(#tgSand)" stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="100" cy="110" rx="44" ry="18" fill="#E3BC85" opacity=".7" />

      {/* colosseum outer wall — back half */}
      <path
        d="M36 112a64 26 0 0 1 128 0v-8a64 26 0 0 0-128 0z"
        fill="url(#tgWall)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      <path d="M36 76h128v32H36z" fill="none" />
      {/* tiered wall */}
      <path d="M38 104V74a62 24 0 0 1 124 0v30z" fill="url(#tgWall)" stroke={OUTLINE} strokeWidth="4" />
      {/* arches */}
      <g stroke={OUTLINE} strokeWidth="3" fill="#8A5E3C">
        <path d="M52 100V84a7 7 0 0 1 14 0v16z" />
        <path d="M78 96V80a7 7 0 0 1 14 0v16z" />
        <path d="M108 96V80a7 7 0 0 1 14 0v16z" />
        <path d="M134 100V84a7 7 0 0 1 14 0v16z" />
      </g>
      {/* cornice */}
      <path d="M34 70a66 22 0 0 1 132 0l-4 8a62 20 0 0 0-124 0z" fill="#B98A5E" stroke={OUTLINE} strokeWidth="3.5" />

      {tier >= 1 ? (
        /* second tier of seating */
        <path d="M42 58a58 18 0 0 1 116 0l-4 10a54 16 0 0 0-108 0z" fill="url(#tgWall)" stroke={OUTLINE} strokeWidth="3.5" />
      ) : null}

      {/* banners */}
      <g>
        <path d="M50 60h12v20l-6-5-6 5z" fill="#E0453F" stroke={OUTLINE} strokeWidth="2.5" />
        <path d="M138 60h12v20l-6-5-6 5z" fill="#E0453F" stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* barbell on the sand */}
      <g transform="translate(100 116)">
        <rect x="-34" y="-4" width="68" height="7" rx="3.5" fill="url(#tgSteel)" stroke={OUTLINE} strokeWidth="3" />
        <rect x="-46" y="-13" width="13" height="25" rx="4" fill="#3B4245" stroke={OUTLINE} strokeWidth="3" />
        <rect x="33" y="-13" width="13" height="25" rx="4" fill="#3B4245" stroke={OUTLINE} strokeWidth="3" />
        {tier >= 1 ? (
          <>
            <rect x="-58" y="-16" width="12" height="31" rx="4" fill="#2A2F31" stroke={OUTLINE} strokeWidth="3" />
            <rect x="46" y="-16" width="12" height="31" rx="4" fill="#2A2F31" stroke={OUTLINE} strokeWidth="3" />
          </>
        ) : null}
      </g>

      {tier === 2 ? (
        /* champion's brazier at max tier */
        <g transform="translate(100 34)">
          <rect x="-7" y="10" width="14" height="18" rx="3" fill="#8B5228" stroke={OUTLINE} strokeWidth="3" />
          <path d="M-14 4h28l-3 8h-22z" fill="#B4C0C7" stroke={OUTLINE} strokeWidth="3" />
          <path
            d="M0-22c5 8 3 12 1 15 3 2 5 5 5 8 0 5-3 8-6 8s-6-3-6-8c0-4 2-8 6-13z"
            fill="#FF9A3C"
            stroke={OUTLINE}
            strokeWidth="2.5"
            className="origin-bottom animate-flame-flicker"
          />
        </g>
      ) : null}
    </Shell>
  );
}

/* ========================================================================== */
/* TREASURY — vault + gold pile                                                */
/* ========================================================================== */

export function TreasurySvg({ level = 1, ...rest }: BuildingArtProps) {
  const tier = tierFor(level);

  return (
    <Shell {...rest}>
      <defs>
        <linearGradient id="tsWall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#D9DEE1" />
          <stop offset="52%" stopColor="#9AA3A8" />
          <stop offset="100%" stopColor="#5F686C" />
        </linearGradient>
        <linearGradient id="tsGold" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#FFF078" />
          <stop offset="48%" stopColor="#FFD447" />
          <stop offset="100%" stopColor="#C88712" />
        </linearGradient>
        <linearGradient id="tsRoof" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#4CD98C" />
          <stop offset="100%" stopColor="#12603A" />
        </linearGradient>
      </defs>

      <Plinth w={60} />

      {/* vault block */}
      <path d="M48 130V78h104v52l-52 18z" fill="url(#tsWall)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M48 78h52v70l-52-18z" fill="#000" opacity=".14" />
      {/* rivet rows */}
      <g fill="#4E5558">
        <circle cx="58" cy="86" r="3" />
        <circle cx="58" cy="120" r="3" />
        <circle cx="142" cy="86" r="3" />
        <circle cx="142" cy="120" r="3" />
      </g>

      {/* circular vault door */}
      <circle cx="100" cy="106" r="26" fill="#7E888C" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="100" cy="106" r="18" fill="url(#tsGold)" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="100" cy="106" r="7" fill="#8A5B06" stroke={OUTLINE} strokeWidth="2.5" />
      {/* handle spokes */}
      <g stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round">
        <path d="M100 92v-6M100 126v-6M86 106h-6M120 106h-6" />
      </g>

      {/* roof */}
      <path d="M100 36 160 82H40z" fill="url(#tsRoof)" stroke={OUTLINE} strokeWidth="4.5" />
      <path d="M100 36 42 82h26l32-38z" fill="#FFFFFF" opacity=".22" />
      <path d="M36 78h128l4 8H32z" fill="#12603A" stroke={OUTLINE} strokeWidth="3.5" />

      {/* gold spilling out at the base */}
      <g>
        <ellipse cx="62" cy="140" rx="24" ry="10" fill="url(#tsGold)" stroke={OUTLINE} strokeWidth="3" />
        <ellipse cx="140" cy="142" rx="20" ry="9" fill="url(#tsGold)" stroke={OUTLINE} strokeWidth="3" />
        <g fill="#FFE680" stroke={OUTLINE} strokeWidth="2">
          <circle cx="54" cy="134" r="6" />
          <circle cx="68" cy="132" r="5" />
          <circle cx="136" cy="136" r="5" />
          {tier >= 1 ? (
            <>
              <circle cx="61" cy="126" r="5" />
              <circle cx="146" cy="132" r="4.5" />
            </>
          ) : null}
        </g>
      </g>

      {tier >= 1 ? (
        /* coin chimney / mint stack */
        <>
          <rect x="146" y="52" width="18" height="30" rx="4" fill="url(#tsWall)" stroke={OUTLINE} strokeWidth="3.5" />
          <ellipse cx="155" cy="52" rx="9" ry="4" fill="#7E888C" stroke={OUTLINE} strokeWidth="2.5" />
        </>
      ) : null}

      {tier === 2 ? (
        /* floating gem crown */
        <g className="animate-bob" style={{ transformOrigin: "100px 24px" }}>
          <path d="M100 8l10 16H90z" fill="#5CE86B" stroke={OUTLINE} strokeWidth="3" />
          <circle cx="100" cy="12" r="5" fill="#9CFFA8" stroke={OUTLINE} strokeWidth="2" />
        </g>
      ) : null}
    </Shell>
  );
}

/* ========================================================================== */
/* DEFENSE TOWER — watchtower + streak beacon                                  */
/* ========================================================================== */

export function DefenseTowerSvg({
  level = 1,
  streakLit = true,
  ...rest
}: BuildingArtProps & { streakLit?: boolean }) {
  const tier = tierFor(level);

  return (
    <Shell {...rest}>
      <defs>
        <linearGradient id="dtWall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#CBD8E4" />
          <stop offset="52%" stopColor="#93A4B4" />
          <stop offset="100%" stopColor="#5A6B7B" />
        </linearGradient>
        <linearGradient id="dtRoof" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#7FC0F5" />
          <stop offset="52%" stopColor="#3E8BE0" />
          <stop offset="100%" stopColor="#1B4276" />
        </linearGradient>
        <linearGradient id="dtFlame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={streakLit ? "#3A7BFF" : "#4E5558"} />
          <stop offset="55%" stopColor={streakLit ? "#5FE8FF" : "#6C7375"} />
          <stop offset="100%" stopColor={streakLit ? "#DFFAFF" : "#8D9395"} />
        </linearGradient>
        <radialGradient id="dtGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7DE8FF" stopOpacity=".9" />
          <stop offset="100%" stopColor="#5FE8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Plinth w={48} />

      {/* tower shaft — taller with each tier */}
      {(() => {
        const top = tier === 2 ? 40 : tier === 1 ? 56 : 72;
        return (
          <>
            <path d={`M72 132V${top}h56v52l-28 10z`} fill="url(#dtWall)" stroke={OUTLINE} strokeWidth="4" />
            <path d={`M72 ${top}h28v72l-28-10z`} fill="#000" opacity=".14" />
            {/* stone courses */}
            <g stroke="#7C8B99" strokeWidth="3" opacity=".7">
              <path d={`M72 ${top + 22}h56`} />
              <path d={`M72 ${top + 44}h56`} />
              {tier >= 1 ? <path d={`M72 ${top + 66}h56`} /> : null}
            </g>
            {/* arrow slit */}
            <rect x="94" y={top + 28} width="12" height="20" rx="6" fill="#1B2A38" stroke={OUTLINE} strokeWidth="3" />

            {/* battlement ring */}
            <path d={`M64 ${top}h72v-14H64z`} fill="url(#dtWall)" stroke={OUTLINE} strokeWidth="4" />
            <g fill="url(#dtWall)" stroke={OUTLINE} strokeWidth="3">
              <rect x="62" y={top - 26} width="14" height="14" />
              <rect x="84" y={top - 26} width="14" height="14" />
              <rect x="106" y={top - 26} width="14" height="14" />
              <rect x="126" y={top - 26} width="12" height="14" />
            </g>

            {/* beacon brazier */}
            <g transform={`translate(100 ${top - 34})`}>
              <circle cx="0" cy="-6" r={streakLit ? (tier === 2 ? 34 : 26) : 0} fill="url(#dtGlow)" />
              <path d="M-16 4h32l-4 10h-24z" fill="#7E888C" stroke={OUTLINE} strokeWidth="3" />
              <path
                d="M0-30c6 10 4 15 1 19-3 4-4 7-2 10 1 2-1 4-3 3-4-3-6-8-5-13-6 6-9 12-9 17 0 7 8 13 18 13s18-6 18-13C18 -4 8 -16 0-30z"
                fill="url(#dtFlame)"
                stroke={OUTLINE}
                strokeWidth="3"
                className={streakLit ? "origin-bottom animate-flame-flicker" : "origin-bottom"}
                opacity={streakLit ? 1 : 0.55}
              />
              {streakLit ? (
                <g fill="#DFFAFF">
                  <circle cx="-18" cy="-26" r="2.4" opacity=".85" />
                  <circle cx="16" cy="-34" r="2" opacity=".7" />
                </g>
              ) : (
                /* smoke when the streak breaks */
                <g fill="#8D9395" opacity=".55">
                  <circle cx="-6" cy="-30" r="5" />
                  <circle cx="4" cy="-40" r="6" />
                  <circle cx="-2" cy="-50" r="4" />
                </g>
              )}
            </g>

          </>
        );
      })()}

      {tier >= 1 ? (
        /* buttress wings */
        <>
          <path d="M52 134v-26l20-8v34l-10 4z" fill="url(#dtWall)" stroke={OUTLINE} strokeWidth="3.5" />
          <path d="M148 134v-26l-20-8v34l10 4z" fill="url(#dtWall)" stroke={OUTLINE} strokeWidth="3.5" />
        </>
      ) : null}

      {tier === 2 ? (
        /* shield crest mounted on the shaft */
        <g transform="translate(100 118)">
          <path d="M0-14 16-10v12c0 8-7 14-16 17-9-3-16-9-16-17v-12z" fill="#3E8BE0" stroke={OUTLINE} strokeWidth="3" />
          <path d="M0-10 11-7v9c0 5-5 9-11 11-6-2-11-6-11-11v-9z" fill="#FFF7D6" opacity=".85" />
        </g>
      ) : null}
    </Shell>
  );
}

/* ========================================================================== */
/* CLAN MONUMENT — collective progress obelisk                                 */
/* ========================================================================== */

export function ClanMonumentSvg({ level = 1, ...rest }: BuildingArtProps) {
  const tier = tierFor(level);

  return (
    <Shell {...rest}>
      <defs>
        <linearGradient id="cmStone" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#EAE0F5" />
          <stop offset="52%" stopColor="#B8A6D0" />
          <stop offset="100%" stopColor="#6E5A8A" />
        </linearGradient>
        <linearGradient id="cmGem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C6FFCE" />
          <stop offset="52%" stopColor="#5CE86B" />
          <stop offset="100%" stopColor="#1E9E2C" />
        </linearGradient>
        <radialGradient id="cmGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9CFFA8" stopOpacity=".85" />
          <stop offset="100%" stopColor="#5CE86B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Plinth w={56} color="#8E7BA8" />

      {/* stepped base */}
      <path d="M100 140 148 124 100 108 52 124z" fill="#9C8BB4" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M100 124 132 113 100 102 68 113z" fill="#B8A6D0" stroke={OUTLINE} strokeWidth="3.5" />

      {/* obelisk — grows with tier */}
      {(() => {
        const top = tier === 2 ? 26 : tier === 1 ? 42 : 58;
        return (
          <>
            <path d={`M84 108 100 ${top} 116 108z`} fill="url(#cmStone)" stroke={OUTLINE} strokeWidth="4" />
            <path d={`M84 108 100 ${top}v${108 - top}z`} fill="#000" opacity=".13" />
            {/* carved rings */}
            <g stroke="#8E7BA8" strokeWidth="2.5" opacity=".8">
              <path d="M87 98h26M89 88h22" />
              {tier >= 1 ? <path d="M92 76h16" /> : null}
            </g>

            {/* crowning gem */}
            <g className="animate-bob" style={{ transformOrigin: `100px ${top - 12}px` }}>
              <circle cx="100" cy={top - 14} r={tier === 2 ? 26 : 18} fill="url(#cmGlow)" />
              <path
                d={`M100 ${top - 28} 111 ${top - 14} 100 ${top - 2} 89 ${top - 14}z`}
                fill="url(#cmGem)"
                stroke={OUTLINE}
                strokeWidth="3"
              />
              <path d={`M100 ${top - 25} 108 ${top - 15} 100 ${top - 12}z`} fill="#FFFFFF" opacity=".55" />
            </g>
          </>
        );
      })()}

      {/* clan banners flanking */}
      <g>
        <rect x="52" y="86" width="5" height="44" rx="2.5" fill="#6E401F" stroke={OUTLINE} strokeWidth="2.5" />
        <path d="M57 88h22v20l-11-6-11 6z" fill="#5B6BE1" stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="143" y="86" width="5" height="44" rx="2.5" fill="#6E401F" stroke={OUTLINE} strokeWidth="2.5" />
        <path d="M121 88h22v20l-11-6-11 6z" fill="#E0453F" stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {tier === 2 ? (
        /* orbiting member motes at max tier */
        <g fill="#5CE86B">
          <circle cx="62" cy="52" r="3.4" className="animate-drift" opacity=".9" />
          <circle cx="140" cy="62" r="3" className="animate-drift" style={{ animationDelay: "-2s" }} opacity=".8" />
          <circle cx="100" cy="4" r="2.6" className="animate-drift" style={{ animationDelay: "-4s" }} opacity=".85" />
        </g>
      ) : null}
    </Shell>
  );
}

/* ========================================================================== */
/* REGISTRY                                                                    */
/* ========================================================================== */

export const BUILDING_ART: Record<
  BuildingType,
  (props: BuildingArtProps & { streakLit?: boolean }) => JSX.Element
> = {
  TOWN_HALL: TownHallSvg,
  ACADEMY: AcademySvg,
  TRAINING_GROUNDS: TrainingGroundsSvg,
  TREASURY: TreasurySvg,
  DEFENSE_TOWER: DefenseTowerSvg,
  CLAN_MONUMENT: ClanMonumentSvg,
};

export function BuildingArt({
  type,
  ...props
}: BuildingArtProps & { type: BuildingType; streakLit?: boolean }) {
  const Cmp = BUILDING_ART[type] ?? TownHallSvg;
  return <Cmp {...props} />;
}
