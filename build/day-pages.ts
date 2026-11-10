import type { Plugin } from "vite";
import { itinerary } from "../src/data/itinerary.ts";

const escapeHtml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/**
 * Set the content of <meta name|property="key" content="…">; the tag must
 * exist in index.html, so a renamed tag fails the build instead of
 * silently shipping the wrong preview.
 */
function setTagValue(html: string, key: string, value: string): string {
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
 */
export function dayPages({
  siteOrigin,
  base,
}: {
  siteOrigin: string;
  base: string;
}): Plugin {
  return {
    name: "day-pages",
    apply: "build",
    // After Vite's own HTML plugin has written index.html into the bundle
    enforce: "post",
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (index?.type !== "asset") throw new Error("index.html missing");
      const html = String(index.source);
      // Side quests share their day's page
      for (const stop of itinerary.filter((s) => !s.sideQuest)) {
        const { day } = stop;
        const title = `Dag ${day}: ${stop.title} · Laos & Cambodja`;
        const url = `${siteOrigin}${base}dag-${day}`;
        const image = `${siteOrigin}${base}img/slides/${stop.slug}/01.webp`;
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
  };
}
