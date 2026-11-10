import { defineConfig, devices } from "@playwright/test";

// Tests the production build, served under the same base path as on
// GitHub Pages. Use relative URLs in tests: page.goto("dag-8").
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // A stray test.only must not make CI pass with half the tests
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173/laos-cambodja/",
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
    command: "npm run build && npm run preview",
    url: "http://localhost:4173/laos-cambodja/",
    reuseExistingServer: !process.env.CI,
  },
});
