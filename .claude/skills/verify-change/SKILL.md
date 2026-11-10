---
name: verify-change
description: Check that a change to the laos-cambodja site works and changed nothing unintended. Use before every commit, after editing TypeScript, CSS, HTML, images or dependencies, or when the user asks to test, verify, check, "controleren" or compare before/after. Covers npm run check, screenshot comparison, CSP and accessibility checks and the performance budget.
---

# Een wijziging controleren

## Altijd

```sh
npm run check     # eslint + stylelint, tsc -b, node:test, Playwright (bouwt eerst)
```

Faalt een e2e-test: open `test-results/<test>/error-context.md` (paginasnapshot) en de trace. Bij twijfel over flakiness: `npx playwright test -g "<naam>" --repeat-each 3`.

## Bij CSS, HTML of layout

```sh
npm run compare                       # dag-8 en dag-14, desktop en mobiel, tegen origin/main
npm run compare -- HEAD~1 dag-3 dag-12
```

Het script bouwt beide versies, verbergt het kaartcanvas (tegels verschillen per keer) en meldt per screenshot hoeveel pixels verschillen en waar. Bij verschil: bekijk de `*-diff.png` (rood = anders) in de genoemde map. Een paar losse pixels is anti-aliasing; een blok is een echte wijziging. Bedoeld? Noem het in de commit. Niet bedoeld? Oplossen.

Bekijk het ook zelf: `npm run dev` (hot reload) en open een dag met en zonder kaart.

## Bij wijzigingen die de browser raken

- **CSP**: alleen de build heeft hem. De e2e-tests falen op CSP-meldingen; een nieuwe externe bron of worker moet in `build/csp.ts` (en een nieuwe script-URL in de Trusted Types-policy in `src/map/map.ts`).
- **Toegankelijkheid**: `npx playwright test a11y`. De toegankelijke naam begint met de zichtbare tekst; spaties tussen inline-onderdelen (zie gotchas).
- **Prestaties**: `npx playwright test performance --project=desktop --reporter=list`. Het budget staat in `e2e/performance.spec.ts`. Verhogen mag alleen bewust, in dezelfde commit, met de nieuwe meting in het commentaar.

## Bij een kale browserprobe

Voor iets dat de tests niet dekken: `npm run build && npm run preview` en een los Playwright-script met `page.on("console")`, `page.on("pageerror")` en `page.on("requestfailed")`. Gebruik `browser.newContext({ bypassCSP: true })` alleen als het script zelf stijl of script injecteert.

## Klaar als

- `npm run check` groen;
- `npm run compare` zonder onbedoelde verschillen (bij CSS/layout);
- in de commit staat hoe het gecontroleerd is.
