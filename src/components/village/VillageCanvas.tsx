"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  GRID,
  TILE_CLIP,
  TILE_H,
  TILE_W,
  isLightTile,
  isPathTile,
  isPerimeter,
  isoToScreen,
  depth,
} from "@/lib/iso";
import { BUILDINGS, upgradeCost, upgradeElixirCost } from "@/lib/game-config";
import { useGame } from "@/store/game-store";
import { useUi, MIN_ZOOM, MAX_ZOOM } from "@/store/ui-store";
import { BuildingArt } from "@/components/art/Buildings";
import {
  TreeSvg,
  RockSvg,
  Cloud,
  FloatingIsland,
} from "@/components/art/Scenery";
import { RadialMenu, type RadialAction } from "./RadialMenu";
import { ResourceBubble } from "./ResourceBubble";
import { cn, seeded } from "@/lib/utils";
import { play } from "@/lib/audio";
import type { Building, BuildingType } from "@/types/game";

const BOARD_W = GRID * TILE_W;
const BOARD_H = GRID * TILE_H + TILE_H * 2;

/**
 * The interactive 2.5D village board.
 *
 * Rendering model: every tile and building is an absolutely-positioned element
 * inside a single transformed container. Tiles are CSS-clipped diamonds rather
 * than 3D-transformed planes — cheaper, pixel-crisp, and immune to mobile
 * Safari's compositing quirks. Buildings are painted in painter's order
 * (back-to-front by gx+gy) via z-index.
 */
export function VillageCanvas() {
  const buildings = useGame((s) => s.buildings);
  const streak = useGame((s) => s.player.streak);
  const canAfford = useGame((s) => s.canAfford);

  const { selected, select, openModal, zoom, pan, setPan, nudgeZoom, fitZoom } =
    useUi();

  const [hover, setHover] = useState<BuildingType | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const byCell = useMemo(() => {
    const map = new Map<string, Building>();
    for (const b of buildings) map.set(`${b.x},${b.y}`, b);
    return map;
  }, [buildings]);

  /* ------------------------------------------------------------------ camera */

  /** True when an event originated on a building, bubble or radial button. */
  const fromInteractive = (e: React.PointerEvent) =>
    Boolean((e.target as HTMLElement).closest("[data-interactive]"));

  const onPointerDown = (e: React.PointerEvent) => {
    // Only pan with the background, never from a building/bubble.
    if (fromInteractive(e)) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    viewportRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
    setPan({ x: drag.current.originX + dx, y: drag.current.originY + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = drag.current.moved;
    drag.current.active = false;
    viewportRef.current?.releasePointerCapture?.(e.pointerId);

    // Never deselect from a building or a radial button: pointerup fires before
    // click, so unmounting the ring here would swallow the action entirely.
    if (fromInteractive(e)) return;

    // A tap on empty ground clears the selection — but a pan shouldn't.
    if (!wasDrag && selected) {
      play("back");
      select(null);
    }
  };

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      nudgeZoom(e.deltaY > 0 ? -0.08 : 0.08);
    },
    [nudgeZoom],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  /**
   * Fit the board to the viewport so the realm fills the screen instead of
   * floating in empty sky. The vertical budget subtracts the two HUD bands.
   */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const HUD_BAND = 210;
      fitZoom(
        Math.min(
          (width * 0.94) / BOARD_W,
          (height - HUD_BAND) / (BOARD_H * 0.78),
        ),
      );
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitZoom]);

  /* ------------------------------------------------------- radial menu wiring */

  const actionsFor = (b: Building): RadialAction[] => {
    const meta = BUILDINGS[b.type];
    const maxed = b.level >= meta.maxLevel;
    const gold = upgradeCost(b.level);
    const elixir = upgradeElixirCost(b.level);

    return [
      {
        id: "info",
        label: "Info",
        icon: "ℹ️",
        tone: "stone",
        onSelect: () => openModal("info", b.type),
      },
      {
        id: "upgrade",
        label: maxed ? "Max" : "Upgrade",
        icon: "⬆️",
        tone: "gem",
        disabled: maxed || !canAfford(gold, elixir),
        onSelect: () => openModal("upgrade", b.type),
      },
      {
        id: "quest",
        label: "Quest",
        icon: "📜",
        tone: "gold",
        onSelect: () => openModal("quests", b.type),
      },
    ];
  };

  /* ------------------------------------------------------------------ render */

  const tiles = [];
  for (let gy = 0; gy < GRID; gy += 1) {
    for (let gx = 0; gx < GRID; gx += 1) {
      const p = isoToScreen(gx, gy);
      const path = isPathTile(gx, gy);
      const perimeter = isPerimeter(gx, gy);
      const light = isLightTile(gx, gy);

      tiles.push(
        <div
          key={`t-${gx}-${gy}`}
          className="iso-tile"
          style={{
            left: p.x - TILE_W / 2,
            top: p.y,
            width: TILE_W,
            height: TILE_H,
            clipPath: TILE_CLIP,
            zIndex: depth(gx, gy),
            background: path
              ? light
                ? "linear-gradient(160deg,#D3D8D5,#A7AEAB)"
                : "linear-gradient(160deg,#C4CAC7,#98A09C)"
              : perimeter
                ? light
                  ? "linear-gradient(160deg,#5FA637,#3E812F)"
                  : "linear-gradient(160deg,#55993A,#356F2A)"
                : light
                  ? "linear-gradient(160deg,#8FD34A,#69B238)"
                  : "linear-gradient(160deg,#7DC441,#5CA332)",
          }}
        />,
      );
    }
  }

  /* Perimeter scenery — deterministic so it never reshuffles between renders. */
  const scenery = [];
  let sceneryKey = 0;
  for (let gy = 0; gy < GRID; gy += 1) {
    for (let gx = 0; gx < GRID; gx += 1) {
      if (!isPerimeter(gx, gy)) continue;
      const roll = seeded(gx * 13.7 + gy * 7.3);
      if (roll < 0.42) continue;

      const p = isoToScreen(gx, gy);
      const isRock = roll > 0.88;
      sceneryKey += 1;

      scenery.push(
        <div
          key={`s-${sceneryKey}`}
          className="pointer-events-none absolute"
          style={{
            left: p.x - 30,
            top: p.y - (isRock ? 14 : 54),
            zIndex: depth(gx, gy) + 4,
          }}
        >
          {isRock ? (
            <RockSvg width={44} />
          ) : (
            <TreeSvg
              width={54 + Math.round(roll * 12)}
              variant={Math.floor(roll * 3) % 3}
              className="animate-sway origin-bottom"
            />
          )}
        </div>,
      );
    }
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-full w-full touch-none select-none overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: drag.current.active ? "grabbing" : "grab" }}
    >
      {/* -------------------------------------------------------- sky + ground */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#5FC7F5_0%,#8FDAFA_38%,#BFE9FF_62%,#CFEFD8_100%)]" />

      {/* Sky dressing. The board rarely fills a tall phone screen, so the void
          above and below is filled with drifting clouds and distant islets —
          the realm reads as floating rather than stranded. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Cloud width={260} className="absolute left-[-6%] top-[6%] opacity-80" />
        <Cloud width={190} className="absolute right-[-3%] top-[13%] opacity-65" />
        <Cloud width={230} className="absolute left-[14%] bottom-[16%] opacity-45" />
        <Cloud width={160} className="absolute right-[10%] bottom-[24%] opacity-40" />

        <div className="absolute left-[4%] top-[26%] animate-bob opacity-55">
          <FloatingIsland width={130} waterfall={false} id="vgIsleA" />
        </div>
        <div
          className="absolute right-[3%] top-[34%] animate-bob opacity-45"
          style={{ animationDelay: "-2.6s" }}
        >
          <FloatingIsland width={96} waterfall={false} id="vgIsleB" />
        </div>
        {/* kept clear of the bottom HUD band */}
        <div
          className="absolute bottom-[22%] left-[20%] animate-bob opacity-35"
          style={{ animationDelay: "-4.2s" }}
        >
          <FloatingIsland width={80} waterfall={false} id="vgIsleC" />
        </div>
      </div>

      {/* the board */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        animate={{ x: pan.x, y: pan.y, scale: zoom }}
        transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.6 }}
        style={{
          width: BOARD_W,
          height: BOARD_H,
          marginLeft: -BOARD_W / 2,
          // Nudged down: buildings paint upward out of their tiles, so the
          // geometric centre of the tile field sits higher than the visual one.
          marginTop: -BOARD_H / 2 + 52,
        }}
      >
        {/* Island underside — a rock trapezoid tucked under the tile diamond so
            the board reads as a floating realm rather than a flat rug. */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: TILE_H * (GRID / 2) + TILE_H / 2,
            width: BOARD_W,
            height: 150,
            zIndex: 0,
            background:
              "linear-gradient(180deg, #7A5F3C 0%, #5E4629 42%, #3A2915 100%)",
            clipPath: "polygon(0% 0%, 100% 0%, 62% 100%, 38% 100%)",
          }}
        />
        {/* rock strata */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: TILE_H * (GRID / 2) + TILE_H / 2,
            width: BOARD_W,
            height: 150,
            zIndex: 1,
            opacity: 0.35,
            background:
              "repeating-linear-gradient(180deg, rgba(0,0,0,.22) 0 3px, transparent 3px 26px)",
            clipPath: "polygon(0% 0%, 100% 0%, 62% 100%, 38% 100%)",
          }}
        />

        {/* tile field, offset so tile (0,0) starts at board-centre-top */}
        <div className="absolute" style={{ left: BOARD_W / 2, top: 0 }}>
          {tiles}
          {scenery}

          {/* --------------------------------------------------- buildings */}
          {buildings.map((b) => {
            const meta = BUILDINGS[b.type];
            const p = isoToScreen(b.x, b.y);
            const isSelected = selected === b.type;
            const isHover = hover === b.type;
            const locked = b.status === "LOCKED";
            const w = b.type === "TOWN_HALL" ? 172 : 138;

            const artH = (w * 180) / 200;
            // The art's footprint sits at 82% of its height.
            const baseY = artH * 0.82;

            return (
              <div
                key={b.id}
                // The wrapper is inert. Only the diamond hit-target below
                // accepts pointer events — otherwise the transparent headroom
                // of a building in front would swallow clicks meant for the
                // building behind it.
                className="pointer-events-none absolute"
                style={{
                  left: p.x - w / 2,
                  top: p.y + TILE_H / 2 - baseY,
                  width: w,
                  zIndex: depth(b.x, b.y) + (isSelected ? 40 : 8),
                }}
              >
                {/* ------------------------------------------------- visuals */}
                <div
                  className={cn(
                    "relative origin-bottom transition-transform duration-150",
                    (isHover || isSelected) && !locked && "-translate-y-1",
                  )}
                >
                  {/* hover / selected ground highlight */}
                  {(isHover || isSelected) && !locked ? (
                    <span
                      className="absolute left-1/2"
                      style={{
                        top: baseY - TILE_H / 2,
                        width: TILE_W,
                        height: TILE_H,
                        marginLeft: -TILE_W / 2,
                        clipPath: TILE_CLIP,
                        background: isSelected
                          ? "rgba(255,212,71,.55)"
                          : "rgba(255,255,255,.4)",
                        boxShadow: isSelected
                          ? "0 0 22px rgba(255,212,71,.8)"
                          : undefined,
                      }}
                    />
                  ) : null}

                  <BuildingArt
                    type={b.type}
                    level={b.level}
                    width={w}
                    dim={locked}
                    streakLit={streak > 0}
                    className={cn(
                      "relative h-auto w-full",
                      isSelected && "drop-shadow-[0_0_14px_rgba(255,212,71,.85)]",
                    )}
                  />

                  {/* Level / lock chip, pinned just above the footprint. */}
                  <span
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: baseY - 22 }}
                  >
                    {locked ? (
                      <span className="flex items-center gap-1 whitespace-nowrap rounded-pill border-2 border-panel-ink bg-panel-base/92 px-1.5 py-0.5 font-ui text-[9px] font-black uppercase tracking-wide text-cream/85">
                        🔒 Lv 5
                      </span>
                    ) : (
                      <span className="flex items-center whitespace-nowrap rounded-pill border-2 border-wood-dark bg-gold-gradient px-1.5 py-[1px] font-ui text-[10px] font-black tabular-nums text-wood-deep shadow-btn-gold-sm">
                        {b.level}
                      </span>
                    )}
                  </span>

                  {/* name plate on hover */}
                  {isHover && !isSelected ? (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill border-2 border-panel-ink bg-panel-base/92 px-2 py-0.5 font-ui text-[9px] font-black uppercase tracking-wide text-cream"
                      style={{ top: baseY + TILE_H / 2 }}
                    >
                      {meta.name}
                    </span>
                  ) : null}
                </div>

                {/* ---------------------------------------------- hit target */}
                {/* Clipped to the tile diamond so the clickable area matches
                    the plot the building actually occupies. */}
                <button
                  data-interactive
                  aria-label={`${meta.name}, level ${b.level}${locked ? ", locked" : ""}`}
                  aria-pressed={isSelected}
                  onMouseEnter={() => {
                    if (locked) return;
                    setHover(b.type);
                    play("hover");
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (locked) {
                      play("error");
                      return;
                    }
                    play("select");
                    select(isSelected ? null : b.type);
                  }}
                  className={cn(
                    "pointer-events-auto absolute left-1/2",
                    locked ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                  style={{
                    top: baseY - TILE_H / 2,
                    width: TILE_W,
                    height: TILE_H,
                    marginLeft: -TILE_W / 2,
                    clipPath: TILE_CLIP,
                  }}
                />

                {/* radial action ring */}
                <RadialMenu open={isSelected && !locked} actions={actionsFor(b)} />
              </div>
            );
          })}

          {/* ------------------------------------------- collectible bubbles */}
          {(() => {
            const bubbleHosts = buildings.filter(
              (b) =>
                b.status !== "LOCKED" &&
                (b.type === "TREASURY" ||
                  b.type === "ACADEMY" ||
                  b.type === "TRAINING_GROUNDS"),
            );
            return bubbleHosts.map((b, i) => {
              const p = isoToScreen(b.x, b.y);
              return (
                <div
                  key={`bub-${b.id}`}
                  data-interactive
                  className="absolute"
                  style={{
                    left: p.x + 22,
                    top: p.y - 96,
                    zIndex: depth(b.x, b.y) + 30,
                  }}
                >
                  <ResourceBubble
                    kind={b.type === "TREASURY" ? "gold" : i % 2 ? "elixir" : "gold"}
                    amount={b.type === "TREASURY" ? 120 : 60}
                    delay={i * 0.25}
                  />
                </div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* Camera controls — parked above the bottom HUD band so they never
          collide with the boss HP strip on short screens. */}
      <div className="absolute bottom-[132px] right-2 z-[70] flex flex-col gap-1.5 sm:right-3">
        <button
          aria-label="Zoom in"
          onClick={() => {
            play("tap");
            nudgeZoom(0.15);
          }}
          disabled={zoom >= MAX_ZOOM}
          className="btn3d btn3d-stone h-9 w-9 rounded-lg border-b-[4px] p-0 text-base leading-none"
        >
          +
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => {
            play("tap");
            nudgeZoom(-0.15);
          }}
          disabled={zoom <= MIN_ZOOM}
          className="btn3d btn3d-stone h-9 w-9 rounded-lg border-b-[4px] p-0 text-base leading-none"
        >
          −
        </button>
        <button
          aria-label="Recentre view"
          onClick={() => {
            play("tap");
            useUi.getState().resetCamera();
          }}
          className="btn3d btn3d-stone h-9 w-9 rounded-lg border-b-[4px] p-0 text-xs leading-none"
        >
          ⌖
        </button>
      </div>

      {/* Hint — sits above the bottom HUD band so it never hides behind it. */}
      {!selected ? (
        <div className="pointer-events-none absolute bottom-[132px] left-1/2 z-[70] -translate-x-1/2">
          <span className="whitespace-nowrap rounded-pill border-2 border-panel-ink/70 bg-panel-base/75 px-3 py-1 font-ui text-[10px] font-black uppercase tracking-wider text-cream/80 backdrop-blur-sm">
            Tap a building · drag to pan
          </span>
        </div>
      ) : null}
    </div>
  );
}
