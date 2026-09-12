import { cn } from "@/lib/utils";

/**
 * Player avatar: the Google profile photo when signed in with Google, otherwise
 * the chosen emoji crest on a wood chip. Kept as a plain <img> (not next/image)
 * so no remote-image domain config is needed for the OAuth photo.
 */
export function Avatar({
  avatarUrl,
  crest,
  size = 48,
  className,
  ring = true,
}: {
  avatarUrl?: string;
  crest: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-tan-gradient",
        ring && "border-[3px] border-wood-dark shadow-btn-gold-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="Profile"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.5 }} className="leading-none">
          {crest}
        </span>
      )}
    </span>
  );
}
