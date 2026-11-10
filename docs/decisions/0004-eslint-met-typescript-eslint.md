---
status: accepted
date: 2026-11-10
---

# ESLint met typescript-eslint, plus stylelint

## Context en probleem

Er was ESLint 9 (sinds augustus 2026 niet meer onderhouden) zonder type-informatie. Snellere alternatieven bestaan: Biome (lint en format in één) en Oxlint.

## Overwogen opties

- Biome: één tool, minder dependencies, eigen type-inferentie
- Oxlint: snelst, type-aware nog in alpha
- ESLint 10 met typescript-eslint `strictTypeChecked`

## Keuze

**ESLint 10 met typescript-eslint** (`strictTypeChecked` en `stylisticTypeChecked`), **Prettier** voor opmaak, **stylelint** (`stylelint-config-standard`) voor CSS. Het doel was minder bugs; de type-aware regels zijn daarvoor het sterkst (ze vonden direct promises zonder foutafhandeling). Snelheid speelt bij ~25 bestanden geen rol.

De configuratie is zelf TypeScript (`eslint.config.ts`), geladen met Node's type stripping via `--flag unstable_native_nodejs_ts_config` (geen `jiti` nodig).

Uitzonderingen staan per regel, met de reden ernaast (`eslint-disable-next-line` plus commentaar).

### Gevolgen

- Goed: bugs die tsc niet ziet (vergeten promises, altijd-ware condities) worden gevonden.
- Minder goed: typescript-eslint ondersteunt TypeScript 7 nog niet (peer `<6.1`). Oplossing: `typescript` wijst naar `@typescript/typescript6` (voor de linter), TypeScript 7 staat als `@typescript/native` (voor `tsc`). Weghalen zodra typescript-eslint TS 7 ondersteunt.
- Minder goed: ESLint 10 vraagt een `minimatch` met een bekende kwetsbaarheid; `overrides` forceert 11.x. Weghalen zodra ESLint zelf naar 11 gaat.

## Meer informatie

- [ESLint 10](https://infoq.com/news/2026/04/eslint-10-release), [einde ondersteuning ESLint 9](https://eslint.org/blog/2023/10/flat-config-rollout-plans/)
- [Biome, Oxlint en ESLint vergeleken](https://www.pkgpulse.com/guides/biome-vs-eslint-vs-oxlint-2026), [type-aware lint: Biome vs Oxlint](https://hn.jakechampion.name/reader/https://www.solberg.is/fast-type-aware-linting)
- [TS 7 naast typescript-eslint](https://loke.dev/writing/typescript-7-typescript-eslint-side-by-side)
- Commits `a51b1da`, `25f7d9d`, `457d091`
