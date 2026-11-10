import { defineConfig } from "vite";
import { dayPages } from "./build/day-pages.ts";
import { photoManifest } from "./build/photo-manifest.ts";
import { staticDirs } from "./build/static-dirs.ts";

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
  },
  plugins: [
    photoManifest(),
    dayPages({ siteOrigin: SITE_ORIGIN, base: BASE }),
    staticDirs(["img/slides", "img/cartoons"]),
  ],
  // MapLibre starts its worker with { type: "module" }
  worker: { format: "es" },
  // npm run dev: CSS changes swap in place, JS/HTML changes reload the page
  server: { open: true },
  preview: { port: 4173, strictPort: true },
});
