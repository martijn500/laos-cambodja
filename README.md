# laos-cambodja

Reisdagboek van de reis door Laos en Cambodja: een kaart met per dag een kaartje dat uit zijn marker springt, met foto's, cartoons en een tijdlijn.

Gebouwd met [Vite](https://vite.dev): `npm run build` maakt `dist/` met per dag een eigen pagina (`dag-8.html`, bereikbaar als `/dag-8`) met titel en linkpreview van die dag. De site draait op GitHub Pages onder `/laos-cambodja/`.

## Aan de slag

```sh
nvm use                           # Node 24, zie .nvmrc
npm ci
npx playwright install chromium   # eenmalig, voor de tests
npm run dev                       # opent http://localhost:5173/laos-cambodja/
```

`npm run dev` herlaadt automatisch: CSS-wijzigingen verschijnen zonder herladen, wijzigingen in JS of HTML herladen de pagina.

| Script              | Wat het doet                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Ontwikkelserver met hot reload                      |
| `npm run build`     | Productiebuild in `dist/`                           |
| `npm run preview`   | Serveert `dist/` zoals GitHub Pages (poort 4173)    |
| `npm run images`    | Zet originele foto's en cartoons om naar WebP       |
| `npm test`          | Bouwt en test met Playwright op desktop en mobiel   |
| `npm run lint`      | ESLint (typescript-eslint, type-aware) en stylelint |
| `npm run typecheck` | TypeScript (strict), browser- en Node-code apart    |
| `npm run format`    | Prettier                                            |
| `npm run check`     | Lint, typecontrole en tests in één keer             |

Nieuwe packages worden pas geïnstalleerd als ze een week oud zijn (`.npmrc`), als bescherming tegen gekaapte releases.

## Deployen

Elke push naar `main` draait `.github/workflows/ci.yml`: lint, typecontrole, build en tests. Slaagt alles, dan gaat `dist/` naar GitHub Pages. Pull requests krijgen dezelfde controles, zonder deploy.

Eenmalig in de repo-instellingen: **Settings → Pages → Source: GitHub Actions**.

## Indeling

```
index.html      de pagina; bij de build ook dag-N.html per dag
build/          Vite-plugins: dagpagina's, foto-manifest + controle, img/ kopiëren
src/
  main.ts       opstartvolgorde
  styles/       main.css zet alles in cascade layers; tokens.css heeft alle kleuren, fonts en timings
  state.ts      gedeelde staat, currentStop(), setDay() / "daychange"
  data/         reisdagen, kleuren per bestemming
  router.ts     /dag-N in de URL
  deck.ts       huidige dag tonen, vorige / volgende
  timeline.ts   tijdlijnkaarten
  map/          kaart, markers, popup, balken tussen marker en kaart
  slides/       kaarten opbouwen uit <template>, fotogalerij
  boot.ts       loader en voorladen van de eerste foto's
  input.ts      toetsenbord en swipe
  audio.ts      8-bit geluidjes
public/         favicons en 404.html, ongewijzigd naar dist/
img/
  slides/<dag>/ foto's per dag (01.webp, 02.webp…), gemaakt door npm run images
  cartoons/     cartoon per dag (08.webp, side quest 08-s1.webp), gemaakt door npm run images
  cartoons-src/ originele cartoons als PNG, niet in git
  slides-src/   originele foto's met bronnen (CREDITS.md), niet in git
```

Een dag heet `08`, een side quest op die dag `08-s1`. Die naam wordt gebruikt voor de fotomap en de cartoon.

De build (en `npm run dev`) controleert de reisdata: elke stop moet foto's en een cartoon hebben, de foto's moeten doorlopend genummerd zijn en elke fotomap moet bij een stop horen. Klopt iets niet, dan stopt de build met een lijst van wat er mist.
