# Changelog

Alle noemenswaardige wijzigingen aan het reisdagboek. Opzet volgens [Keep a Changelog 1.1](https://keepachangelog.com/nl/1.1.0/). De site heeft geen versienummers: een release is een merge naar `main`, die direct live gaat. Elke regel verwijst naar zijn commit; het waarom van de grote keuzes staat in [docs/decisions/](docs/decisions/).

Bijwerken: zie de skill [`.claude/skills/commit-workflow`](.claude/skills/commit-workflow/SKILL.md). Commit-types horen bij secties: `feat` → Toegevoegd, `perf`/`refactor`/`build`/`style` → Gewijzigd, `fix` → Opgelost, `security` → Beveiliging; wat wegvalt → Verwijderd. Schrijf voor de lezer van de site of de code, niet als kopie van het commitbericht.

## [Onuitgebracht]

### Toegevoegd

- Kennisbank in `docs/`, afspraken in `AGENTS.md` en skills in `.claude/skills/` (zie [ADR 0012](docs/decisions/0012-agents-md-skills-en-kennisbank.md)).

## [2026-11-10] Modernisering

Pull request [#2](https://github.com/martijn500/laos-cambodja/pull/2). Achtergrond en afwegingen: [ADR 0002 t/m 0011](docs/decisions/).

### Toegevoegd

- Elke dag heeft een eigen pagina `dag-N.html` met titel, beschrijving, canonical URL en linkpreview (Open Graph) van die dag; `/dag-8` geeft nu status 200 in plaats van 404 (`82b24d8`).
- Ontwikkelserver met hot reload: `npm run dev` (`82b24d8`).
- CI met GitHub Actions: lint, typecontrole, build en tests bij elke push en pull request; `main` wordt alleen gedeployd als alles slaagt (`d2b52fd`).
- Controle van de reisdata bij build en dev-start: elke stop moet foto's, een thumbnail en een cartoon hebben, foto's doorlopend genummerd, elke fotomap bij een stop (`c497213`, `0280878`).
- Unit-tests met `node:test` voor de pure logica, naast hun bronbestand (`5ce297d`, `376cd2f`).
- Toegankelijkheidstests met axe tegen WCAG 2.2 A/AA (`917d1d7`).
- Prestatiebudget-test: bytes per soort bestand bij een eerste bezoek, LCP en CLS (`0280878`).
- E2e-test: snel doorklikken eindigt met precies één kaart, die van de huidige dag (`6c6d201`).
- Versiestempel `<meta name="version">` met commit en buildtijd in elke pagina (`982de83`).
- Controle op Conventional Commits bij pull requests (`982de83`).
- Dependabot voor npm en GitHub Actions, met een week wachttijd (`9caf202`).
- Thumbnails (360 px) voor de tijdlijn via `npm run images` (`0280878`).

### Gewijzigd

- Gebouwd met Vite 8 in plaats van losse bestanden zonder build (`82b24d8`).
- Alle code is strict TypeScript; elke stop heeft afgeleide velden `index`, `day`, `slug`, `place`, `lngLat` (`e6986a8`).
- Code staat in `src/`, CSS in `src/styles/`, Vite-plugins in `build/`, Playwright-tests in `e2e/` (`86dbb1f`, `c497213`, `376cd2f`).
- De popup op de kaart wordt bestuurd door een pure toestandsmachine (`6c6d201`).
- CSS in cascade layers, alle design tokens in `tokens.css` (`457d091`).
- Lint met typescript-eslint (strict, type-aware) en stylelint (`a51b1da`, `457d091`).
- MapLibre 6 en de fonts uit npm in plaats van van unpkg en Google Fonts (`82b24d8`).
- Cartoons als WebP: 7,7 MB → 1,1 MB (`7460cfc`).
- Eerste bezoek 4,4 MB → 1,1 MB: alleen de huidige dag en de dagen ervoor en erna worden voorgeladen, niet alle 21 (`0280878`).
- De fotogalerij kent het aantal foto's uit de build en zoekt niet meer naar 02, 03… tot een 404 (`c497213`).
- Node 24 vastgezet; npm installeert alleen versies die een week oud zijn en draait geen install-scripts (`9caf202`).
- ESLint 10 en Playwright 1.64 (`5c2eec4`).
- `npm run photos` heet nu `npm run images` en zet ook cartoons en thumbnails om; `img/bg/` heet `img/slides-src/` (`7460cfc`, `780b930`).

### Verwijderd

- De 18 externe fallbackfoto's (Unsplash, Wikimedia en anderen); elke stop heeft eigen foto's (`d6cf1cf`).
- De `404.html` + `document.write`-route voor dagen; `404.html` is nu een gewone "niet gevonden"-pagina (`82b24d8`).
- `serve` als ontwikkelserver (`82b24d8`).
- De handmatige lijst met `modulepreload`-regels en de test daarvoor (`82b24d8`).

### Opgelost

- Tijdlijnknoppen hadden een toegankelijke naam die niet overeenkwam met hun zichtbare tekst (WCAG 2.5.3) (`917d1d7`).
- De balken tussen marker en kaart controleerden een animatiestatus die niet bestaat (`e6986a8`).
- Een optie uit Leaflet (`autoPan`) die MapLibre nooit heeft gehad (`82b24d8`).
- Drie dubbel gedefinieerde CSS-selectors en een dubbele `mask` (`457d091`).

### Beveiliging

- Content-Security-Policy met Trusted Types in de build (`9216828`).
- GitHub Actions vastgezet op commit-SHA (`d2b52fd`).
- `minimatch` geforceerd naar 11 vanwege GHSA-g3hv-75wg-m249 (`25f7d9d`).
- Geen IP-adressen van bezoekers meer naar Google Fonts, unpkg of fotosites (`d6cf1cf`, `82b24d8`).

## Vóór de modernisering

Ontstaan van het reisdagboek: kaart, dagkaarten, tijdlijn, fotogalerij, cartoons en 8-bit-geluid. Zie `git log 64c1943` en eerder; deze commits volgden nog geen vaste opmaak. Laatste stappen vóór de modernisering: ES-modules (`955370c`), aparte CSS-bestanden (`ac9cb50`), Playwright, ESLint en Prettier (`7e35137`), de cartoon als site-icoon (`76597c7`).

[Onuitgebracht]: https://github.com/martijn500/laos-cambodja/compare/72b837e...HEAD
[2026-11-10]: https://github.com/martijn500/laos-cambodja/pull/2
