/**
 * The four Guardians — LifeClash's original hero characters.
 *
 * Every path here is authored from scratch for this project. They share a
 * common silhouette language (broad shoulders, heavy boots, oversized prop,
 * dark outline) so the roster reads as one family, and each one carries the
 * palette of its life pillar.
 *
 * Drawn at 200x260 with feet at y≈246 so they can be dropped onto the floating
 * grass islands on the landing page at any scale.
 */

import type { GuardianId } from "@/types/game";

export interface GuardianArtProps {
  className?: string;
  width?: number;
  /** Adds the soft contact shadow under the feet. */
  shadow?: boolean;
}

const OUTLINE = "#2A1608";

function Base({
  children,
  className,
  width = 200,
  shadow = true,
  idPrefix,
}: GuardianArtProps & { children: React.ReactNode; idPrefix: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      width={width}
      height={(width * 260) / 200}
      className={className}
      role="img"
      aria-hidden="true"
    >
      {shadow ? (
        <ellipse cx="100" cy="248" rx="52" ry="11" fill="#000000" opacity=".26" />
      ) : null}
      <g id={idPrefix}>{children}</g>
    </svg>
  );
}

/* ========================================================================== */
/* THE SCHOLAR — Academy · Mind. Hooded sage with a glowing rune-book.          */
/* ========================================================================== */

export function ScholarSvg(props: GuardianArtProps) {
  return (
    <Base {...props} idPrefix="scholar">
      <defs>
        <linearGradient id="schRobe" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#6E7DF0" />
          <stop offset="55%" stopColor="#4453C6" />
          <stop offset="100%" stopColor="#232C7E" />
        </linearGradient>
        <linearGradient id="schHood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A97FF" />
          <stop offset="100%" stopColor="#3A46A8" />
        </linearGradient>
        <radialGradient id="schGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B4F6FF" stopOpacity=".95" />
          <stop offset="60%" stopColor="#5FE8FF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#5FE8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* arcane aura behind */}
      <circle cx="100" cy="120" r="74" fill="url(#schGlow)" opacity=".5" />

      {/* boots */}
      <path d="M62 218h30v26H58c-4 0-6-3-4-6z" fill="#2E2352" stroke={OUTLINE} strokeWidth="3" />
      <path d="M108 218h30l8 20c2 3 0 6-4 6h-34z" fill="#2E2352" stroke={OUTLINE} strokeWidth="3" />

      {/* robe */}
      <path
        d="M100 62c26 0 40 18 44 44l10 74c2 14-6 24-20 24H66c-14 0-22-10-20-24l10-74c4-26 18-44 44-44z"
        fill="url(#schRobe)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      {/* robe fold shading */}
      <path d="M100 74c-14 0-22 10-25 26l-8 62h20l6-56z" fill="#FFFFFF" opacity=".13" />
      {/* hem trim */}
      <path d="M52 196h96l-2 14H54z" fill="#5FE8FF" opacity=".55" stroke={OUTLINE} strokeWidth="2.5" />

      {/* sash */}
      <path d="M64 118h72l-4 16H68z" fill="#F5C542" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="100" cy="126" r="7" fill="#5FE8FF" stroke={OUTLINE} strokeWidth="2.5" />

      {/* left arm holding book */}
      <path d="M58 120c-10 6-14 18-10 28l6 14 20-8-8-20z" fill="#4453C6" stroke={OUTLINE} strokeWidth="3.5" />

      {/* rune-book */}
      <g transform="translate(36 150) rotate(-8)">
        <circle cx="26" cy="14" r="30" fill="url(#schGlow)" />
        <path d="M0 0h52v30H0z" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3" />
        <path d="M4 3h20v24H4z" fill="#FFF7D6" />
        <path d="M28 3h20v24H28z" fill="#F1E4BE" />
        <path d="M24 0h4v30h-4z" fill="#5A3417" />
        <path d="M8 9h12M8 14h12M8 19h9" stroke="#8A97FF" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 9h12M32 14h12M32 19h9" stroke="#8A97FF" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* right arm raised, casting */}
      <path d="M142 118c12 4 18 14 16 26l-4 16-20-6 6-20z" fill="#4453C6" stroke={OUTLINE} strokeWidth="3.5" />
      {/* rune sparks */}
      <g fill="#5FE8FF">
        <circle cx="160" cy="104" r="4" opacity=".95" />
        <circle cx="172" cy="88" r="3" opacity=".8" />
        <circle cx="152" cy="84" r="2.4" opacity=".7" />
      </g>

      {/* ------------------------------------------------------- head & hood */}
      {/* Painted back-to-front: mantle → hood → face → features → brim, so the
          brim casts a real overhang and the beard sits on top of the mantle. */}

      {/* mantle draping onto the shoulders */}
      <path
        d="M66 58c6 14 19 22 34 22s28-8 34-22c5 20-13 36-34 36s-39-16-34-36z"
        fill="#3A46A8"
        stroke={OUTLINE}
        strokeWidth="3.5"
      />

      {/* Cowl: a peaked hood, tapering to a point that flicks back to the
          right. Narrow enough to read as cloth rather than a helmet. */}
      <path
        d="M100 12c-19 0-31 13-33 31-1 9 1 17 5 23l6 9h44l6-9c4-6 6-14 5-23-2-18-14-31-33-31z"
        fill="url(#schHood)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      {/* hood point trailing back and down — a cloth tail, not a topknot */}
      <path
        d="M130 26c14-4 26 6 26 20 0 12-10 20-19 18 1-14-2-27-7-38z"
        fill="#4453C6"
        stroke={OUTLINE}
        strokeWidth="3.5"
      />

      {/* face — visible skin, so he reads as a person under the hood */}
      <path
        d="M100 30c11 0 19 8 19 19 0 13-8 24-19 24s-19-11-19-24c0-11 8-19 19-19z"
        fill="#EBC49A"
        stroke={OUTLINE}
        strokeWidth="3"
      />
      {/* hood shadow falling across the brow */}
      <path
        d="M81 47c0-11 8-19 19-19s19 8 19 19c0 3 0 5-1 8H82c-1-3-1-5-1-8z"
        fill="#2B2F63"
        opacity=".72"
      />
      {/* eyes, glowing under the brim */}
      <ellipse cx="92" cy="52" rx="4" ry="3.4" fill="#0F1533" />
      <ellipse cx="108" cy="52" rx="4" ry="3.4" fill="#0F1533" />
      <circle cx="92" cy="51.4" r="1.9" fill="#7DF0FF" />
      <circle cx="108" cy="51.4" r="1.9" fill="#7DF0FF" />
      {/* nose */}
      <path d="M100 55v6" stroke="#C9A176" strokeWidth="2.6" strokeLinecap="round" />

      {/* trimmed white sage beard — short enough to keep the face readable */}
      <path
        d="M86 60c2 6 7 10 14 10s12-4 14-10c2 9 0 17-4 22-3 3-17 3-20 0-4-5-6-13-4-22z"
        fill="#EDE7F5"
        stroke={OUTLINE}
        strokeWidth="3"
      />
      <path d="M95 68c3 1.4 7 1.4 10 0-1 6-2 10-5 13-3-3-4-7-5-13z" fill="#CFC6E4" opacity=".65" />

      {/* hood brim — the overhang that shades the brow */}
      <path
        d="M65 46c4-19 16-31 35-31s31 12 35 31c-7-9-19-14-35-14s-28 5-35 14z"
        fill="#5A69E8"
        stroke={OUTLINE}
        strokeWidth="4"
      />
    </Base>
  );
}

/* ========================================================================== */
/* THE WARRIOR — Training Grounds · Body. Armored champion, hammer/kettlebell.  */
/* ========================================================================== */

export function WarriorSvg(props: GuardianArtProps) {
  return (
    <Base {...props} idPrefix="warrior">
      <defs>
        <linearGradient id="warArmor" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#EFF4F7" />
          <stop offset="52%" stopColor="#B4C0C7" />
          <stop offset="100%" stopColor="#6C7B84" />
        </linearGradient>
        <linearGradient id="warCape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0655C" />
          <stop offset="100%" stopColor="#8E1C18" />
        </linearGradient>
        <linearGradient id="warSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6C08D" />
          <stop offset="100%" stopColor="#D89A62" />
        </linearGradient>
      </defs>

      {/* cape */}
      <path
        d="M56 76c-16 24-20 74-10 126h108c10-52 6-102-10-126z"
        fill="url(#warCape)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      <path d="M62 84c-10 22-12 66-6 110h18c-6-42-6-84-2-104z" fill="#FFFFFF" opacity=".16" />

      {/* legs + boots */}
      <path d="M74 176h20v40H70c-5 0-7-4-4-8z" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M106 176h20l8 32c3 4 1 8-4 8h-24z" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M62 214h40v14c0 4-3 6-7 6H60c-4 0-6-3-4-7z" fill="#4D2815" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M104 214h40l6 13c2 4 0 7-4 7h-35c-4 0-7-2-7-6z" fill="#4D2815" stroke={OUTLINE} strokeWidth="3.5" />
      {/* knee guards */}
      <ellipse cx="84" cy="182" rx="13" ry="9" fill="url(#warArmor)" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="118" cy="182" rx="13" ry="9" fill="url(#warArmor)" stroke={OUTLINE} strokeWidth="3" />

      {/* torso plate */}
      <path
        d="M100 66c24 0 38 14 40 36l4 44c1 12-8 22-20 22H76c-12 0-21-10-20-22l4-44c2-22 16-36 40-36z"
        fill="url(#warArmor)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      {/* abs / plate seams */}
      <path d="M100 84v76M78 108h44M76 130h48" stroke="#7C8B94" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      {/* chest emblem */}
      <path d="M100 92l12 8v12l-12 8-12-8v-12z" fill="#E0453F" stroke={OUTLINE} strokeWidth="3" />

      {/* belt */}
      <path d="M58 152h84l-2 18H60z" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3.5" />
      <rect x="88" y="152" width="24" height="18" rx="4" fill="#F5C542" stroke={OUTLINE} strokeWidth="3" />

      {/* pauldrons */}
      <path d="M50 74c-14 2-22 12-22 26 0 8 4 14 10 16l22-8-4-32z" fill="url(#warArmor)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M150 74c14 2 22 12 22 26 0 8-4 14-10 16l-22-8 4-32z" fill="url(#warArmor)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M32 90c8-6 18-6 24 0" stroke="#E0453F" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M144 90c6-6 16-6 24 0" stroke="#E0453F" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* right arm gripping hammer */}
      <path d="M154 112c8 8 8 20 0 28l-8 8-16-14 10-18z" fill="url(#warSkin)" stroke={OUTLINE} strokeWidth="3.5" />

      {/* war-hammer — shifted out and down so the head stays clear of the face */}
      <g transform="translate(162 62) rotate(12)">
        <rect x="6" y="18" width="9" height="104" rx="4" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3.5" />
        <rect x="2" y="106" width="17" height="12" rx="4" fill="#4D2815" stroke={OUTLINE} strokeWidth="3" />
        <path d="M-14 0h49c5 0 8 3 8 8v24c0 5-3 8-8 8h-49c-5 0-8-3-8-8V8c0-5 3-8 8-8z" fill="url(#warArmor)" stroke={OUTLINE} strokeWidth="4" />
        <path d="M-12 4h45v10h-45z" fill="#FFFFFF" opacity=".45" />
        <circle cx="10" cy="20" r="5" fill="#E0453F" stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* left fist */}
      <path d="M46 116c-8 8-8 20 0 28l8 8 16-14-10-18z" fill="url(#warSkin)" stroke={OUTLINE} strokeWidth="3.5" />

      {/* head */}
      <circle cx="100" cy="42" r="26" fill="url(#warSkin)" stroke={OUTLINE} strokeWidth="4" />
      {/* beard */}
      <path d="M78 46c0 18 10 28 22 28s22-10 22-28c-6 8-14 12-22 12s-16-4-22-12z" fill="#D8623A" stroke={OUTLINE} strokeWidth="3" />
      {/* eyes + brow */}
      <ellipse cx="91" cy="38" rx="3.4" ry="4.2" fill="#2A1608" />
      <ellipse cx="109" cy="38" rx="3.4" ry="4.2" fill="#2A1608" />
      <path d="M83 29l14 4M117 29l-14 4" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
      {/* helm dome */}
      <path d="M72 30c0-16 12-26 28-26s28 10 28 26c-8-8-17-12-28-12s-20 4-28 12z" fill="url(#warArmor)" stroke={OUTLINE} strokeWidth="4" />
      {/* helm browband */}
      <path d="M70 26h60l3 8H67z" fill="#B4C0C7" stroke={OUTLINE} strokeWidth="3" />
      {/* swept-back cheek wings — read as armour plates, not ears */}
      <path d="M70 30l-16 8 4 12 14-8z" fill="#D7DEE3" stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M130 30l16 8-4 12-14-8z" fill="#D7DEE3" stroke={OUTLINE} strokeWidth="3.5" strokeLinejoin="round" />
      {/* mohawk crest running front-to-back */}
      <path d="M92 8c5-6 11-6 16 0 3 4 4 10 3 16H89c-1-6 0-12 3-16z" fill="#E0453F" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M97 9c2-2 4-2 6 0 1 3 2 8 1 13h-8c-1-5 0-10 1-13z" fill="#FF8478" opacity=".65" />
      {/* rivets on the browband */}
      <g fill="#7C8B94">
        <circle cx="80" cy="30" r="2.2" />
        <circle cx="100" cy="30" r="2.2" />
        <circle cx="120" cy="30" r="2.2" />
      </g>
    </Base>
  );
}

/* ========================================================================== */
/* THE MERCHANT — Treasury · Wealth. Golden-robed treasurer with coin-scales.   */
/* ========================================================================== */

export function MerchantSvg(props: GuardianArtProps) {
  return (
    <Base {...props} idPrefix="merchant">
      <defs>
        <linearGradient id="merRobe" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="50%" stopColor="#F0B429" />
          <stop offset="100%" stopColor="#9E6A0A" />
        </linearGradient>
        <linearGradient id="merSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFC49A" />
          <stop offset="100%" stopColor="#CFA173" />
        </linearGradient>
        <linearGradient id="merGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4CD98C" />
          <stop offset="100%" stopColor="#187A47" />
        </linearGradient>
      </defs>

      {/* long robe */}
      <path
        d="M100 60c28 0 42 20 46 48l10 78c2 12-6 20-18 20H62c-12 0-20-8-18-20l10-78c4-28 18-48 46-48z"
        fill="url(#merRobe)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      <path d="M100 72c-16 0-25 12-28 30l-9 68h20l7-62z" fill="#FFFFFF" opacity=".2" />
      {/* emerald hem */}
      <path d="M46 186h108l-2 18H48z" fill="url(#merGreen)" stroke={OUTLINE} strokeWidth="3.5" />
      {/* coin trim on hem */}
      <g fill="#FFE680" stroke={OUTLINE} strokeWidth="2">
        <circle cx="64" cy="195" r="5" />
        <circle cx="86" cy="195" r="5" />
        <circle cx="114" cy="195" r="5" />
        <circle cx="136" cy="195" r="5" />
      </g>

      {/* collar / mantle */}
      <path d="M66 62c10 14 22 20 34 20s24-6 34-20c4 22-14 38-34 38s-38-16-34-38z" fill="url(#merGreen)" stroke={OUTLINE} strokeWidth="4" />
      {/* medallion */}
      <circle cx="100" cy="104" r="14" fill="#FFE680" stroke={OUTLINE} strokeWidth="3.5" />
      <circle cx="100" cy="104" r="7" fill="#F0B429" stroke={OUTLINE} strokeWidth="2" />

      {/* sash of coins across chest */}
      <path d="M72 116l58 34-8 14-58-34z" fill="#9E6A0A" stroke={OUTLINE} strokeWidth="3" opacity=".9" />

      {/* left arm holding the scales */}
      <path d="M54 112c-10 8-12 20-6 30l6 10 18-12-8-18z" fill="url(#merRobe)" stroke={OUTLINE} strokeWidth="3.5" />

      {/* coin-scales */}
      <g transform="translate(18 82)">
        {/* stand */}
        <rect x="30" y="8" width="6" height="60" rx="3" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3" />
        {/* beam */}
        <rect x="-2" y="6" width="70" height="6" rx="3" fill="#C88712" stroke={OUTLINE} strokeWidth="3" />
        {/* chains */}
        <path d="M4 12v14M62 12v20" stroke={OUTLINE} strokeWidth="2.5" />
        {/* left pan (heavier — coins) */}
        <path d="M-8 26h24c2 0 3 2 2 4l-5 10c-1 2-2 3-4 3H1c-2 0-3-1-4-3l-5-10c-1-2 0-4 2-4z" fill="#B4C0C7" stroke={OUTLINE} strokeWidth="3" />
        <circle cx="1" cy="26" r="5" fill="#FFE680" stroke={OUTLINE} strokeWidth="2" />
        <circle cx="10" cy="27" r="5" fill="#FFD447" stroke={OUTLINE} strokeWidth="2" />
        {/* right pan */}
        <path d="M50 32h24c2 0 3 2 2 4l-5 10c-1 2-2 3-4 3H59c-2 0-3-1-4-3l-5-10c-1-2 0-4 2-4z" fill="#B4C0C7" stroke={OUTLINE} strokeWidth="3" />
        {/* pivot gem */}
        <circle cx="33" cy="9" r="6" fill="url(#merGreen)" stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* right arm, palm up with a floating coin */}
      <path d="M146 112c10 8 12 20 6 30l-6 10-18-12 8-18z" fill="url(#merRobe)" stroke={OUTLINE} strokeWidth="3.5" />
      <circle cx="158" cy="96" r="12" fill="#FFE680" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="158" cy="96" r="6" fill="#F0B429" />
      <g fill="#4CD98C" opacity=".9">
        <circle cx="174" cy="78" r="3.4" />
        <circle cx="146" cy="72" r="2.6" />
      </g>

      {/* head */}
      <circle cx="100" cy="40" r="25" fill="url(#merSkin)" stroke={OUTLINE} strokeWidth="4" />
      {/* moustache + beard */}
      <path d="M84 48c4 4 10 6 16 6s12-2 16-6c-2 14-8 22-16 22s-14-8-16-22z" fill="#E8E2D2" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="91" cy="37" rx="3.2" ry="4" fill="#2A1608" />
      <ellipse cx="109" cy="37" rx="3.2" ry="4" fill="#2A1608" />
      {/* turban / hat */}
      <path d="M74 30c0-16 12-26 26-26s26 10 26 26c-6-10-15-14-26-14s-20 4-26 14z" fill="url(#merRobe)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M72 28h56l3 8H69z" fill="#187A47" stroke={OUTLINE} strokeWidth="3" />
      {/* hat gem + feather */}
      <circle cx="100" cy="14" r="7" fill="url(#merGreen)" stroke={OUTLINE} strokeWidth="3" />
      <path d="M126 20c14-10 24-6 26 4-10 0-18 4-24 10z" fill="#4CD98C" stroke={OUTLINE} strokeWidth="3" />
    </Base>
  );
}

/* ========================================================================== */
/* THE SENTINEL — Defense Tower · Discipline. Shield-and-torch watch-guardian.  */
/* ========================================================================== */

export function SentinelSvg(props: GuardianArtProps) {
  return (
    <Base {...props} idPrefix="sentinel">
      <defs>
        <linearGradient id="senArmor" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#7FC0F5" />
          <stop offset="52%" stopColor="#3E8BE0" />
          <stop offset="100%" stopColor="#1B4276" />
        </linearGradient>
        <linearGradient id="senSteel" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#F2F7FA" />
          <stop offset="100%" stopColor="#8A99A3" />
        </linearGradient>
        <linearGradient id="senTorch" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF6B2C" />
          <stop offset="55%" stopColor="#FF9A3C" />
          <stop offset="100%" stopColor="#FFE680" />
        </linearGradient>
        <radialGradient id="senGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC46E" stopOpacity=".9" />
          <stop offset="100%" stopColor="#FF9A3C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* torch glow */}
      <circle cx="156" cy="58" r="52" fill="url(#senGlow)" opacity=".7" />

      {/* legs + boots */}
      <path d="M76 178h20v38H72c-5 0-7-4-4-8z" fill="#1B4276" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M104 178h20l8 30c3 4 1 8-4 8h-24z" fill="#1B4276" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M64 214h38v14c0 4-3 6-7 6H62c-4 0-6-3-4-7z" fill="#123055" stroke={OUTLINE} strokeWidth="3.5" />
      <path d="M104 214h38l6 13c2 4 0 7-4 7h-33c-4 0-7-2-7-6z" fill="#123055" stroke={OUTLINE} strokeWidth="3.5" />

      {/* torso */}
      <path
        d="M100 64c24 0 38 14 40 36l4 42c1 12-8 22-20 22H76c-12 0-21-10-20-22l4-42c2-22 16-36 40-36z"
        fill="url(#senArmor)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      {/* segmented plates */}
      <path d="M62 110h76M60 128h80M60 146h80" stroke="#1B4276" strokeWidth="3" opacity=".55" strokeLinecap="round" />
      {/* torch emblem on chest */}
      <path d="M100 88c6 8 4 12 2 15 4 2 6 5 6 9 0 5-4 9-8 9s-8-4-8-9c0-5 3-9 8-15z" fill="#FF9A3C" stroke={OUTLINE} strokeWidth="3" />

      {/* belt */}
      <path d="M58 154h84l-2 16H60z" fill="#123055" stroke={OUTLINE} strokeWidth="3.5" />
      <rect x="90" y="154" width="20" height="16" rx="4" fill="#FF9A3C" stroke={OUTLINE} strokeWidth="3" />

      {/* pauldrons */}
      <path d="M52 72c-14 2-22 12-22 26 0 8 4 14 10 16l22-8-4-34z" fill="url(#senSteel)" stroke={OUTLINE} strokeWidth="4" />
      <path d="M148 72c14 2 22 12 22 26 0 8-4 14-10 16l-22-8 4-34z" fill="url(#senSteel)" stroke={OUTLINE} strokeWidth="4" />

      {/* left arm behind the shield */}
      <path d="M46 114c-8 8-8 20 0 28l8 8 16-14-10-18z" fill="url(#senArmor)" stroke={OUTLINE} strokeWidth="3.5" />

      {/* tower shield */}
      <g transform="translate(6 90)">
        <path d="M34 0 68 8v52c0 26-18 44-34 52C18 104 0 86 0 60V8z" fill="#0F2A4A" />
        <path d="M34 8 60 14v46c0 21-14 36-26 43C22 96 8 81 8 60V14z" fill="url(#senSteel)" />
        <path d="M34 8 60 14v12C52 21 43 19 34 19s-18 2-26 7V14z" fill="#FFFFFF" opacity=".4" />
        {/* torch sigil */}
        <path d="M34 30c6 8 4 13 2 16 4 2 7 6 7 10 0 6-4 10-9 10s-9-4-9-10c0-6 4-11 9-16z" fill="#FF9A3C" stroke={OUTLINE} strokeWidth="3" />
        {/* rivets */}
        <g fill="#5C6A73">
          <circle cx="16" cy="26" r="2.6" />
          <circle cx="52" cy="26" r="2.6" />
          <circle cx="16" cy="66" r="2.6" />
          <circle cx="52" cy="66" r="2.6" />
        </g>
      </g>

      {/* right arm raising the torch */}
      <path d="M150 106c10 6 14 16 10 26l-6 14-18-10 8-20z" fill="url(#senArmor)" stroke={OUTLINE} strokeWidth="3.5" />

      {/* torch */}
      <g transform="translate(146 20)">
        <rect x="6" y="52" width="10" height="52" rx="4" fill="#7A4A22" stroke={OUTLINE} strokeWidth="3.5" />
        <path d="M0 44h22c3 0 5 2 4 5l-3 8c-1 2-2 3-4 3H3c-2 0-3-1-4-3l-3-8c-1-3 1-5 4-5z" fill="url(#senSteel)" stroke={OUTLINE} strokeWidth="3.5" />
        <path
          d="M11 0c6 10 4 15 1 19-2 3-4 6-2 10 1 2-1 4-3 3-4-3-6-7-5-12-5 5-8 11-8 16 0 8 8 15 17 15s17-7 17-15C28 24 18 14 11 0z"
          fill="url(#senTorch)"
          stroke={OUTLINE}
          strokeWidth="3"
          className="origin-bottom animate-flame-flicker"
        />
      </g>

      {/* head + great helm */}
      <circle cx="100" cy="42" r="25" fill="#E8B98C" stroke={OUTLINE} strokeWidth="4" />
      <path
        d="M74 40c0-16 12-28 26-28s26 12 26 28v6H74z"
        fill="url(#senSteel)"
        stroke={OUTLINE}
        strokeWidth="4"
      />
      {/* visor slit */}
      <path d="M78 40h44v10a22 22 0 0 1-44 0z" fill="url(#senSteel)" stroke={OUTLINE} strokeWidth="3.5" />
      <rect x="82" y="42" width="36" height="6" rx="3" fill="#0E1C2E" />
      <circle cx="92" cy="45" r="2.2" fill="#7FE3FF" />
      <circle cx="108" cy="45" r="2.2" fill="#7FE3FF" />
      {/* breathing holes */}
      <g fill="#0E1C2E">
        <circle cx="94" cy="56" r="1.8" />
        <circle cx="100" cy="58" r="1.8" />
        <circle cx="106" cy="56" r="1.8" />
      </g>
      {/* plume */}
      <path d="M94 12h12l4 8H90z" fill="#FF9A3C" stroke={OUTLINE} strokeWidth="3" />
      <path d="M100 0c10 4 14 12 12 20-6-6-12-8-18-6 0-6 2-11 6-14z" fill="#FF9A3C" stroke={OUTLINE} strokeWidth="3" />
    </Base>
  );
}

/* ========================================================================== */

export const GUARDIAN_ART: Record<
  GuardianId,
  (props: GuardianArtProps) => JSX.Element
> = {
  scholar: ScholarSvg,
  warrior: WarriorSvg,
  merchant: MerchantSvg,
  sentinel: SentinelSvg,
};

export function GuardianArt({
  id,
  ...props
}: GuardianArtProps & { id: GuardianId }) {
  const Cmp = GUARDIAN_ART[id] ?? ScholarSvg;
  return <Cmp {...props} />;
}
