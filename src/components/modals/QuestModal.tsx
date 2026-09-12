"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Chip, DifficultyStars } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  GoldCoinSvg,
  ElixirFlaskSvg,
  TrophySvg,
} from "@/components/art/ResourceIcons";
import { BuildingArt } from "@/components/art/Buildings";
import { DragonHeadIcon } from "@/components/art/Dragon";
import { useGame, type QuestResult } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import { BUILDINGS } from "@/lib/game-config";
import { cn, fmt } from "@/lib/utils";
import { play } from "@/lib/audio";
import type { Quest, QuestCadence } from "@/types/game";

const CATEGORY_TONE = {
  LEARNING: "elixir",
  FITNESS: "danger",
  FINANCE: "gold",
  DISCIPLINE: "warn",
  FOCUS: "elixir",
  RECOVERY: "stone",
} as const;

/**
 * The quest board — the single most important screen in the product.
 * Tabs by cadence, scoped to a building when opened from the radial menu.
 */
export function QuestModal() {
  const modal = useUi((s) => s.modal);
  const modalTarget = useUi((s) => s.modalTarget);
  const closeModal = useUi((s) => s.closeModal);

  const quests = useGame((s) => s.quests);
  const epicQuest = useGame((s) => s.epicQuest);
  const completeQuest = useGame((s) => s.completeQuest);
  const pushFx = useGame((s) => s.pushFx);

  const createCustomQuest = useGame((s) => s.createCustomQuest);
  const deleteCustomQuest = useGame((s) => s.deleteCustomQuest);

  const [tab, setTab] = useState<QuestCadence>("DAILY");
  const [result, setResult] = useState<QuestResult | null>(null);
  const [adding, setAdding] = useState(false);

  const open = modal === "quests";
  const scoped = modalTarget
    ? quests.filter((q) => q.building === modalTarget)
    : quests;

  const visible = scoped.filter((q) => q.cadence === tab);
  const done = scoped.filter((q) => q.status === "COMPLETED").length;

  const onComplete = (quest: Quest, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const res = completeQuest(quest.id);
    if (!res) return;

    // Stagger the reward particles so they read as separate payouts.
    pushFx({ label: `+${res.xp}`, x: rect.left + rect.width / 2, y: rect.top, tone: "xp" });
    window.setTimeout(
      () => pushFx({ label: `+${res.gold}`, x: rect.left + rect.width / 2 - 46, y: rect.top + 10, tone: "gold" }),
      130,
    );
    window.setTimeout(
      () => pushFx({ label: `+${res.elixir}`, x: rect.left + rect.width / 2 + 46, y: rect.top + 10, tone: "elixir" }),
      260,
    );

    setResult(res);
  };

  const title = modalTarget ? `${BUILDINGS[modalTarget].name} Quests` : "Quest Board";

  return (
    <Modal
      open={open}
      onClose={() => {
        setResult(null);
        closeModal();
      }}
      title={title}
      subtitle={
        modalTarget
          ? BUILDINGS[modalTarget].domain
          : "Do it in real life, then mark it done. Rewards are paid on completion."
      }
      icon="📜"
      size="md"
      headerRight={
        <span className="hidden rounded-pill border-2 border-panel-ink/50 bg-panel-ink/45 px-2.5 py-1 font-ui text-[10px] font-black uppercase tracking-wider text-cream/80 sm:inline-flex">
          {done}/{scoped.length} done
        </span>
      }
    >
      {/* ------------------------------------------------------------ tabs */}
      <div className="mb-4 flex gap-1.5">
        {(["DAILY", "WEEKLY", "EPIC"] as QuestCadence[]).map((c) => {
          const count =
            c === "EPIC"
              ? epicQuest && (!modalTarget || epicQuest.building === modalTarget)
                ? 1
                : 0
              : scoped.filter((q) => q.cadence === c).length;
          return (
            <button
              key={c}
              onClick={() => {
                play("tap");
                setTab(c);
              }}
              className={cn(
                "flex-1 rounded-chunk border-[3px] px-3 py-2 font-display text-xs uppercase tracking-wide transition-all sm:text-sm",
                tab === c
                  ? "-translate-y-0.5 border-wood-dark bg-gold-gradient text-wood-deep shadow-btn-gold-sm"
                  : "border-wood-dark/30 bg-tan-light/60 text-wood-mid hover:bg-tan-light",
              )}
            >
              {c === "DAILY" ? "Today" : c === "WEEKLY" ? "This Week" : "★ Epic"}
              {count ? (
                <span className="ml-1.5 font-ui text-[10px] tabular-nums opacity-70">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------- add your own quest */}
      {tab === "DAILY" ? (
        <div className="mb-3">
          {adding ? (
            <NewQuestForm
              defaultCategory={modalTarget}
              onCancel={() => setAdding(false)}
              onCreate={async (input) => {
                const ok = await createCustomQuest(input);
                if (ok) setAdding(false);
                return ok;
              }}
            />
          ) : (
            <button
              onClick={() => {
                play("open");
                setAdding(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-chunk border-[3px] border-dashed border-wood-dark/40 bg-tan-light/50 py-2.5 font-display text-sm text-wood-mid transition-colors hover:border-wood-dark/70 hover:bg-tan-light hover:text-wood-deep"
            >
              <span className="text-lg leading-none">➕</span> Add your own quest
            </button>
          )}
        </div>
      ) : null}

      {/* ------------------------------------------------------------ list */}
      <div className="flex flex-col gap-2.5">
        {tab === "EPIC" ? (
          epicQuest && (!modalTarget || epicQuest.building === modalTarget) ? (
            <EpicCard quest={epicQuest} />
          ) : (
            <Empty text="No epic quest for this building." />
          )
        ) : visible.length ? (
          visible.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              onComplete={onComplete}
              onDelete={q.isCustom ? () => deleteCustomQuest(q.id) : undefined}
            />
          ))
        ) : (
          <Empty
            text={
              modalTarget
                ? "No quests here yet. Add one above."
                : "All clear. Add your own quest above, or new ones arrive tomorrow."
            }
          />
        )}
      </div>

      {/* --------------------------------------------------- reward overlay */}
      <AnimatePresence>
        {result ? (
          <RewardBurst result={result} onDone={() => setResult(null)} />
        ) : null}
      </AnimatePresence>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */

function QuestCard({
  quest,
  onComplete,
  onDelete,
}: {
  quest: Quest;
  onComplete: (q: Quest, e: React.MouseEvent) => void;
  onDelete?: () => void;
}) {
  const complete = quest.status === "COMPLETED";
  const meta = BUILDINGS[quest.building];

  return (
    <motion.div
      layout
      className={cn(
        "relative flex items-start gap-3 overflow-hidden rounded-chunk border-[3px] p-3 transition-colors",
        complete
          ? "border-gem-deep/50 bg-gem-base/15"
          : "border-wood-dark/35 bg-tan-light/85",
      )}
    >
      {/* building thumbnail */}
      <div className="hidden shrink-0 sm:block">
        <BuildingArt type={quest.building} level={3} width={56} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone={CATEGORY_TONE[quest.category]}>{quest.category}</Chip>
          <DifficultyStars difficulty={quest.difficulty} />
          {quest.isCustom ? <Chip tone="wood">Custom</Chip> : null}
          {complete ? <Chip tone="gem">✓ Done</Chip> : null}
        </div>

        <h3
          className={cn(
            "mt-1.5 font-display text-base leading-tight sm:text-lg",
            complete ? "text-wood-mid line-through" : "text-wood-deep",
          )}
        >
          {quest.title}
          {quest.targetValue ? (
            <span className="ml-1.5 font-ui text-sm font-black tabular-nums text-wood-mid">
              · {fmt(quest.targetValue)} {quest.unit}
            </span>
          ) : null}
        </h3>

        <p className="mt-0.5 font-body text-xs font-semibold leading-snug text-wood-mid sm:text-sm">
          {quest.description}
        </p>

        {/* rewards */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Reward tone="xp" value={quest.reward.xp} suffix="XP" />
          <Reward tone="gold" value={quest.reward.gold} icon={<GoldCoinSvg size={13} />} />
          <Reward
            tone="elixir"
            value={quest.reward.elixir}
            icon={<ElixirFlaskSvg size={13} />}
          />
          {quest.reward.trophies ? (
            <Reward
              tone="trophy"
              value={quest.reward.trophies}
              icon={<TrophySvg size={13} />}
            />
          ) : null}
          <span className="flex items-center gap-1 rounded-pill border-2 border-elixir-deep/40 bg-elixir-base/15 px-1.5 py-0.5 font-ui text-[10px] font-black tabular-nums text-elixir-dark">
            <DragonHeadIcon size={12} />
            {fmt(quest.damage)}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <p className="font-ui text-[9px] font-bold uppercase tracking-wider text-wood-mid/60">
            Feeds {meta.name}
          </p>
          {onDelete && !complete ? (
            <button
              onClick={onDelete}
              aria-label={`Delete quest ${quest.title}`}
              className="font-ui text-[9px] font-black uppercase tracking-wider text-danger/80 underline decoration-danger/40 underline-offset-2 hover:text-danger"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {/* action */}
      <div className="shrink-0 self-center">
        {complete ? (
          <span className="grid h-11 w-11 place-items-center rounded-xl border-[3px] border-gem-deep bg-gem-gradient text-lg font-black text-[#0C4A14]">
            ✓
          </span>
        ) : (
          <Button
            tone="gem"
            size="sm"
            sfx={null}
            onClick={(e) => onComplete(quest, e)}
            className="h-11 flex-col gap-0 px-3"
          >
            <span className="text-base leading-none">✓</span>
            <span
              className="font-ui text-[8px] font-black uppercase tracking-tight"
              style={{ WebkitTextStroke: "0px" }}
            >
              Done
            </span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function EpicCard({ quest }: { quest: Quest }) {
  return (
    <div className="relative overflow-hidden rounded-chunk border-[3px] border-wood-dark bg-[linear-gradient(160deg,#FFE9B0_0%,#E9C79A_58%,#C99B6B_100%)] p-4">
      <span
        className="pointer-events-none absolute inset-x-1 top-0.5 h-8 rounded-t-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div className="relative flex items-start gap-3">
        <BuildingArt type="TOWN_HALL" level={9} width={72} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <Chip tone="elixir">★ Season Objective</Chip>
          <h3 className="text-outline-xs mt-1.5 text-lg leading-tight sm:text-2xl">
            {quest.title}
          </h3>
          <p className="mt-1 font-body text-xs font-semibold text-wood-deep sm:text-sm">
            {quest.description}
          </p>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-ui text-[10px] font-black uppercase tracking-wider text-wood-mid">
                Progress
              </span>
              <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
                {quest.completedValue}%
              </span>
            </div>
            <ProgressBar
              value={quest.completedValue}
              max={100}
              tone="gold"
              size="md"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Reward tone="xp" value={quest.reward.xp} suffix="XP" />
            <Reward tone="gold" value={quest.reward.gold} icon={<GoldCoinSvg size={13} />} />
            <Reward
              tone="elixir"
              value={quest.reward.elixir}
              icon={<ElixirFlaskSvg size={13} />}
            />
          </div>
          <p className="mt-2 font-body text-[11px] font-bold italic text-wood-mid">
            Every daily quest you finish nudges this forward.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Reward({
  tone,
  value,
  icon,
  suffix,
}: {
  tone: "xp" | "gold" | "elixir" | "trophy";
  value: number;
  icon?: React.ReactNode;
  suffix?: string;
}) {
  const styles = {
    xp: "border-[#3C7A1E]/40 bg-xp/20 text-[#356E1A]",
    gold: "border-gold-deep/40 bg-gold-base/25 text-[#7A4E06]",
    elixir: "border-elixir-deep/40 bg-elixir-base/18 text-elixir-dark",
    trophy: "border-gold-deep/40 bg-gold-light/25 text-[#7A4E06]",
  }[tone];

  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-pill border-2 px-1.5 py-0.5 font-ui text-[10px] font-black tabular-nums",
        styles,
      )}
    >
      {icon}+{fmt(value)} {suffix}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-chunk border-[3px] border-dashed border-wood-dark/30 bg-tan-light/50 px-4 py-10 text-center">
      <p className="font-display text-lg text-wood-mid">{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Full-panel reward flash shown right after a quest is completed. */
function RewardBurst({
  result,
  onDone,
}: {
  result: QuestResult;
  onDone: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 grid place-items-center bg-panel-ink/70 backdrop-blur-sm"
    >
      {/* Scrim is a sibling, not a parent — nesting the Collect button inside a
          button would be invalid HTML and would swallow its clicks. */}
      <div
        aria-hidden="true"
        onClick={onDone}
        className="absolute inset-0 cursor-default"
      />

      <motion.div
        initial={{ scale: 0.6, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        className="panel-wood relative w-[min(88%,340px)] p-5 text-center"
      >
        <p className="font-ui text-[11px] font-black uppercase tracking-[0.28em] text-wood-mid">
          Quest complete
        </p>
        <h3 className="text-outline-sm mt-1 text-2xl leading-tight">
          {result.quest.title}
        </h3>

        <div className="mt-4 flex flex-col gap-1.5">
          <RewardRow label="Experience" value={`+${fmt(result.xp)} XP`} tone="xp" />
          <RewardRow label="Gold" value={`+${fmt(result.gold)}`} tone="gold" />
          <RewardRow label="Elixir" value={`+${fmt(result.elixir)}`} tone="elixir" />
          {result.trophies ? (
            <RewardRow
              label="Trophies"
              value={`+${fmt(result.trophies)}`}
              tone="trophy"
            />
          ) : null}
          <RewardRow
            label="Dragon damage"
            value={`−${fmt(result.damage)} HP`}
            tone="damage"
          />
        </div>

        {result.buildingLeveled ? (
          <p className="mt-3 rounded-chunk border-2 border-gem-deep/50 bg-gem-base/20 px-3 py-2 font-display text-sm text-[#0C4A14]">
            🔨 {BUILDINGS[result.buildingLeveled].name} reached level{" "}
            {useGame.getState().buildingByType(result.buildingLeveled)?.level}
          </p>
        ) : null}

        <div className="mt-4">
          <Button tone="gold" size="md" fullWidth onClick={onDone}>
            Collect
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RewardRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "xp" | "gold" | "elixir" | "trophy" | "damage";
}) {
  const color = {
    xp: "text-[#356E1A]",
    gold: "text-[#7A4E06]",
    elixir: "text-elixir-dark",
    trophy: "text-[#7A4E06]",
    damage: "text-danger",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-chunk border-2 border-wood-dark/25 bg-tan-light/75 px-3 py-1.5">
      <span className="font-ui text-[11px] font-black uppercase tracking-wider text-wood-mid">
        {label}
      </span>
      <span className={cn("font-display text-base tabular-nums", color)}>
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const NEW_CATEGORIES: {
  id: Quest["category"];
  label: string;
  emoji: string;
  building: string;
}[] = [
  { id: "LEARNING", label: "Learn", emoji: "🧠", building: "ACADEMY" },
  { id: "FITNESS", label: "Fitness", emoji: "💪", building: "TRAINING_GROUNDS" },
  { id: "FINANCE", label: "Wealth", emoji: "💰", building: "TREASURY" },
  { id: "DISCIPLINE", label: "Discipline", emoji: "🔥", building: "DEFENSE_TOWER" },
  { id: "FOCUS", label: "Focus", emoji: "🎯", building: "ACADEMY" },
  { id: "RECOVERY", label: "Recovery", emoji: "😴", building: "DEFENSE_TOWER" },
];

/** Inline form for creating a custom quest (the "add a task" flow). */
function NewQuestForm({
  defaultCategory,
  onCreate,
  onCancel,
}: {
  defaultCategory?: import("@/types/game").BuildingType | null;
  onCreate: (input: {
    title: string;
    category: Quest["category"];
    difficulty: number;
    type?: Quest["type"];
    targetValue?: number | null;
    unit?: string | null;
  }) => Promise<boolean>;
  onCancel: () => void;
}) {
  // Seed the category from the building the modal was opened for, if any.
  const seeded =
    NEW_CATEGORIES.find((c) => c.building === defaultCategory)?.id ?? "FOCUS";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Quest["category"]>(seeded);
  const [difficulty, setDifficulty] = useState(2);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (title.trim().length < 2) {
      setErr("Give your quest a name.");
      play("error");
      return;
    }
    setBusy(true);
    setErr(null);
    const ok = await onCreate({ title: title.trim(), category, difficulty });
    setBusy(false);
    if (!ok) setErr("Couldn't save that. Try again.");
  };

  return (
    <div className="rounded-chunk border-[3px] border-wood-dark/45 bg-tan-light/90 p-3">
      <p className="mb-2 font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
        New quest
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Practice guitar for 20 minutes"
        autoFocus
        maxLength={80}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        className="w-full rounded-chunk border-[3px] border-wood-dark/50 bg-tan-light px-3 py-2 font-body text-sm font-bold text-wood-deep shadow-inset-soft outline-none placeholder:text-wood-mid/40 focus:border-gold-base"
      />

      {/* category */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {NEW_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              play("tap");
              setCategory(c.id);
            }}
            className={cn(
              "flex items-center gap-1 rounded-pill border-2 px-2 py-1 font-ui text-[10px] font-black uppercase tracking-wide transition-all",
              category === c.id
                ? "border-wood-dark bg-gold-gradient text-wood-deep"
                : "border-wood-dark/25 bg-tan-mid/60 text-wood-mid hover:bg-tan-mid",
            )}
          >
            <span className="text-xs leading-none">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* difficulty */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="font-ui text-[10px] font-black uppercase tracking-wider text-wood-mid">
          Difficulty
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((d) => (
            <button
              key={d}
              onClick={() => {
                play("tap");
                setDifficulty(d);
              }}
              aria-label={`Difficulty ${d}`}
              className={cn(
                "text-lg leading-none transition-transform hover:scale-110",
                d <= difficulty ? "text-gold-base" : "text-wood-dark/25",
              )}
            >
              ★
            </button>
          ))}
        </div>
        <span className="font-ui text-[10px] font-bold text-wood-mid">
          bigger reward
        </span>
      </div>

      {err ? (
        <p className="mt-2 font-body text-[11px] font-bold text-danger">{err}</p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Button tone="stone" size="sm" onClick={onCancel} className="min-w-[80px]">
          Cancel
        </Button>
        <Button
          tone="gem"
          size="sm"
          sfx={null}
          fullWidth
          disabled={busy}
          onClick={submit}
        >
          {busy ? "Saving…" : "＋ Create quest"}
        </Button>
      </div>
    </div>
  );
}
