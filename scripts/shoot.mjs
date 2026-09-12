/**
 * Dev-only visual verification helper.
 *
 *   node scripts/shoot.mjs <route> <name> [width] [height] [fullPage]
 *
 * Writes to .screens/ (gitignored). Not part of the app bundle.
 *
 * Caveat on fullPage=true: Chromium expands the viewport to the full document
 * height to capture, which re-triggers Framer Motion's `whileInView` reveals.
 * Sections below the fold can therefore capture mid-fade and look blank. For
 * reviewing a specific section, use fullPage=false and scroll to it instead.
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const [, , route = "/", name = "shot", w = "1440", h = "900", full = "true"] =
  process.argv;

mkdirSync(".screens", { recursive: true });

// Use the system browser — the cached playwright build doesn't match this
// driver version, and we only need a renderer for screenshots.
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN ?? "/usr/bin/google-chrome-stable",
});
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

// Restore a seeded realm (captured by flow.mjs) so /village renders instead of
// bouncing to onboarding.
if (existsSync(".screens/seed.json")) {
  const seed = JSON.parse(readFileSync(".screens/seed.json", "utf8"));
  await page.addInitScript((s) => {
    if (s.game) localStorage.setItem("lifeclash.game", s.game);
    if (s.onboarding) localStorage.setItem("lifeclash.onboarding", s.onboarding);
  }, seed);
}

await page.goto(`http://localhost:3000${route}`, {
  waitUntil: "networkidle",
  timeout: 60_000,
});
// Let fonts settle and scroll-triggered reveals fire.
await page.evaluate(async () => {
  await document.fonts.ready;
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(900);

await page.screenshot({
  path: `.screens/${name}.png`,
  fullPage: full === "true",
});

console.log(`saved .screens/${name}.png`);
if (errors.length) {
  console.log(`\n${errors.length} console error(s):`);
  for (const e of errors.slice(0, 12)) console.log(" -", e);
} else {
  console.log("no console errors");
}

await browser.close();
