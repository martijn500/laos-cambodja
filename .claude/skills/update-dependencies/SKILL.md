---
name: update-dependencies
description: Upgrade, add or remove npm packages or GitHub Actions in the laos-cambodja repo safely. Use when updating dependencies, handling a Dependabot PR or npm audit warning, adding a library, or when npm refuses to install a version. Explains min-release-age, ignore-scripts, the TypeScript 6/7 alias and the minimatch override.
---

# Dependencies bijwerken

## Regels

- **Weinig dependencies.** Kan het met het platform (`node:test`, de Performance API, CSS) of een paar regels eigen code, dan geen pakket. Lighthouse CI is afgewezen omdat het 216 pakketten met kwetsbaarheden meebracht (ADR 0006).
- **`.npmrc` blijft zoals hij is.** `min-release-age=7`: npm installeert geen versie die jonger is dan een week; krijg je `ETARGET`/`notarget`, neem de vorige versie. `ignore-scripts=true`: install-scripts draaien niet; Playwright-browsers installeer je apart (`npx playwright install chromium`).
- **Node 24** (`nvm use`); `engine-strict` weigert andere versies.

## Werkwijze

1. Branch volgens `commit-workflow`.
2. `npm outdated` en `npm audit`.
3. Eén pakket of groep per commit: `npm install -D <pakket>@^<major>` (of zonder `-D` voor wat in de browser draait: alleen `maplibre-gl` en de fonts).
4. Major-upgrade: lees de release notes, zoek in de code naar wat verandert.
5. `npm run check`; bij UI-pakketten ook `npm run compare`.
6. Kijk of `package-lock.json` geen onverwachte nieuwe pakketten bevat (`git diff --stat package-lock.json`, `ls node_modules | wc -l` voor en na).
7. Commit: `chore: upgrade X to N` met wat er veranderde en hoe getest; een kwetsbaarheid als `security:` met het GHSA-nummer.

## Bewuste uitzonderingen in package.json

| Wat                                                                                             | Waarom                                                                                          | Wanneer weg                                                                                        |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `"typescript": "npm:@typescript/typescript6@…"` en `"@typescript/native": "npm:typescript@^7…"` | typescript-eslint ondersteunt TS 7 nog niet (peer `<6.1`); de linter krijgt TS 6, `tsc` is TS 7 | Als `npm view typescript-eslint peerDependencies` TS 7 toestaat: alias weg, `typescript@^7` gewoon |
| `"overrides": { "minimatch": "^11.0.1" }`                                                       | ESLint 10 vraagt minimatch 10 met GHSA-g3hv-75wg-m249                                           | Als ESLint zelf minimatch ≥ 11 vraagt                                                              |

Na het weghalen: `npm run lint` en controleer dat ignores nog werken (een expres fout bestand in `dist/` mag niet gemeld worden).

## GitHub Actions

Actions staan vast op een commit-SHA met de versie als commentaar (`uses: actions/checkout@<sha> # v7.0.1`). Dependabot werkt ze bij. Zelf bijwerken: de SHA van de release-tag opzoeken (`gh api repos/<owner>/<repo>/commits/<tag> --jq .sha`), nooit een tag zonder SHA.

## MapLibre

Bij een nieuwe major: kijk naar de worker (`?worker&url`, `setWorkerUrl`), de Trusted Types-policy in `src/map/map.ts` en de CSP in `build/csp.ts`. Zie de gotchas onder MapLibre.
