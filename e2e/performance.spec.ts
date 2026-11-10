import { test, expect, type Page, type Request } from "./fixtures.ts";

/*
 * Performance budget: fails when a change makes the first visit to a day
 * noticeably heavier or slower. Only our own files count; the map style
 * is a local stub (fixtures.ts). Sizes are what goes over the wire (the preview server
 * compresses like GitHub Pages does). Raise a budget on purpose, in the
 * same commit as the change that needs it.
 */
const BUDGET_KB = {
  // Measured Nov 2026 (dag-8, desktop) plus ~20% headroom
  script: 360, // 296: app + MapLibre + its worker, compressed
  stylesheet: 35, // 27
  font: 40, // 30
  image: 950, // 790: this day and its neighbours, timeline thumbnails
  total: 1400, // 1145
} as const;

// Same limit as "good" LCP, applied to the moment the day card is shown
// (performance mark in src/boot.ts): LCP itself misses the card
const CARD_SHOWN_BUDGET_MS = 2500;
const CLS_BUDGET = 0.1; // "good" Core Web Vitals threshold

type Kind = keyof typeof BUDGET_KB;

function kindOf(request: Request): Kind | null {
  const type = request.resourceType();
  if (type === "script" || type === "stylesheet" || type === "font") {
    return type;
  }
  if (type === "image") return "image";
  return null;
}

async function measureTransfer(page: Page, path: string, ownOrigin: string) {
  const kb: Record<Kind, number> = {
    script: 0,
    stylesheet: 0,
    font: 0,
    image: 0,
    total: 0,
  };
  const pending: Promise<void>[] = [];
  page.on("requestfinished", (request) => {
    if (!request.url().startsWith(ownOrigin)) return;
    pending.push(
      request.sizes().then((sizes) => {
        const size =
          (sizes.responseBodySize + sizes.responseHeadersSize) / 1024;
        const kind = kindOf(request);
        if (kind) kb[kind] += size;
        kb.total += size;
      }),
    );
  });
  await page.goto(path);
  await page.waitForFunction(
    () => !document.body.classList.contains("is-booting"),
  );
  // The deferred images start once the opening day is shown
  await page.waitForLoadState("networkidle");
  await Promise.all(pending);
  return kb;
}

test("first visit to a day stays within the transfer budget", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "same files on mobile");
  const ownOrigin = new URL(testInfo.project.use.baseURL ?? "").origin;
  const kb = await measureTransfer(page, "dag-8", ownOrigin);
  testInfo.annotations.push({
    type: "transfer (KB)",
    description: JSON.stringify(
      Object.fromEntries(
        Object.entries(kb).map(([kind, size]) => [kind, Math.round(size)]),
      ),
    ),
  });
  for (const kind of Object.keys(BUDGET_KB) as Kind[]) {
    expect
      .soft(Math.round(kb[kind]), `${kind} in KB`)
      .toBeLessThanOrEqual(BUDGET_KB[kind]);
  }
});

test("the day card shows fast and nothing shifts", async ({ page }) => {
  await page.addInitScript(() => {
    const vitals = { cls: 0 };
    Object.assign(window, { __vitals: vitals });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      })[]) {
        if (!entry.hadRecentInput) vitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("dag-8");
  await expect(page.locator(".trip-popup-slide h2")).toBeVisible();
  await page.waitForTimeout(1500);
  const vitals = await page.evaluate(() => ({
    cardShown:
      performance.getEntriesByName("day-card-shown")[0]?.startTime ?? null,
    cls: (window as unknown as { __vitals: { cls: number } }).__vitals.cls,
  }));
  test.info().annotations.push({
    type: "vitals",
    description: JSON.stringify(vitals),
  });
  expect(vitals.cardShown, "day card shown at (ms)").not.toBeNull();
  expect(vitals.cardShown ?? Infinity).toBeLessThanOrEqual(
    CARD_SHOWN_BUDGET_MS,
  );
  expect(vitals.cls, "CLS").toBeLessThanOrEqual(CLS_BUDGET);
});
