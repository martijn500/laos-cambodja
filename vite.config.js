import { cpSync } from "node:fs";
import { defineConfig } from "vite";
import {
  itinerary,
  caricatureNames,
  tripDayNumbers,
} from "./js/data/itinerary.js";

// GitHub Pages serves the site from https://martijn500.github.io/laos-cambodja/
const SITE_ORIGIN = "https://martijn500.github.io";
const BASE = "/laos-cambodja/";

/** Folders the app loads by path at runtime, copied into dist/ as they are */
const STATIC_DIRS = ["img/slides", "img/cartoons"];

/** @param {string} text */
const escapeHtml = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/**
 * Set the content of <meta name|property="key" content="…">; the tag must
 * exist in index.html, so a renamed tag fails the build instead of
 * silently shipping the wrong preview.
 * @param {string} html
 * @param {string} key
 * @param {string} value
 */
function setTagValue(html, key, value) {
  const pattern = new RegExp(
    `(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*`,
  );
  if (!pattern.test(html)) throw new Error(`<meta ${key}> missing`);
  return html.replace(pattern, `$1${value}`);
}

/**
 * Every day gets its own page, dag-N.html, which GitHub Pages serves for
 * /dag-N with status 200. It is index.html with that day's title,
 * description and preview image, so a shared link previews the day.
 * @returns {import("vite").Plugin}
 */
function dayPages() {
  return {
    name: "day-pages",
    apply: "build",
    // After Vite's own HTML plugin has written index.html into the bundle
    enforce: "post",
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (index?.type !== "asset") throw new Error("index.html missing");
      const html = String(index.source);
      const days = new Map();
      // The first stop of a date is the day itself; side quests follow it
      for (const stop of itinerary) {
        const day = tripDayNumbers.get(stop.date);
        if (!days.has(day)) days.set(day, stop);
      }
      for (const [day, stop] of days) {
        const title = `Dag ${day}: ${stop.title} · Laos & Cambodja`;
        const url = `${SITE_ORIGIN}${BASE}dag-${day}`;
        const image = `${SITE_ORIGIN}${BASE}img/slides/${caricatureNames.get(stop)}/01.webp`;
        const page = Object.entries({
          description: escapeHtml(stop.detail),
          "og:description": escapeHtml(stop.detail),
          "og:title": escapeHtml(title),
          "og:url": url,
          "og:image": image,
        }).reduce(
          (result, [key, value]) => setTagValue(result, key, value),
          html
            .replace(
              /<title>[^<]*<\/title>/,
              `<title>${escapeHtml(title)}</title>`,
            )
            .replace(/(<link\s+rel="canonical"\s+href=")[^"]*/, `$1${url}`),
        );
        this.emitFile({
          type: "asset",
          fileName: `dag-${day}.html`,
          source: page,
        });
      }
    },
    writeBundle({ dir }) {
      for (const folder of STATIC_DIRS) {
        cpSync(folder, `${dir}/${folder}`, { recursive: true });
      }
    },
  };
}

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
  plugins: [dayPages()],
  // MapLibre starts its worker with { type: "module" }
  worker: { format: "es" },
  // npm run dev: CSS changes swap in place, JS/HTML changes reload the page
  server: { open: true },
  preview: { port: 4173, strictPort: true },
});
