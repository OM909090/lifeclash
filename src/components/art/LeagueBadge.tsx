import { cn } from "@/lib/utils";
import { leagueById, leagueFor } from "@/lib/game-config";
import type { LeagueId } from "@/types/game";

/**
 * Consistency-Trophy league badge: a shield plate with a trophy glyph and an
 * ordinal pip row. Colour comes from the league token table.
 */
export function LeagueBadge({
  league,
  trophies,
  size = 44,
  showName = false,
  className,
}: {
  league?: LeagueId;
  /** When provided, the league is derived from the trophy count. */
  trophies?: number;
  size?: number;
  showName?: boolean;
  className?: string;
}) {
  const l =
    league !== undefined
      ? leagueById(league)
      : leagueFor(trophies ?? 0);

  const gid = `lg_${l.id}`;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 48 52"
        width={size}
        height={(size * 52) / 48}
        className="shrink-0 drop-shadow-sprite"
        role="img"
        aria-label={`${l.name} League`}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor={l.from} />
            <stop offset="100%" stopColor={l.to} />
          </linearGradient>
        </defs>

        {/* shield outline */}
        <path
          d="M24 1.5 45.5 7v20.6C45.5 39.4 36 47.6 24 50.5 12 47.6 2.5 39.4 2.5 27.6V7z"
          fill={l.ring}
        />
        <path
          d="M24 4.6 42.4 9.4v18.2c0 9.9-8 16.9-18.4 19.5C13.6 44.5 5.6 37.5 5.6 27.6V9.4z"
          fill={`url(#${gid})`}
        />
        {/* top gloss */}
        <path
          d="M24 4.6 42.4 9.4v6.2C36.2 12.4 30.3 11 24 11s-12.2 1.4-18.4 4.6V9.4z"
          fill="#FFFFFF"
          opacity=".3"
        />

        {/* trophy glyph */}
        <g transform="translate(24 25)">
          <path
            d="M-7 -9h14v5.4c0 3.8-3.1 6.9-7 6.9s-7-3.1-7-6.9z"
            fill={l.ring}
            opacity=".55"
          />
          <path
            d="M-6 -8h12v4.6c0 3.2-2.7 5.8-6 5.8s-6-2.6-6-5.8z"
            fill="#FFF7D6"
            opacity=".92"
          />
          <rect x="-1.4" y="2" width="2.8" height="4" rx="1" fill="#FFF7D6" opacity=".92" />
          <rect x="-5" y="6" width="10" height="2.6" rx="1.3" fill="#FFF7D6" opacity=".92" />
        </g>

        {/* rank pips — one per league step reached */}
        <g transform="translate(24 42)">
          {Array.from({ length: 3 }, (_, i) => {
            const idx = ["WOOD", "STONE", "BRONZE", "SILVER", "GOLD", "CRYSTAL", "LEGEND"].indexOf(l.id);
            const filled = i <= Math.min(2, Math.floor(idx / 2.4));
            return (
              <circle
                key={i}
                cx={(i - 1) * 6}
                cy={0}
                r={2}
                fill="#FFF7D6"
                opacity={filled ? 0.95 : 0.32}
              />
            );
          })}
        </g>
      </svg>

      {showName ? (
        <span className="flex flex-col leading-none">
          <span className="text-outline-xs text-sm">{l.name}</span>
          <span className="font-ui text-[10px] font-bold uppercase tracking-wider text-tan-light/80">
            League
          </span>
        </span>
      ) : null}
    </span>
  );
}
