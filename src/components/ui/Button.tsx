"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { play, type Sfx } from "@/lib/audio";

export type ButtonTone =
  | "gold"
  | "elixir"
  | "gem"
  | "stone"
  | "wood"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

const TONE: Record<ButtonTone, string> = {
  gold: "btn3d-gold",
  elixir: "btn3d-elixir",
  gem: "btn3d-gem",
  stone: "btn3d-stone",
  wood: "btn3d-wood",
  danger: "btn3d-danger",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs border-b-[4px] rounded-[0.6rem]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base sm:text-lg",
  xl: "px-8 py-4 text-lg sm:text-2xl border-b-[8px] rounded-2xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  size?: ButtonSize;
  /** SFX fired on click. Pass `null` to stay silent. */
  sfx?: Sfx | null;
  fullWidth?: boolean;
}

/**
 * The signature LifeClash button.
 *
 * The bottom border is the extruded 3D face; pressing collapses it and shifts
 * the cap down by the same distance so the button physically sinks. All of that
 * lives in the `.btn3d` component class in globals.css.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      tone = "gold",
      size = "md",
      sfx = "tap",
      fullWidth,
      className,
      onClick,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "btn3d",
          TONE[tone],
          SIZE[size],
          fullWidth && "w-full",
          className,
        )}
        onClick={(e) => {
          if (sfx) play(sfx);
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

/* -------------------------------------------------------------------------- */

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  label: string;
  sfx?: Sfx | null;
}

/** Square chunky button for HUD corners and modal close affordances. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { tone = "stone", label, sfx = "tap", className, onClick, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "btn3d h-10 w-10 shrink-0 rounded-xl p-0 text-lg leading-none",
          TONE[tone],
          className,
        )}
        onClick={(e) => {
          if (sfx) play(sfx);
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
