import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { resolve } from "node:path";

const executablePath =
  process.env.BROWSER_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await page.goto(process.env.SITE_URL || "http://localhost:4173/", {
      waitUntil: "networkidle",
    });
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(
      await page.locator("h1").innerText(),
      "Make room for the music.",
    );
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll("*")]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 12)
        .map(
          (el) =>
            `${el.tagName}.${el.className?.baseVal || el.className || ""}: ${Math.round(el.getBoundingClientRect().right)}`,
        ),
    }));
    assert.equal(
      layout.scrollWidth <= layout.viewport,
      true,
      `Horizontal overflow at ${width}px: ${JSON.stringify(layout)}`,
    );
    await page.locator("#lang-switch").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "es");
    assert.equal(
      await page.locator("h1").innerText(),
      "Dale espacio a la música.",
    );
    assert.equal(
      await page.locator("#lang-switch").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#gallery").scrollIntoViewIfNeeded();
    await page.locator("#gallery img").first().waitFor({ state: "visible" });
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#gallery img")].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    await page.addScriptTag({
      path: resolve("node_modules/axe-core/axe.min.js"),
    });
    const violations = await page.evaluate(async () =>
      (
        await window.axe.run(document, {
          runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        })
      ).violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    );
    assert.deepEqual(violations, [], `Accessibility violations at ${width}px`);
    await page.screenshot({ path: `${width}-check.png`, fullPage: true });
    await page.close();
  }
  console.log(
    "Browser smoke passed: 390px / 1440px, no overflow, language switch and WCAG 2/2.1 AA axe checks pass.",
  );
} finally {
  await browser.close();
}
