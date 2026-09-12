/**
 * Zero-dependency SFX built on the Web Audio API.
 *
 * Every sound is synthesised at runtime — no audio files ship with the app and
 * nothing is sampled from any existing game. Browsers block audio until the
 * first user gesture, so the context is created lazily on the first play call.
 */

export type Sfx =
  | "tap"
  | "back"
  | "open"
  | "close"
  | "coin"
  | "elixir"
  | "gem"
  | "hammer"
  | "upgrade"
  | "levelUp"
  | "questComplete"
  | "select"
  | "hover"
  | "error"
  | "dragonRoar"
  | "damage"
  | "trophy"
  | "whoosh"
  | "forge";

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let volume = 0.55;

const STORAGE_KEY = "lifeclash.audio";

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One synthesised voice: an oscillator through its own envelope. */
function voice(
  opts: {
    freq: number;
    to?: number;
    type?: Wave;
    dur?: number;
    gain?: number;
    delay?: number;
    /** Simple lowpass to take the edge off square/saw voices. */
    filter?: number;
  },
) {
  const ac = ensure();
  if (!ac || !master || !enabled) return;

  const {
    freq,
    to,
    type = "sine",
    dur = 0.14,
    gain = 0.3,
    delay = 0,
    filter,
  } = opts;

  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const env = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to && to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);

  // Fast attack, exponential decay — reads as "snappy" and game-like.
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  let node: AudioNode = osc;
  if (filter) {
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = filter;
    osc.connect(lp);
    node = lp;
  }

  node.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Filtered white noise — used for impacts, whooshes and dragon breath. */
function noise(
  opts: {
    dur?: number;
    gain?: number;
    delay?: number;
    type?: BiquadFilterType;
    freq?: number;
    sweepTo?: number;
    q?: number;
  } = {},
) {
  const ac = ensure();
  if (!ac || !master || !enabled) return;

  const {
    dur = 0.2,
    gain = 0.22,
    delay = 0,
    type = "bandpass",
    freq = 1200,
    sweepTo,
    q = 1,
  } = opts;

  const t0 = ac.currentTime + delay;
  const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    // Fade the tail inside the buffer so the envelope never clicks.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }

  const src = ac.createBufferSource();
  src.buffer = buffer;

  const bq = ac.createBiquadFilter();
  bq.type = type;
  bq.frequency.setValueAtTime(freq, t0);
  bq.Q.value = q;
  if (sweepTo) bq.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t0 + dur);

  const env = ac.createGain();
  env.gain.setValueAtTime(gain, t0);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  src.connect(bq);
  bq.connect(env);
  env.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/* -------------------------------------------------------------------------- */
/* PATCHES                                                                     */
/* -------------------------------------------------------------------------- */

const PATCHES: Record<Sfx, () => void> = {
  /** Soft wooden UI tick. */
  tap: () => {
    voice({ freq: 620, to: 440, type: "triangle", dur: 0.075, gain: 0.24 });
    noise({ dur: 0.045, gain: 0.06, freq: 2400 });
  },

  back: () => voice({ freq: 380, to: 250, type: "triangle", dur: 0.1, gain: 0.2 }),

  /** Panel opening — rising two-note flourish. */
  open: () => {
    voice({ freq: 440, to: 660, type: "triangle", dur: 0.13, gain: 0.2 });
    voice({ freq: 880, type: "sine", dur: 0.12, gain: 0.1, delay: 0.06 });
  },

  close: () => voice({ freq: 520, to: 300, type: "triangle", dur: 0.12, gain: 0.18 }),

  /** Coin collect — bright metallic double ping. */
  coin: () => {
    voice({ freq: 1180, type: "square", dur: 0.07, gain: 0.16, filter: 5200 });
    voice({ freq: 1760, type: "square", dur: 0.13, gain: 0.14, delay: 0.055, filter: 6000 });
    voice({ freq: 2640, type: "sine", dur: 0.1, gain: 0.07, delay: 0.055 });
  },

  /** Elixir — liquid, hollow blub. */
  elixir: () => {
    voice({ freq: 300, to: 760, type: "sine", dur: 0.17, gain: 0.22 });
    voice({ freq: 1500, type: "sine", dur: 0.09, gain: 0.08, delay: 0.1 });
  },

  /** Gem — crystalline triad. */
  gem: () => {
    voice({ freq: 1320, type: "sine", dur: 0.16, gain: 0.14 });
    voice({ freq: 1980, type: "sine", dur: 0.2, gain: 0.11, delay: 0.05 });
    voice({ freq: 2640, type: "sine", dur: 0.26, gain: 0.08, delay: 0.1 });
  },

  /** Single hammer strike on stone. */
  hammer: () => {
    noise({ dur: 0.09, gain: 0.3, type: "bandpass", freq: 2600, sweepTo: 700, q: 0.8 });
    voice({ freq: 190, to: 80, type: "square", dur: 0.13, gain: 0.26, filter: 900 });
  },

  /** Upgrade complete — three strikes then a bright resolve. */
  upgrade: () => {
    for (let i = 0; i < 3; i += 1) {
      noise({ dur: 0.08, gain: 0.24, freq: 2500, sweepTo: 800, delay: i * 0.14 });
      voice({ freq: 180, to: 90, type: "square", dur: 0.11, gain: 0.2, delay: i * 0.14, filter: 900 });
    }
    voice({ freq: 660, to: 990, type: "triangle", dur: 0.3, gain: 0.22, delay: 0.45 });
    voice({ freq: 1320, type: "sine", dur: 0.34, gain: 0.12, delay: 0.5 });
  },

  /** Level-up fanfare — major arpeggio with a shimmer tail. */
  levelUp: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      voice({ freq: f, type: "triangle", dur: 0.34, gain: 0.2, delay: i * 0.085 });
      voice({ freq: f * 2, type: "sine", dur: 0.22, gain: 0.07, delay: i * 0.085 });
    });
    voice({ freq: 1046.5, type: "sine", dur: 0.8, gain: 0.14, delay: 0.46 });
    noise({ dur: 0.6, gain: 0.05, type: "highpass", freq: 5200, delay: 0.44 });
  },

  /** Quest complete — confident rising fourth + coin sparkle. */
  questComplete: () => {
    voice({ freq: 587.33, type: "triangle", dur: 0.16, gain: 0.22 });
    voice({ freq: 783.99, type: "triangle", dur: 0.16, gain: 0.22, delay: 0.1 });
    voice({ freq: 1174.66, type: "sine", dur: 0.36, gain: 0.16, delay: 0.2 });
    noise({ dur: 0.3, gain: 0.05, type: "highpass", freq: 4800, delay: 0.2 });
  },

  select: () => voice({ freq: 760, to: 1020, type: "triangle", dur: 0.09, gain: 0.16 }),

  hover: () => voice({ freq: 900, type: "sine", dur: 0.04, gain: 0.055 }),

  error: () => {
    voice({ freq: 260, to: 160, type: "sawtooth", dur: 0.2, gain: 0.18, filter: 1100 });
    voice({ freq: 130, type: "square", dur: 0.22, gain: 0.12, delay: 0.05, filter: 700 });
  },

  /** Dragon roar — descending saw growl under a breath of noise. */
  dragonRoar: () => {
    voice({ freq: 150, to: 52, type: "sawtooth", dur: 0.85, gain: 0.26, filter: 620 });
    voice({ freq: 96, to: 40, type: "square", dur: 0.9, gain: 0.18, filter: 420 });
    noise({ dur: 0.75, gain: 0.14, type: "lowpass", freq: 900, sweepTo: 240 });
  },

  /** Quest damages the boss — impact plus a metallic ring. */
  damage: () => {
    noise({ dur: 0.14, gain: 0.26, freq: 1800, sweepTo: 400, q: 0.7 });
    voice({ freq: 240, to: 110, type: "square", dur: 0.16, gain: 0.2, filter: 1000 });
    voice({ freq: 1480, type: "sine", dur: 0.1, gain: 0.08, delay: 0.05 });
  },

  /** Trophy / promotion. */
  trophy: () => {
    voice({ freq: 784, type: "triangle", dur: 0.2, gain: 0.2 });
    voice({ freq: 1046.5, type: "triangle", dur: 0.24, gain: 0.18, delay: 0.1 });
    voice({ freq: 1568, type: "sine", dur: 0.44, gain: 0.14, delay: 0.2 });
  },

  whoosh: () =>
    noise({ dur: 0.42, gain: 0.16, type: "bandpass", freq: 420, sweepTo: 2600, q: 0.6 }),

  /** Forge step tick — used by the onboarding planning animation. */
  forge: () => {
    noise({ dur: 0.11, gain: 0.18, freq: 1500, sweepTo: 520 });
    voice({ freq: 420, to: 640, type: "triangle", dur: 0.14, gain: 0.16 });
  },
};

/* -------------------------------------------------------------------------- */
/* PUBLIC API                                                                  */
/* -------------------------------------------------------------------------- */

export function play(name: Sfx) {
  if (!enabled) return;
  try {
    PATCHES[name]?.();
  } catch {
    /* Audio is decorative — never let it break an interaction. */
  }
}

export function setAudioEnabled(next: boolean) {
  enabled = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume }));
  }
}

export function setVolume(next: number) {
  volume = Math.min(1, Math.max(0, next));
  if (master) master.gain.value = volume;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume }));
  }
}

export function getAudioState() {
  return { enabled, volume };
}

export function loadAudioPrefs() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { enabled?: boolean; volume?: number };
    if (typeof parsed.enabled === "boolean") enabled = parsed.enabled;
    if (typeof parsed.volume === "number") {
      volume = parsed.volume;
      if (master) master.gain.value = volume;
    }
  } catch {
    /* ignore malformed prefs */
  }
}
