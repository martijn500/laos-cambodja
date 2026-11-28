import { defineConfig, devices } from "@playwright/test";
import trip from "./trip.config.ts";

const LOCAL = `http://localhost:4173${trip.site.base}`;

// Tests the production build, served under the same base path as on
// GitHub Pages. Use relative URLs in tests: page.goto("dag-8").
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // A stray test.only must not make CI pass with half the tests
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: LOCAL,
    // The app follows the browser's language; these tests read Dutch
    locale: "nl-NL",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1400, height: 880 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // The site as it is built for Pages
    command: "npm run build && npm run preview",
    url: LOCAL,
    reuseExistingServer: !process.env.CI,
  },
});
