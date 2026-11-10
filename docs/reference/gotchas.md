# Valkuilen

Niet-voor-de-hand-liggende feiten die een nieuwe ontwikkelaar of AI-agent fout zou doen. Per valkuil: hoe je het merkt, en wat de oplossing is. Nieuwe toevoegen onder het juiste kopje; verouderde weghalen.

## Build en Vite

- **Vite-plugin die `index.html` wil aanpassen ziet hem niet.** `bundle["index.html"]` bestaat pas na Vite's eigen HTML-plugin. Oplossing: `enforce: "post"` op de plugin (`build/day-pages.ts`).
- **Regex op HTML faalt na Prettier.** Prettier zet lange `<meta>`-tags over meerdere regels. Match met `\s+` tussen attributen, en laat de build falen als een tag niet gevonden wordt (`setTagValue` in `build/day-pages.ts`).
- **Fonts als `data:`-URI in de CSS.** Vite zet kleine bestanden (de `.woff`-fallbacks van fontsource) inline, en de CSP blokkeert `data:`-fonts. Oplossing: `assetsInlineLimit` geeft `false` voor fonts (`vite.config.ts`).
- **`/dag-8` geeft 200 op GitHub Pages zonder rewrite.** Pages (en `vite preview`) serveren `dag-8.html` voor `/dag-8`. Daarom maakt de build `dag-N.html`, geen `dag-N/index.html` (dat zou een redirect naar `/dag-8/` geven).
- **De CSP staat niet in dev.** Alleen `npm run build` voegt hem toe; de dev-server heeft inline scripts nodig voor hot reload. CSP-problemen zie je dus alleen in `npm run preview` of de e2e-tests.
- **Een foto toevoegen tijdens `npm run dev`** herbouwt het manifest en herlaadt de pagina vanzelf; een nieuwe `src/data/itinerary.ts`-stop zonder foto's geeft een melding in de terminal (in de build stopt het).

## MapLibre {#maplibre}

- **MapLibre 6 is alleen ESM** (`import { Map } from "maplibre-gl"`, geen globale `maplibregl`) en **vereist WebGL 2**. `new Map()` gooit zonder WebGL 2; `initMap()` vangt dat af en de dagen werken dan zonder kaart.
- **"Worker failed to load".** MapLibre zoekt zijn worker naast zijn eigen bestand; na bundelen bestaat dat niet. Oplossing: `import url from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"`, `setWorkerUrl(url)`, en `worker: { format: "es" }` in Vite (de worker is een module-worker).
- **"This document requires 'TrustedScriptURL' assignment".** Door Trusted Types in de CSP mag de worker-URL geen gewone string zijn. De `default`-policy in `src/map/map.ts` laat precies die ene URL toe. Een nieuwe worker of script-URL moet daar expliciet bij.
- **`autoPan` bestaat niet** in MapLibre (wel in Leaflet). TypeScript meldt onbekende opties nu.
- **Coördinaten:** de data staat als `[lat, lng]`, MapLibre wil `[lng, lat]`. Gebruik altijd `stop.lngLat`.

## TypeScript en lint

- **typescript-eslint ondersteunt TypeScript 7 nog niet** (peer `<6.1`, en dat wordt in de code gecontroleerd, niet alleen als waarschuwing). Daarom: `"typescript": "npm:@typescript/typescript6"` voor de linter en `"@typescript/native": "npm:typescript@^7"` voor `tsc`. Niet "opruimen" voordat typescript-eslint TS 7 ondersteunt.
- **`eslint.config.ts` laden** vraagt `jiti`, tenzij je `--flag unstable_native_nodejs_ts_config` meegeeft (staat in `npm run lint`).
- **`exclude` erft mee met `extends`.** `tsconfig.node.json` breidt `tsconfig.app.json` uit, die `*.test.ts` uitsluit; daarom zet de node-config `"exclude": []`.
- **`node:test` en no-floating-promises.** `describe`/`it` geven promises terug; de lintconfig staat die toe via `allowForKnownSafeCalls`.
- **Imports met `.ts`-extensie** (`from "./state.ts"`): nodig voor Node's type stripping; `allowImportingTsExtensions` staat aan.
- **Na `await` denkt de linter dat een vlag niet veranderd kan zijn** (`no-unnecessary-condition` op `gallery.animating`). Die kan wel veranderen door een andere aanroep; de uitzondering staat met reden in `gallery.ts`.

## Toegankelijkheid

- **axe plakt tekst van naast elkaar staande `<span>`s aan elkaar** ("519 FEB…") en meldt dan dat de zichtbare tekst niet in de toegankelijke naam zit. Browsers doen hetzelfde bij naam-uit-inhoud. Oplossing: een spatie tussen de onderdelen in de DOM (`timeline.ts`).
- **De toegankelijke naam moet beginnen met de zichtbare tekst** (WCAG 2.5.3), details daarna.
- **Half ingefade tekst faalt op contrast.** Wacht in axe-tests tot de animatie klaar is.

## Testen

- **Playwright `baseURL` met pad:** `page.goto("/dag-8")` negeert `/laos-cambodja/`. Gebruik relatieve URL's: `page.goto("dag-8")`.
- **CSP-overtredingen zijn geen `pageerror`.** De browser logt ze alleen; `trackErrors()` in `e2e/app.spec.ts` vangt ze uit de console.
- **`@axe-core/playwright` wil een page uit `browser.newContext()`**, niet uit `browser.newPage()`.
- **`page.addStyleTag()` faalt op de build** door de CSP (`style-src 'self'`). Geef de testcontext `bypassCSP: true`; alleen in hulpscripts, niet in de e2e-tests, die moeten de echte CSP zien.
- **E2e-tests mogen niet van OpenFreeMap afhangen.** Met de echte kaartstijl hing de timing af van hun server: dezelfde test slaagde op `main` en faalde op een Dependabot-PR. `e2e/fixtures.ts` geeft een lokale stijl met één achtergrondlaag; importeer `test` en `expect` in e2e-tests daarom uit `./fixtures.ts`, niet uit `@playwright/test`.
- **LCP ziet de dagkaart niet** (desktop): die schaalt in vanuit `scale(0.02)` in een MapLibre-popup, en het enige LCP-element is dan het attributieregeltje. Een LCP-controle slaagt daardoor zonder iets te meten. Meet `performance.mark("day-card-shown")` (gezet in `finishBooting()`).
- **Kaarttegels verschillen per keer.** Verberg `.maplibregl-canvas` bij screenshotvergelijkingen (`scripts/compare-screenshots.ts`).

## npm en omgeving

- **`npm install` weigert een versie die net uit is.** Dat is `min-release-age=7` in `.npmrc`. Kies de vorige versie; niet de instelling omzeilen.
- **`npm` weigert onder Node 22** (`engine-strict`). `nvm use` zet Node 24.
- **Playwright-browsers** worden niet automatisch geïnstalleerd (`ignore-scripts`): `npx playwright install chromium`.
- **Swift werkt niet op deze Mac** (compiler 6.3 tegenover SDK 6.4); gebruik voor beeldbewerking `cwebp`/`sips` of Chromium via Playwright.
- **Pushen naar `main` kan niet**: de ruleset op GitHub staat alleen PR's toe, en de Claude-instellingen verbieden het ook. Werk via een branch en een PR.
- **"This branch is out-of-date" bij een PR**: de ruleset eist dat de branch `main` bevat. Klik "Update branch" of `gh pr update-branch <nr>` (een merge, geen force-push); CI draait dan opnieuw. Gebeurt na elke merge van een andere PR.
