import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

// Automated checks catch roughly a third of WCAG issues; they guard what
// is already right (labels, roles, contrast, focus order) against
// regressions. Keyboard behaviour has its own tests in app.spec.ts.
async function scan(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    // MapLibre's canvas and tiles are third-party and not ours to fix
    .exclude(".maplibregl-canvas-container")
    .analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(" ")).join(", ")})`,
  );
}

test("a day with its card open has no axe violations", async ({ page }) => {
  await page.goto("dag-8");
  await page.waitForFunction(
    () => !document.body.classList.contains("is-booting"),
  );
  await expect(page.locator(".trip-popup-slide h2")).toBeVisible();
  // Let the entrance animation finish: half-faded text fails contrast
  await page.waitForTimeout(800);
  expect(await scan(page)).toEqual([]);
});

test("the map with the card closed has no axe violations", async ({ page }) => {
  await page.goto("dag-8");
  await expect(page.locator(".trip-popup-slide h2")).toBeVisible();
  await page.locator(".trip-popup-slide .slide-close").click();
  await expect(page.locator(".trip-day-popup")).toHaveCount(0);
  expect(await scan(page)).toEqual([]);
});
