# AGENTS.md

Afspraken voor iedereen die aan dit project werkt, mens of AI-agent ([agents.md](https://agents.md)). Dit bestand geldt altijd; taken met stappen staan in de skills in [`.claude/skills/`](.claude/skills/), het waarom in [`docs/decisions/`](docs/decisions/), valkuilen in [`docs/reference/gotchas.md`](docs/reference/gotchas.md). Lees de valkuilen voordat je iets "opruimt" wat vreemd lijkt.

## Project

Reisdagboek (Laos en Cambodja) als statische site: Vite 8, strict TypeScript, MapLibre 6, GitHub Pages onder `/laos-cambodja/`. Node 24 (`nvm use`).

```sh
npm run dev        # hot reload, http://localhost:5173/laos-cambodja/
npm run check      # lint + typecheck + unit + e2e: moet groen zijn vóór elke commit
npm run compare    # screenshots vergelijken met origin/main (CSS/layout)
npm run images     # originelen in img/*-src/ → WebP
```

## Git en commits

- **Nooit op `main` committen of pushen.** Begin elke taak met een nieuwe branch vanaf de actuele `origin/main` (`git fetch`, dan `git switch -c <type>/<onderwerp> origin/main`).
- **Nooit committen op een gemergede branch**: zo'n commit komt nooit op `main` (drie keer misgegaan). De hook `.claude/hooks/block-merged-branch.sh` houdt `git commit` en `git push` tegen op `main` en op een branch waarvan de PR gemerged of gesloten is. Werk je zonder Claude Code, controleer het dan zelf met `gh pr view --json state`.
- **Commit in logische stappen**, elk groen op `npm run check`, zodat elke commit los terug te draaien is. Liever tien kleine commits dan één grote.
- **Conventional Commits** in het Engels: `type: wat er verandert`, met in de body waarom en hoe het is gecontroleerd. Types: `feat fix perf refactor style test docs build ci chore security revert`.
- **Is een wijziging af en groen, commit dan zelf en open de PR**, zonder het eerst te vragen. Geef in de chat de link naar de PR en een keuze "mergen of eerst bekijken"; merge alleen als de gebruiker daarvoor kiest.
- Werk bij in dezelfde PR: `CHANGELOG.md` (sectie Onuitgebracht), een ADR bij een keuze met alternatieven, `gotchas.md` bij een nieuwe valkuil. Zie de skill `commit-workflow`.

## Code

- **TypeScript, strict, alleen erasable syntax**: geen `enum`, `namespace` of parameter properties. Imports met `.ts`-extensie, `import type` voor types.
- **Mappen**: app in `src/`, CSS in `src/styles/`, Vite-plugins in `build/`, Playwright in `e2e/`, hulpscripts in `scripts/`.
- **Unit-tests naast het bronbestand** (`foo.ts` → `foo.test.ts`, `node:test`) voor pure logica. Wat DOM of kaart aanstuurt, test je in `e2e/`. Geen lege of nep-tests om een bestand "gedekt" te maken.
- **Fail fast bij bugs**: `requireElement()`, `stopAt()`, `slideAt()`, `currentStop()` in plaats van `?.` of `!` bij dingen die er altijd moeten zijn.
- **Stops**: gebruik de afgeleide velden `index`, `day`, `slug`, `place`, `lngLat`. Coördinaten in de data zijn `[lat, lng]`, MapLibre wil `stop.lngLat`.
- **Nooit HTML uit strings** (`innerHTML`, `insertAdjacentHTML`): de CSP met Trusted Types blokkeert het. Bouw DOM met `createElement` en `textContent`.
- **Toestand met overgangen** (zoals de popup) als pure functie met tests: zie `src/map/popup-machine.ts`.
- **Lint-uitzonderingen** alleen per regel, met de reden in een commentaar ernaast.

## CSS

- Alle kleuren, fonts, radii en timings in `src/styles/tokens.css`; nergens anders hardcoden.
- Nieuwe CSS in de juiste `@layer` (via `main.css`); geen `!important` of extra specificiteit om te winnen.
- Respecteer `prefers-reduced-motion` bij elke animatie.
- Na een CSS- of layoutwijziging: `npm run compare`; verschillen moeten bedoeld zijn.

## Toegankelijkheid en prestaties

- De toegankelijke naam begint met de zichtbare tekst (WCAG 2.5.3); bewegende inhoud is te pauzeren (2.2.2); toetsenbord werkt overal. De axe-tests moeten groen blijven.
- Het prestatiebudget (`e2e/performance.spec.ts`) verhoog je alleen bewust, in dezelfde commit als de wijziging die het nodig heeft, met de meting erbij.

## Dependencies

- Zo min mogelijk. Een nieuwe dependency vraagt een reden (in de commit, bij een grote een ADR). Lighthouse CI is daarom bewust afgewezen.
- **Omzeil `.npmrc` niet**: `min-release-age=7` en `ignore-scripts` zijn bewust. Weigert npm een versie, neem de vorige.
- Niet "opruimen": de alias `typescript` → `@typescript/typescript6` en de `minimatch`-override hebben een reden (ADR 0004). Zie de skill `update-dependencies`.

## Taal

- Tekst in de app, docs en README: **Nederlands**. Code, commentaar en commitberichten: **Engels**.
- In docs: kort, actief, zonder jargon dat niet nodig is.

## Wat een agent niet zelf doet

- Pushen naar `main`, force-pushen, of geschiedenis herschrijven die al gepusht is.
- Bestanden buiten git verwijderen zonder te vragen (originelen in `img/*-src/` staan niet in git en zijn niet terug te halen); verplaats ze naar de prullenbak als het moet.
- Repo-instellingen wijzigen (Pages, branch protection) zonder dat erom gevraagd is.
