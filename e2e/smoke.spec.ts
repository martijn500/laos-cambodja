import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.ts";

// A short check that this trip builds into a working site. The app itself
// is tested in full in its own (private) repo; here: does it start, does a
// day open, and is it accessible with this trip's texts and photos.

test.use({ reducedMotion: "reduce" });

test("the home page shows the start screen with this trip's title", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".start-title")).toContainText("LAOS");
  await expect(page.locator(".start-btn")).toBeFocused();
});

test("a day page opens that day's card, without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // CSP violations only show up in the console
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("dag-8");
  await expect(page.locator(".trip-popup-slide h2")).toBeVisible();
  await expect(page).toHaveTitle(/^Dag 8: /);
  expect(errors).toEqual([]);
});

test("a day with its card open has no axe violations", async ({ page }) => {
  await page.goto("dag-8");
  await expect(page.locator(".trip-popup-slide h2")).toBeVisible();
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude(".maplibregl-canvas-container")
    .analyze();
  expect(violations.map((violation) => violation.id)).toEqual([]);
});
