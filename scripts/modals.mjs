/**
 * Dev-only: opens every modal and the building radial menu, screenshotting
 * each. Requires .screens/seed.json (produced by flow.mjs).
 *
 *   node scripts/modals.mjs
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

mkdirSync(".screens", { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN ?? "/usr/bin/google-chrome-stable",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
// Fail fast — a hung selector should report, not stall the whole run.
page.setDefaultTimeout(6000);

/** Click if present; never throw. */
const tap = async (locator, what) => {
  try {
    if (!(await locator.count())) {
      console.log("  ! not found:", what);
      return false;
    }
    await locator.first().click({ timeout: 5000 });
    return true;
  } catch (e) {
    console.log("  ! click failed:", what, "\n" + String(e).split("\n").filter(l=>/intercept|Timeout|waiting for|subtree|hidden|disabled|not stable/.test(l)).slice(0,4).join("\n"));
    return false;
  }
};

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

if (!existsSync(".screens/seed.json")) {
  console.error("run scripts/flow.mjs first to capture a seeded realm");
  process.exit(1);
}
const seed = JSON.parse(readFileSync(".screens/seed.json", "utf8"));
await page.addInitScript((s) => {
  if (s.game) localStorage.setItem("lifeclash.game", s.game);
  if (s.onboarding) localStorage.setItem("lifeclash.onboarding", s.onboarding);
}, seed);

await page.goto("http://localhost:3000/village", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const shot = async (name) => {
  await page.waitForTimeout(700);
  await page.screenshot({ path: `.screens/${name}.png` });
  console.log("  ▸", name);
};

const closeAny = async () => {
  await tap(page.getByRole("button", { name: "Close", exact: true }), "Close");
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
};

// ---------------------------------------------------------------- radial menu
console.log("village interaction:");
if (await tap(page.getByRole("button", { name: /Town Hall, level/ }), "Town Hall")) {
  await shot("md-0-radial");
  if (await tap(page.getByRole("button", { name: "Info", exact: true }), "Info")) {
    await shot("md-1-info");
    await closeAny();
  }
}

// ------------------------------------------------------------------- bottom HUD
console.log("modals:");
for (const [label, name] of [
  ["Quests", "md-2-quests"],
  ["Raid Boss", "md-3-raid"],
  ["Clan", "md-4-clan"],
  ["Shop", "md-5-shop"],
  ["Settings", "md-6-settings"],
]) {
  if (await tap(page.getByRole("button", { name: label, exact: true }), label)) {
    await shot(name);
    await closeAny();
  }
}

// ------------------------------------------------------ leaderboard + season
if (await tap(page.getByRole("button", { name: /League, .* trophies/ }), "league badge")) {
  await shot("md-7-leaderboard");
  if (await tap(page.getByRole("button", { name: /Season track/ }), "Season track")) {
    await shot("md-8-season");
  }
  await closeAny();
}

// ------------------------------------------------------------------- profile
if (await tap(page.getByRole("button", { name: /Open profile/ }), "profile")) {
  await shot("md-9-profile");
  await closeAny();
}

// -------------------------------------------------- complete a quest for real
console.log("quest completion:");
await tap(page.getByRole("button", { name: "Quests", exact: true }), "Quests");
await page.waitForTimeout(600);
if (await tap(page.getByRole("button", { name: /Done/ }), "Done")) {
  await shot("md-10-reward");
  await tap(page.getByRole("dialog").getByRole("button", { name: "Collect", exact: true }), "Collect");
  await page.waitForTimeout(600);
  await shot("md-11-after-reward");
}
await closeAny();
await shot("md-12-village-after");

// ------------------------------------------------------------------- upgrade
// Fresh load so the upgrade flow is exercised in isolation.
await page.goto("http://localhost:3000/village", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
if (await tap(page.getByRole("button", { name: /Academy, level/ }), "Academy")) {
  await page.waitForTimeout(400);
  if (await tap(page.getByRole("button", { name: "Upgrade", exact: true }), "Upgrade action")) {
    await shot("md-13-upgrade");
    if (await tap(page.getByRole("dialog").getByRole("button", { name: /Upgrade/ }), "confirm upgrade")) {
      await page.waitForTimeout(1400);
      await shot("md-14-upgraded");
    }
  }
}

console.log(errors.length ? `\n${errors.length} error(s):` : "\nno console errors");
for (const e of errors.slice(0, 10)) console.log(" -", e);

await browser.close();
