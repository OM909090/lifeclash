/** Dev-only: mobile-viewport pass over every route. */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
mkdirSync(".screens", { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN ?? "/usr/bin/google-chrome-stable",
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
page.setDefaultTimeout(6000);

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

if (existsSync(".screens/seed.json")) {
  const seed = JSON.parse(readFileSync(".screens/seed.json", "utf8"));
  await page.addInitScript((s) => {
    localStorage.setItem("lifeclash.game", s.game);
    localStorage.setItem("lifeclash.onboarding", s.onboarding);
  }, seed);
}

const go = async (route, name, full = false) => {
  await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `.screens/${name}.png`, fullPage: full });
  // Horizontal overflow is the classic mobile break — check for it explicitly.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  console.log(`  ▸ ${name}${overflow > 2 ? `  ⚠ overflows by ${overflow}px` : ""}`);
};

console.log("mobile 390x844:");
await go("/", "mb-1-landing", true);
await go("/onboarding", "mb-2-onboarding");
await go("/village", "mb-3-village");

// quest modal on mobile
await page.getByRole("button", { name: "Quests", exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: ".screens/mb-4-quests.png" });
console.log("  ▸ mb-4-quests");

console.log(errors.length ? `\n${errors.length} error(s):` : "\nno console errors");
for (const e of errors.slice(0, 8)) console.log(" -", e);
await browser.close();
