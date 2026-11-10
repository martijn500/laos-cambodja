import { test, expect, type Page, type TestInfo } from "@playwright/test";

// Titles painted so far, recorded by the first test in the page
declare global {
  interface Window {
    __seen: string[];
  }
}

const isMobile = (testInfo: TestInfo) => testInfo.project.name === "mobile";

// Collects uncaught errors and Content-Security-Policy violations (the
// browser only logs those); every test ends by asserting there were none
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Content Security Policy|Trusted(Script|HTML)/.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  return errors;
}

async function waitForBoot(page: Page): Promise<void> {
  await page.waitForFunction(
    () => !document.body.classList.contains("is-booting"),
  );
}

const popupTitle = (page: Page) => page.locator(".trip-popup-slide h2");

test("opens the day from the URL as a popup, without showing other days first", async ({
  page,
}) => {
  const errors = trackErrors(page);
  // Log every distinct title that is actually painted, from the first frame
  await page.addInitScript(() => {
    window.__seen = [];
    const visibleTitle = () => {
      for (const h2 of document.querySelectorAll("h2")) {
        if (!h2.getBoundingClientRect().width) continue;
        let element: HTMLElement | null = h2;
        let opacity = 1;
        let hidden = false;
        while (element) {
          const style = getComputedStyle(element);
          if (style.visibility === "hidden" || style.display === "none")
            hidden = true;
          opacity *= Number(style.opacity);
          element = element.parentElement;
        }
        if (!hidden && opacity > 0.05) return h2.textContent.trim();
      }
      return null;
    };
    const loop = () => {
      // Init scripts run before <body> exists, whatever the types say
      const body = document.body as HTMLElement | null;
      const title = body ? visibleTitle() : null;
      if (title && window.__seen.at(-1) !== title) window.__seen.push(title);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  await page.goto("dag-8");
  await waitForBoot(page);
  await expect(popupTitle(page)).toHaveText("Luang Prabang: oude stad");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__seen)).toEqual([
    "Luang Prabang: oude stad",
  ]);
  expect(errors).toEqual([]);
});

test("falls back to the plain slide when the map library can't load", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.route(/unpkg\.com/, (route) => route.abort());
  await page.goto("dag-12");
  await waitForBoot(page);
  await expect(page.locator(".slide.active h2")).toHaveText(
    "Trein naar Vientiane",
  );
  expect(errors).toEqual([]);
});

test("next / previous change the day and the URL", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("dag-8");
  await waitForBoot(page);
  await page.getByRole("button", { name: "Volgende pagina" }).click();
  await expect(popupTitle(page)).toHaveText(/NAGINI BAR/);
  await page.getByRole("button", { name: "Volgende pagina" }).click();
  await expect(page).toHaveURL(/\/dag-9$/);
  await expect(popupTitle(page)).toHaveText("Kuang Si-watervallen");
  await page.getByRole("button", { name: "Vorige pagina" }).click();
  await expect(page).toHaveURL(/\/dag-8$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dag-9$/);
  await expect(popupTitle(page)).toHaveText("Kuang Si-watervallen");
  // Same URL as day 8, but history remembers it was the side quest
  await page.goBack();
  await expect(page).toHaveURL(/\/dag-8$/);
  await expect(popupTitle(page)).toHaveText(/NAGINI BAR/);
  expect(errors).toEqual([]);
});

test("closing the popup and reopening it from its marker", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("dag-6");
  await waitForBoot(page);
  await page.locator(".trip-popup-slide .slide-close").click();
  await expect(page.locator("body")).toHaveClass(/popup-closed/);
  await expect(popupTitle(page)).toHaveCount(0);
  await page.locator(".map-day-marker[aria-current]").click();
  await expect(popupTitle(page)).toHaveText("Slowboat naar Pakbeng");
  expect(errors).toEqual([]);
});

test("keyboard: few Tab stops, arrows move through days", async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo), "keyboard only");
  const errors = trackErrors(page);
  await page.goto("dag-8");
  await waitForBoot(page);

  const stops: string[] = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    stops.push(
      await page.evaluate(() => {
        const element = document.activeElement;
        return (
          element?.getAttribute("aria-label") ??
          element?.textContent ??
          ""
        ).trim();
      }),
    );
  }
  expect(stops[0]).toMatch(/Luang Prabang/); // current day in the timeline
  expect(stops[1]).toBe("Vorige pagina");
  expect(stops[2]).toBe("Volgende pagina");

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  for (
    let i = 0;
    i < 10 &&
    !(await page.evaluate(() =>
      document.activeElement?.matches(".page-indicator"),
    ));
    i++
  ) {
    await page.keyboard.press("Shift+Tab");
  }
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/dag-9$/);
  await expect(page.locator(".page-indicator:focus")).toHaveAttribute(
    "aria-current",
    "step",
  );
  await page.keyboard.press("End");
  await expect(page).toHaveURL(/\/dag-18$/);
  await page.keyboard.press("Home");
  await expect(page).toHaveURL(/\/dag-1$/);
  expect(errors).toEqual([]);
});

test("photo gallery: finds all photos, switches and can be stopped", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.goto("dag-14");
  await waitForBoot(page);
  const slide = page.locator(".trip-popup-slide");
  await expect(slide.locator(".photo-dot")).toHaveCount(4);

  await slide.locator(".photo-dot").nth(2).click();
  await expect(slide.locator(".slide-photo.is-current")).toHaveAttribute(
    "src",
    /14\/03\.webp$/,
  );

  const toggle = slide.locator(".photo-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("body")).toHaveClass(/slideshow-stopped/);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(errors).toEqual([]);
});

test("photos come from the day's folder", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("dag-2");
  await waitForBoot(page);
  await expect(
    page.locator(".trip-popup-slide .slide-photo.is-current"),
  ).toHaveAttribute("src", /slides\/02\/01\.webp$/);
  expect(errors).toEqual([]);
});

test("timeline shows one card per stop", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo), "timeline is hidden on mobile");
  await page.goto("./");
  await waitForBoot(page);
  await expect(page.locator(".page-indicator")).toHaveCount(21);
  await expect(page.locator(".page-indicator[aria-current]")).toHaveCount(1);
});

test("fast clicking ends with exactly one card: the current day", async ({
  page,
}) => {
  const errors = trackErrors(page);
  await page.goto("dag-3");
  await waitForBoot(page);
  await expect(popupTitle(page)).toHaveCount(1);
  const next = page.locator(".nav-btn-next");
  // Faster than the close animation, so wishes pile up mid-transition
  for (let i = 0; i < 6; i++) await next.click({ delay: 0 });
  await page.locator(".nav-btn-prev").click({ delay: 0 });
  await expect(page).toHaveURL(/\/dag-8$/);
  await expect(popupTitle(page)).toHaveText("Luang Prabang: oude stad");
  await page.waitForTimeout(1000);
  await expect(page.locator(".trip-day-popup")).toHaveCount(1);
  await expect(popupTitle(page)).toHaveText("Luang Prabang: oude stad");
  expect(errors).toEqual([]);
});
