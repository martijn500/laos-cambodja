---
status: accepted
date: 2026-11-10
---

# CI, deployen via Actions en traceerbaarheid

## Context en probleem

Controles draaiden alleen lokaal, als iemand eraan dacht. GitHub Pages publiceerde wat er op `main` stond. Er gebeurde een vergissing (een commit op een al gemergede branch) die niemand tegenhield. Je kon niet zien welke versie live stond.

## Keuze

- **Eén workflow** (`.github/workflows/ci.yml`): `npm ci`, lint, typecheck, unit- en e2e-tests op de build; bij een push naar `main` die slaagt: deployen met `upload-pages-artifact` + `deploy-pages`. Pages-instelling: Source = GitHub Actions.
- **Conventional Commits** (`type: wat`), gecontroleerd per pull request door `scripts/check-commit-messages.sh`. Types horen bij secties in `CHANGELOG.md` (Keep a Changelog).
- **Versiestempel**: `<meta name="version" content="<commit> <buildtijd>">`.
- **Ruleset op `main`** ("main: PR met groene CI", ingesteld via `gh api`): alleen via een pull request, `check` en `commits` moeten groen zijn op een branch die bijgewerkt is met `main`, geen force-push, niet verwijderen. Geen verplichte review: er is één ontwikkelaar, en die kan zijn eigen PR niet goedkeuren.

### Gevolgen

- Goed: kapotte code komt niet live; elke wijziging is te herleiden van site naar commit naar changelog naar ADR.
- Minder goed: oudere commits volgen de opmaak niet; de controle kijkt alleen naar nieuwe PR-commits.

## Meer informatie

- [GitHub Pages met een eigen workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Conventional Commits](https://www.conventionalcommits.org), [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/), [changelogs schrijven of genereren](https://rufuspollock.com/2026-02-25-changelogs-lightweight-best-practice)
- Commits `d2b52fd`, `982de83`
