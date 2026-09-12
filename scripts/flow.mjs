/**
 * Dev-only interaction walkthrough: drives the onboarding wizard and the
 * village, screenshotting each beat. Verifies the flow actually works rather
 * than just that it renders.
 *
 *   node scripts/flow.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync(".screens", { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN ?? "/usr/bin/google-chrome-stable",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

const shot = async (name) => {
  await page.waitForTimeout(650);
  await page.screenshot({ path: `.screens/${name}.png` });
  console.log("  ▸", name);
};

console.log("onboarding:");
await page.goto("http://localhost:3000/onboarding", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// Step 1 — realm
await page.fill('input[placeholder="Everhold"]', "Ironvale");
await page.fill('input[placeholder="Chieftain"]', "Om");
await page.click('button[aria-label="Crest 🐉"]');
await shot("ob-1-realm");
await page.getByRole("button", { name: /Next/ }).click();

// Step 2 — pillars
await page.getByRole("checkbox", { name: /Mind/ }).click();
await page.getByRole("checkbox", { name: /Body/ }).click();
await page.getByRole("checkbox", { name: /Discipline/ }).click();
await shot("ob-2-pillars");
await page.getByRole("button", { name: /Next/ }).click();

// Step 3 — consistency
await page.getByRole("radio", { name: /On and off/ }).click();
await shot("ob-3-consistency");
await page.getByRole("button", { name: /Next/ }).click();

// Step 4 — nemesis
await page.getByRole("radio", { name: /Procrastination/ }).click();
await shot("ob-4-nemesis");
await page.getByRole("button", { name: /Next/ }).click();

// Step 5 — time
await page.getByRole("radio", { name: /30 min/ }).click();
await shot("ob-5-time");
await page.getByRole("button", { name: /Next/ }).click();

// Step 6 — goal
await page.getByRole("button", { name: /Crack a placement/ }).click();
await shot("ob-6-goal");
await page.getByRole("button", { name: /Forge my world/ }).click();

// Step 7 — forge (catch it mid-animation)
await page.waitForTimeout(2600);
await shot("ob-7-forge");

// Step 8 — enter. Wait for the fly-in and every building drop to settle.
await page.waitForTimeout(7800);
await shot("ob-8-enter");

const enterBtn = page.getByRole("button", { name: /Enter your realm|Got it/ });
if (await enterBtn.count()) {
  // click through remaining tutorial beats
  for (let i = 0; i < 4; i += 1) {
    const got = page.getByRole("button", { name: /Got it/ });
    if (await got.count()) {
      await got.click();
      await page.waitForTimeout(500);
    } else break;
  }
  const fin = page.getByRole("button", { name: /Enter your realm/ });
  if (await fin.count()) await fin.click();
}

console.log("village:");
await page.waitForURL(/\/village/, { timeout: 15_000 }).catch(() => {
  console.log("  ! never reached /village — navigating directly");
});
await page.goto("http://localhost:3000/village", { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await shot("vg-1-board");

// Persist the seeded realm so shoot.mjs can jump straight to /village.
const state = await page.evaluate(() =>
  JSON.stringify({
    game: localStorage.getItem("lifeclash.game"),
    onboarding: localStorage.getItem("lifeclash.onboarding"),
  }),
);
writeFileSync(".screens/seed.json", state);
console.log("  ▸ saved .screens/seed.json");

console.log(errors.length ? `\n${errors.length} error(s):` : "\nno console errors");
for (const e of errors.slice(0, 10)) console.log(" -", e);

await browser.close();
