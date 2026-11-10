import { test as base } from "@playwright/test";

/**
 * Every e2e test gets a minimal local map style instead of OpenFreeMap's:
 * one grey background layer, no tiles, fonts or sprites. The map then
 * loads at once and the same way on every run, so the tests measure this
 * app and not the speed of a third-party tile server (an LCP check failed
 * in CI on a slow tile response). Camera, markers and popups still work:
 * they depend on the map's projection, not on what it draws.
 */
const STUB_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#e8e8e8" },
    },
  ],
};

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route("https://tiles.openfreemap.org/**", (route) =>
      route.fulfill({ json: STUB_STYLE }),
    );
    await use(context);
  },
});

export { expect } from "@playwright/test";
export type { Page, Request, TestInfo } from "@playwright/test";
