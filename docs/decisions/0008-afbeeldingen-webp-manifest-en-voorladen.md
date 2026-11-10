---
status: accepted
date: 2026-11-10
---

# Afbeeldingen: WebP, een manifest uit de build, voorladen per buurt

## Context en probleem

Cartoons waren PNG's (7,7 MB samen). De tijdlijn toonde foto's van 1400 px op 172×61 px. De galerij zocht foto's door `02.webp`, `03.webp`… te laden tot een 404. Na het opstarten werden de foto's en cartoons van alle 21 dagen gedownload. 18 fallbackfoto's werden van externe sites gehaald, maar nooit getoond.

## Keuze

- **WebP** voor foto's, cartoons en thumbnails, gemaakt door `npm run images` uit de originelen in `img/*-src/` (niet in git). AVIF scheelt nog wat, maar vraagt `<picture>`-markup; JPEG XL wordt nog niet breed ondersteund.
- **Thumbnails** van 360 px breed (`thumb.webp`, ~15 KB in plaats van ~130 KB).
- **Manifest**: `build/photo-manifest.ts` telt de foto's per dag bij build en dev-start (`virtual:photo-manifest`) en stopt de build als er iets ontbreekt of een nummer wordt overgeslagen.
- **Voorladen per buurt**: na het opstarten alleen de thumbnails en de dagen ervoor en erna; bij elke dagwissel de volgende buren.
- **Geen externe foto's**: de fallback is weg; de build bewaakt dat elke stop eigen foto's heeft.

### Gevolgen

- Goed: eerste bezoek 4,4 MB → 1,1 MB, bewaakt door het budget (ADR 0006).
- Minder goed: spring je naar een dag ver weg, dan kan de kaart heel even zonder foto verschijnen.

## Meer informatie

- [WebP, AVIF en JPEG XL in 2026](https://imageseo.io/blog/webp-vs-avif-vs-jpeg-xl-2026/)
- Commits `7460cfc`, `d6cf1cf`, `c497213`, `0280878`
