---
status: accepted
date: 2026-11-10
---

# Toegankelijkheid en prestatiebudget als Playwright-tests

## Context en probleem

Toegankelijkheid had veel aandacht gekregen (rollende tabindex, ARIA, pauzeknop), maar niets voorkwam dat het stilletjes achteruitging. Er was ook niets dat waarschuwde als de site zwaarder werd.

## Overwogen opties

- Lighthouse CI (`@lhci/cli`)
- `@axe-core/playwright` en een eigen budgettest in Playwright

## Keuze

**axe in Playwright** (`e2e/a11y.spec.ts`): WCAG 2.2 A/AA, met de kaart open en dicht; het canvas van MapLibre uitgesloten. Vond meteen een echte fout (WCAG 2.5.3, Label in Name, tijdlijnknoppen).

**Budget in Playwright** (`e2e/performance.spec.ts`): bytes per soort bestand bij een eerste bezoek (alleen eigen bestanden), het moment waarop de dagkaart verschijnt (`performance.mark("day-card-shown")`, grens 2,5 s zoals "goede" LCP) en CLS. LCP zelf bleek onbruikbaar: op desktop ziet de browser de kaart niet als grootste element, omdat die in een popup van MapLibre inschaalt. Lighthouse CI viel af: het voegde 216 pakketten toe, met daarin een ernstige kwetsbaarheid (`basic-ftp`). Het budget vond meteen dat alle 21 dagen werden voorgeladen (4,4 MB → 1,1 MB na de fix, ADR 0008).

### Gevolgen

- Goed: geen extra dependencies op `@axe-core/playwright` na; draait in dezelfde CI-stap.
- Minder goed: lab-metingen, geen echte gebruikersdata; INP wordt niet gemeten.
- De e2e-tests gebruiken een lokale, minimale kaartstijl (`e2e/fixtures.ts`), zodat de traagheid van OpenFreeMap de metingen niet beïnvloedt. Zonder die stijl faalde de test in CI op één run en slaagde hij op een andere.
- Regel: een budget verhogen mag, bewust, in dezelfde commit als de wijziging die het nodig heeft, met de nieuwe meting erbij.
- Automatische controles vinden ongeveer een derde van de WCAG-problemen; toetsenbordgedrag heeft eigen tests in `app.spec.ts`.

## Meer informatie

- [axe met Playwright](https://qaskills.sh/blog/axe-core-playwright-accessibility-testing-2026)
- [Prestatiebudgetten (Lighthouse CI)](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci/budgets)
- Commits `917d1d7`, `0280878`
