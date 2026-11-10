---
status: accepted
date: 2026-11-10
---

# Strict TypeScript, alleen "erasable" syntax

## Context en probleem

De code was JavaScript met JSDoc-types en `strict: false`. Met `--strict` kwamen 109 fouten boven, vooral `undefined` uit array-lookups (`itinerary[state.current]`) en `null` uit `querySelector`. TypeScript 7 (in Go) ondersteunt JSDoc bovendien minder goed dan TS 6.

## Overwogen opties

- JavaScript met JSDoc houden, strict aanzetten
- TypeScript met alle syntax (enums, namespaces)
- TypeScript met alleen syntax die je kunt weglaten (`erasableSyntaxOnly`)

## Keuze

**`.ts` met `erasableSyntaxOnly`**: TypeScript is dan "JavaScript met types". Vite en Node 24 strippen de types zonder te compileren; `tsc` controleert alleen. Strict, plus `noUncheckedIndexedAccess` en `exactOptionalPropertyTypes`.

Twee tsconfigs (opzet van het Vite-template): `tsconfig.app.json` voor `src/` (browser, geen Node-types) en `tsconfig.node.json` voor tests, `build/` en configs. `npm run typecheck` is `tsc -b`.

Patronen die hieruit volgen (vastgelegd in `AGENTS.md`):

- afgeleide velden op elke stop (`index`, `day`, `slug`, `place`, `lngLat`) in plaats van opzoek-maps;
- `stopAt()`, `currentStop()`, `slideAt()` en `requireElement()` falen hard bij een bug, in plaats van later `cannot read property of null`.

### Gevolgen

- Goed: tsc vond meteen een bug (een animatiestatus `"pending"` die niet bestaat).
- Goed: tests en configs draaien zonder build in Node 24.
- Minder goed: typescript-eslint ondersteunt TS 7 nog niet; daarom twee TypeScript-pakketten (ADR 0004).

## Meer informatie

- [TypeScript 7.0](https://typescriptdocs.com/release-notes/TypeScript%207.0), [voortgang TS 7 (Microsoft)](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)
- [Node.js: type stripping](https://nodejs.org/api/typescript.md)
- Commit `e6986a8`
