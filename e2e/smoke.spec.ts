import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.ts";

// A short check that this trip builds into a working site: the trip's
// book (ADR 0052 in the app's repo). The app itself is tested in full in
// its own (private) repo; here: does it start, does a day's page open,
// and is it accessible with this trip's texts and photos.

test.use({ reducedMotion: "reduce" });

const where = (page: import("@playwright/test").Page) =>
  page.locator(".book-where");

test("the home page opens the book on its cover with this trip's title", async ({
  page,
}) => {
  await page.goto("./");
  await expect(where(page)).toHaveText("OMSLAG");
  await expect(page.locator(".book-cover-title")).toContainText("LAOS");
});

test("a day page opens the book on that day, without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // CSP violations only show up in the console
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("dag-8");
  await expect(where(page)).toHaveText(/^DAG 8 · /);
  await expect(page).toHaveTitle(/^Dag 8: /);
  expect(errors).toEqual([]);
});

test("a day's page has no axe violations", async ({ page }) => {
  await page.goto("dag-8");
  await expect(where(page)).toHaveText(/^DAG 8 · /);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude(".maplibregl-canvas-container")
    .analyze();
  expect(violations.map((violation) => violation.id)).toEqual([]);
});
