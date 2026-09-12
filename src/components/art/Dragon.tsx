/**
 * The Procrastination Dragon — LifeClash's raid boss and antagonist.
 * Violet + smoke palette, original artwork.
 *
 * Composed as a head-forward bust: the skull is deliberately the dominant
 * shape (~45% of the frame) because a boss needs to read as a face at a
 * glance, even at the 150px size used in the onboarding preview. Wings frame
 * the silhouette rather than competing with it.
 *
 * `hurt` flashes and shakes the body when a quest lands damage; `defeated`
 * slumps the head, dims the eyes and drops the wings.
 */

const OUTLINE = "#22103A";

export function DragonSvg({
  className,
  width = 320,
  hurt = false,
  defeated = false,
}: {
  className?: string;
  width?: number;
  hurt?: boolean;
  defeated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 320 280"
      width={width}
      height={(width * 280) / 320}
      className={className}
      role="img"
      aria-label="The Procrastination Dragon"
    >
      <defs>
        <linearGradient id="drgBody" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#C79BFF" />
          <stop offset="46%" stopColor="#8C4BD6" />
          <stop offset="100%" stopColor="#4A1E7D" />
        </linearGradient>
        <linearGradient id="drgSnout" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B07EEE" />
          <stop offset="100%" stopColor="#5F2A9E" />
        </linearGradient>
        <linearGradient id="drgBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2E2FF" />
          <stop offset="100%" stopColor="#BE95E4" />
        </linearGradient>
        <linearGradient id="drgWing" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#7E45C4" />
          <stop offset="100%" stopColor="#33125C" />
        </linearGradient>
        <linearGradient id="drgHorn" x1="0" y1="1" x2="0.2" y2="0">
          <stop offset="0%" stopColor="#9E86BC" />
          <stop offset="45%" stopColor="#DCCDEE" />
          <stop offset="100%" stopColor="#FBF6FF" />
        </linearGradient>
        <radialGradient id="drgSmoke" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7A64A0" stopOpacity=".5" />
          <stop offset="100%" stopColor="#7A64A0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* smoke haze + contact shadow */}
      <ellipse cx="160" cy="212" rx="140" ry="48" fill="url(#drgSmoke)" />
      <ellipse cx="160" cy="262" rx="82" ry="12" fill="#000" opacity=".3" />

      <g
        className={hurt ? "animate-shake" : undefined}
        style={hurt ? { filter: "brightness(1.55) saturate(1.35)" } : undefined}
      >
        {/* ========================================================== wings */}
        <g
          className={defeated ? undefined : "origin-[196px_150px] animate-sway"}
          style={{ animationDuration: "5s" }}
        >
          {/* right wing */}
          <path
            d="M204 150c30-16 58-42 74-76 4 18 2 34-4 48 14-8 24-20 30-34 4 22-2 42-16 58 12-2 22-8 30-16-8 26-30 44-60 52z"
            fill="url(#drgWing)"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M212 148c22-8 44-24 62-46M216 160c22-2 44-10 62-24M220 172c18 4 38 2 56-6"
            stroke="#2A0F4E"
            strokeWidth="3"
            fill="none"
            opacity=".5"
            strokeLinecap="round"
          />
        </g>
        <g
          className={defeated ? undefined : "origin-[124px_150px] animate-sway"}
          style={{ animationDuration: "5s", animationDelay: "-2.5s" }}
        >
          {/* left wing */}
          <path
            d="M116 150c-30-16-58-42-74-76-4 18-2 34 4 48-14-8-24-20-30-34-4 22 2 42 16 58-12-2-22-8-30-16 8 26 30 44 60 52z"
            fill="url(#drgWing)"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M108 148c-22-8-44-24-62-46M104 160c-22-2-44-10-62-24M100 172c-18 4-38 2-56-6"
            stroke="#2A0F4E"
            strokeWidth="3"
            fill="none"
            opacity=".5"
            strokeLinecap="round"
          />
        </g>

        {/* =========================================================== tail */}
        <path
          d="M118 214c-30 14-58 12-84-6 22 4 42 0 58-12 12-9 24-9 32 0z"
          fill="url(#drgBody)"
          stroke={OUTLINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M36 206l-18-14 4 20-20 4 18 10"
          fill="#8C4BD6"
          stroke={OUTLINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* =========================================================== body */}
        {/* back spines, behind the body so they break the silhouette */}
        <g fill="url(#drgHorn)" stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round">
          <path d="M112 176l-20-16 24-6z" />
          <path d="M100 206l-24-10 22-14z" />
        </g>

        <ellipse cx="160" cy="200" rx="62" ry="52" fill="url(#drgBody)" stroke={OUTLINE} strokeWidth="4.5" />
        <ellipse cx="162" cy="214" rx="40" ry="34" fill="url(#drgBelly)" />
        <path
          d="M126 204h72M128 220h68M134 234h56"
          stroke="#AC85D2"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".6"
        />

        {/* legs + claws */}
        <path d="M118 240c-6 12-2 22 10 24h20l-4-26z" fill="#7A3EC0" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
        <path d="M202 240c6 12 2 22-10 24h-20l4-26z" fill="#7A3EC0" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
        <g stroke={OUTLINE} strokeWidth="2.6" fill="#F2E2FF">
          <path d="M122 258h8v7h-8zM134 258h8v7h-8zM146 258h8v7h-8z" />
          <path d="M166 258h8v7h-8zM178 258h8v7h-8zM190 258h8v7h-8z" />
        </g>

        {/* =========================================================== head */}
        <g transform={defeated ? "translate(0 18) rotate(11 160 110)" : undefined}>
          {/* horns — big, tapered, sweeping up and back */}
          <path
            d="M126 74C104 62 88 38 86 6c22 14 40 36 50 58z"
            fill="url(#drgHorn)"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M194 72c16-14 26-38 24-66-20 18-34 42-38 62z"
            fill="url(#drgHorn)"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* horn ridges */}
          <path
            d="M98 22c10 14 20 28 26 42M206 20c-8 16-14 30-16 44"
            stroke="#9E86BC"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* ear fins */}
          <path
            d="M104 108c-22-6-38 0-48 16 18 8 36 8 52 0z"
            fill="#7A3EC0"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M216 108c22-6 38 0 48 16-18 8-36 8-52 0z"
            fill="#7A3EC0"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* skull */}
          <path
            d="M160 46c40 0 66 26 66 60 0 20-10 38-26 48h-80c-16-10-26-28-26-48 0-34 26-60 66-60z"
            fill="url(#drgBody)"
            stroke={OUTLINE}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* muzzle */}
          <path
            d="M124 116h72c6 0 10 5 10 11 0 18-16 33-46 33s-46-15-46-33c0-6 4-11 10-11z"
            fill="url(#drgSnout)"
            stroke={OUTLINE}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* muzzle top plane */}
          <path
            d="M126 118h68c4 0 7 3 7 8H119c0-5 3-8 7-8z"
            fill="#C79BFF"
            opacity=".6"
          />
          {/* nostrils */}
          <ellipse cx="146" cy="132" rx="4.6" ry="3.4" fill={OUTLINE} />
          <ellipse cx="174" cy="132" rx="4.6" ry="3.4" fill={OUTLINE} />

          {/* mouth line + fangs */}
          <path
            d="M124 142c10 8 22 12 36 12s26-4 36-12"
            stroke={OUTLINE}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <g fill="#FFF7D6" stroke={OUTLINE} strokeWidth="2.6" strokeLinejoin="round">
            <path d="M132 145l4 14 6-12z" />
            <path d="M178 143l6 12 4-14z" />
          </g>

          {/* brow ridge — the whole "menace" read lives here */}
          <path
            d="M104 92c14-14 32-20 56-20s42 6 56 20l-6 16c-14-12-30-18-50-18s-36 6-50 18z"
            fill="#5A2596"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* eyes */}
          {defeated ? (
            <g stroke={OUTLINE} strokeWidth="5.5" strokeLinecap="round">
              <path d="M120 100l18 14M138 100l-18 14" />
              <path d="M182 100l18 14M200 100l-18 14" />
            </g>
          ) : (
            <>
              <ellipse cx="130" cy="106" rx="15" ry="17" fill="#FFE680" stroke={OUTLINE} strokeWidth="4" />
              <ellipse cx="132" cy="106" rx="5" ry="13" fill="#22103A" />
              <circle cx="125" cy="99" r="3.6" fill="#FFFFFF" opacity=".92" />

              <ellipse cx="190" cy="106" rx="15" ry="17" fill="#FFE680" stroke={OUTLINE} strokeWidth="4" />
              <ellipse cx="192" cy="106" rx="5" ry="13" fill="#22103A" />
              <circle cx="185" cy="99" r="3.6" fill="#FFFFFF" opacity=".92" />
            </>
          )}

          {/* head crest spikes along the crown */}
          <g fill="url(#drgHorn)" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round">
            <path d="M148 44l6-16 6 16z" />
            <path d="M162 44l6-16 6 16z" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Small dragon head used as an icon on the raid button and boss chips. */
export function DragonHeadIcon({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="dhBody" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#C79BFF" />
          <stop offset="100%" stopColor="#5A2596" />
        </linearGradient>
      </defs>
      {/* horns */}
      <path d="M8 8C5 6 3.4 2.6 3.2 0c3 1.6 5.4 4.6 6.4 7.4z" fill="#DCCDEE" stroke="#22103A" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M24 8c2.4-2 4-5.4 4.2-8-3 1.6-5.4 4.6-6.4 7.4z" fill="#DCCDEE" stroke="#22103A" strokeWidth="1.8" strokeLinejoin="round" />
      {/* skull */}
      <path d="M16 5c7 0 11.4 4.6 11.4 10.6 0 4-2 7.2-5 9H9.6c-3-1.8-5-5-5-9C4.6 9.6 9 5 16 5z" fill="url(#dhBody)" stroke="#22103A" strokeWidth="2" strokeLinejoin="round" />
      {/* muzzle */}
      <path d="M9.4 18h13.2c1 0 1.8 1 1.8 2.2 0 3.4-3.2 6-8.4 6s-8.4-2.6-8.4-6c0-1.2.8-2.2 1.8-2.2z" fill="#5F2A9E" stroke="#22103A" strokeWidth="2" strokeLinejoin="round" />
      {/* eyes */}
      <ellipse cx="11.8" cy="14" rx="2.8" ry="3.2" fill="#FFE680" stroke="#22103A" strokeWidth="1.6" />
      <ellipse cx="12.2" cy="14" rx="1" ry="2.4" fill="#22103A" />
      <ellipse cx="20.2" cy="14" rx="2.8" ry="3.2" fill="#FFE680" stroke="#22103A" strokeWidth="1.6" />
      <ellipse cx="20.6" cy="14" rx="1" ry="2.4" fill="#22103A" />
      {/* fangs */}
      <g fill="#FFF7D6" stroke="#22103A" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M10.6 23l1.2 3.4 1.4-3z" />
        <path d="M19 22.6l1.4 3 1.2-3.4z" />
      </g>
    </svg>
  );
}
