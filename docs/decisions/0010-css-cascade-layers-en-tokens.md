---
status: accepted
date: 2026-11-10
---

# CSS met cascade layers en design tokens

## Context en probleem

De CSS-bestanden werkten alleen in een vaste laadvolgorde ("geladen in deze volgorde"), en eigen regels moesten specifieker zijn dan die van MapLibre om te winnen. Tokens stonden tussen de resetregels.

## Overwogen opties

- Een preprocessor (Sass)
- Utility-CSS (Tailwind)
- Gewone CSS met `@layer`, nesting en custom properties

## Keuze

**Gewone CSS** met `@layer vendor, tokens, base, components` in `src/styles/main.css`: een regel in een latere laag wint altijd, ongeacht volgorde of specificiteit. Alle kleuren, fonts, radii en timings in `tokens.css`. stylelint bewaakt de notatie. `@layer` is Baseline Widely Available.

### Gevolgen

- Goed: MapLibre's CSS staat in `vendor` en verliest altijd van de app.
- Goed: screenshots waren pixel-identiek voor en na.
- Regel: geen kleuren of timings buiten `tokens.css`.

## Meer informatie

- [@layer (MDN)](https://developer.mozilla.org/docs/Web/CSS/@layer)
- Commit `457d091`
