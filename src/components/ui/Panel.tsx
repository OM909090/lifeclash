import { cn } from "@/lib/utils";

export type PanelTone = "wood" | "stone" | "dark";

const TONE: Record<PanelTone, string> = {
  wood: "panel-wood",
  stone: "panel-stone",
  dark: "panel-dark",
};

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
}

/** Tactile plate with a dark rounded border, top gloss and drop shadow. */
export function Panel({
  tone = "wood",
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <div className={cn(TONE[tone], className)} {...rest}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  /** Rendered to the left of the title — usually an emoji or small SVG. */
  icon?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

/** Dark banner used as the header strip inside wood/stone panels. */
export function PanelHeader({
  title,
  subtitle,
  icon,
  right,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-t-[0.95rem] border-b-[5px] border-wood-dark bg-wood-gradient px-4 py-3",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-2 top-1 h-4 rounded-t-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      {icon ? <span className="relative text-2xl leading-none">{icon}</span> : null}
      <div className="relative min-w-0 flex-1">
        <h2 className="text-outline-xs truncate text-lg leading-tight sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="truncate font-ui text-[11px] font-bold text-tan-light/85 sm:text-xs">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="relative shrink-0">{right}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Recessed inner well — for stat rows, quest cards, ledger lines. */
export function Well({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-chunk border-2 border-wood-dark/45 bg-tan-light/55 shadow-inset-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
