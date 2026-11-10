---
status: accepted
date: 2026-11-10
---

# Vite als build, met een eigen pagina per dag

## Context en probleem

De site had geen build: losse ES-modules, een handmatig bijgehouden `modulepreload`-lijst (met een test om die te bewaken), MapLibre van unpkg en fonts van Google Fonts. Dagen als `/dag-8` werkten via `404.html`, dat `index.html` ophaalde en met `document.write` neerzette: de server gaf HTTP 404, dus linkpreviews en zoekmachines zagen een fout. Er was geen hot reload.

## Overwogen opties

- Geen build houden en de 404-route laten
- Vite 8 (Rolldown)
- Een static site generator (Astro, Eleventy)

## Keuze

**Vite 8**, met drie eigen plugins in `build/`:

- `day-pages.ts` schrijft `dag-N.html` per dag: kopie van `index.html` met titel, beschrijving, canonical en `og:image` van die dag. GitHub Pages serveert `/dag-8` dan met status 200 (het zoekt zelf naar `dag-8.html`).
- `photo-manifest.ts` (zie ADR 0008), `csp.ts` (ADR 0007), `version-stamp.ts` (ADR 0011), `static-dirs.ts` (kopieert `img/slides` en `img/cartoons`, zonder de originelen ernaast).

Een static site generator viel af: de app is één interactieve pagina, geen verzameling contentpagina's; Vite doet wat nodig is met minder om te leren.

### Gevolgen

- Goed: hot reload, automatische preloads en minificatie, gehashte bestandsnamen, MapLibre in een eigen chunk die gecachet blijft.
- Goed: echte URL's per dag met linkpreview.
- Goed: fonts en MapLibre zelf gehost: geen bezoekers-IP's naar Google of unpkg.
- Minder goed: er is een build-stap; GitHub Pages moet op "GitHub Actions" staan (ADR 0011).
- Let op: MapLibre 6 is alleen ESM en heeft een apart worker-bestand (zie [gotchas](../reference/gotchas.md#maplibre)).

## Meer informatie

- [Vite 8.1](https://vite.dev/blog/announcing-vite8-1), [Rolldown en Vite 8](https://certificates.dev/blog/rolldown-and-vite-8-what-changed)
- [MapLibre 6: alleen ESM, WebGL 2 verplicht](https://geo.malagis.com/maplibre-gl-js-v6-mandatory-webgl-and-esm-only.html)
- [Google Fonts en de AVG (uitspraak München)](https://captaincompliance.com/education/google-fonts-and-gdpr-what-the-munich-ruling-requires-and-how-to-self-host-your-way-out-of-exposure/)
- Commit `82b24d8`
