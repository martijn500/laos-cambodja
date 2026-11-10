---
status: accepted
date: 2026-11-10
---

# Unit-tests met node:test naast de bron, Playwright in e2e/

## Context en probleem

Er waren alleen Playwright-tests (traag, testen de hele app). Pure logica, zoals de popup-toestandsmachine, de dagnummering en de datacontrole, had geen snelle tests.

## Overwogen opties

- Vitest
- `node:test`, ingebouwd in Node 24
- Unit-tests in een aparte `tests/`-map of naast het bronbestand

## Keuze

**`node:test`**, zonder extra dependency: draait `.ts` direct dankzij type stripping, 21 tests in ~70 ms. **Naast het bronbestand** (`popup-machine.ts` → `popup-machine.test.ts`), op verzoek: een test verhuist mee en je ziet wat getest is. Unit-tests alleen voor pure logica; wat DOM of kaart aanstuurt, testen de Playwright-tests in **`e2e/`**: desktop en mobiel, plus toegankelijkheid (ADR 0006) en prestaties (ADR 0006).

Playwright test de productiebuild onder `/laos-cambodja/`, zoals GitHub Pages hem serveert. Elke e2e-test eindigt met "geen fouten", waarbij ook CSP-overtredingen uit de console tellen.

### Gevolgen

- Goed: snelle feedback op logica; geen Vitest-dependencies.
- Minder goed: geen watch-modus met UI zoals Vitest; `node --test --watch` werkt wel.
- Let op: `tsconfig.app.json` sluit `*.test.ts` uit; `tsconfig.node.json` zet `exclude: []` omdat `exclude` anders wordt overgeërfd.

## Meer informatie

- [Node.js: type stripping](https://nodejs.org/api/typescript.md)
- Commits `5ce297d`, `376cd2f`
