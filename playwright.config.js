import { defineConfig, devices } from "@playwright/test";

// Serves the site like GitHub Pages: unknown paths such as /dag-8 get
// 404.html, which loads index.html for that day.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
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
    command: "npx serve . -l 4173 --no-request-logging",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
