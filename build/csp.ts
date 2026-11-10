import type { Plugin } from "vite";

/**
 * Content-Security-Policy as a <meta> tag: GitHub Pages can't send
 * headers. Only the build gets it; the dev server injects inline scripts
 * for hot reload. Everything comes from our own origin except the map
 * style, tiles, glyphs and sprites from OpenFreeMap.
 *
 * Trusted Types: the app never turns strings into HTML or script URLs
 * (no innerHTML), so the browser refuses every such sink except the one
 * MapLibre worker URL. A dependency that starts doing it shows up as an
 * error in the e2e tests.
 */
const MAP_HOST = "https://tiles.openfreemap.org";

const POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // MapLibre's worker is a bundled file on our origin
  "worker-src 'self'",
  `connect-src 'self' ${MAP_HOST}`,
  // MapLibre turns sprites and tiles into blob:/data: images
  `img-src 'self' data: blob: ${MAP_HOST}`,
  "style-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "require-trusted-types-for 'script'",
  // Only the default policy in src/map/map.ts, which admits MapLibre's
  // worker URL and nothing else
  "trusted-types default",
].join("; ");

export function contentSecurityPolicy(): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: POLICY },
        // Before anything it governs
        injectTo: "head-prepend",
      },
    ],
  };
}
