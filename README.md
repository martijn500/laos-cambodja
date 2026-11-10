# laos-cambodja

Reisdagboek van de reis door Laos en Cambodja: een kaart met per dag een kaartje dat uit zijn marker springt, met foto's, cartoons en een tijdlijn.

Statische site zonder build-stap: `index.html` laadt de CSS uit `css/` en het script `js/main.js` als ES-module.

## Aan de slag

```sh
npm install
npx playwright install chromium   # eenmalig, voor de tests
npm run dev                       # http://localhost:3000
```

| Script              | Wat het doet                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Lokale server (ook `/dag-8` werkt, via `404.html`)      |
| `npm run images`    | Zet originele foto's en cartoons om naar WebP           |
| `npm test`          | Playwright-tests op desktop en mobiel                   |
| `npm run lint`      | ESLint                                                  |
| `npm run typecheck` | Typecontrole van de JSDoc-types (geen TypeScript nodig) |
| `npm run format`    | Prettier                                                |
| `npm run check`     | Lint, typecontrole en tests in één keer                 |

## Indeling

```
css/            base, map, boot, slide, controls (geladen in deze volgorde)
js/
  main.js       opstartvolgorde
  state.js      gedeelde staat + setDay() / "daychange"
  data/         reisdagen, terugvalfoto's, kleuren per bestemming
  router.js     /dag-N in de URL
  deck.js       huidige dag tonen, vorige / volgende
  timeline.js   tijdlijnkaarten
  map/          kaart, markers, popup, balken tussen marker en kaart
  slides/       kaarten opbouwen uit <template>, fotogalerij
  boot.js       loader en voorladen van de eerste foto's
  input.js      toetsenbord en swipe
  audio.js      8-bit geluidjes
img/
  slides/<dag>/ foto's per dag (01.webp, 02.webp…), gemaakt door npm run images
  cartoons/     cartoon per dag (08.webp, side quest 08-s1.webp), gemaakt door npm run images
  cartoons-src/ originele cartoons als PNG, niet in git
  bg/           originele foto's, niet in git
```

Een dag heet `08`, een side quest op die dag `08-s1`. Die naam wordt gebruikt voor de fotomap en de cartoon.
