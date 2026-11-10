import { defineConfig } from "vite";
import { contentSecurityPolicy } from "./build/csp.ts";
import { dayPages } from "./build/day-pages.ts";
import { photoManifest } from "./build/photo-manifest.ts";
import { staticDirs } from "./build/static-dirs.ts";
import { versionStamp } from "./build/version-stamp.ts";

// GitHub Pages serves the site from https://martijn500.github.io/laos-cambodja/
const SITE_ORIGIN = "https://martijn500.github.io";
const BASE = "/laos-cambodja/";

export default defineConfig({
  base: BASE,
  build: {
    rolldownOptions: {
      output: {
        // MapLibre (~1 MB) changes far less often than the app: its own
        // file stays cached across deploys
        codeSplitting: {
          groups: [{ name: "maplibre", test: /node_modules[\\/]maplibre-gl/ }],
        },
      },
    },
    chunkSizeWarningLimit: 1100,
    // Never inline fonts as data: URIs (the CSP allows fonts from our own
    // origin only, and browsers that use .woff2 never need the .woff)
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
  },
  plugins: [
    photoManifest(),
    contentSecurityPolicy(),
    versionStamp(),
    dayPages({ siteOrigin: SITE_ORIGIN, base: BASE }),
    staticDirs(["img/slides", "img/cartoons"]),
  ],
  // MapLibre starts its worker with { type: "module" }
  worker: { format: "es" },
  // npm run dev: CSS changes swap in place, JS/HTML changes reload the page
  server: { open: true },
  preview: { port: 4173, strictPort: true },
});
