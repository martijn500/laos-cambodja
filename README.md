# Reisdagboek Laos & Cambodja

Een kaart met per dag foto's, cartoons en een tijdlijn: <https://martijn500.github.io/laos-cambodja/>

Deze repo bevat alleen de reis. De app en de build komen uit privé-packages op GitHub Packages.

## Starten

1. Maak een token (classic) met alleen `read:packages`: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).
2. Log er eenmalig mee in:
   ```sh
   npm login --scope=@martijn500 --auth-type=legacy --registry=https://npm.pkg.github.com
   ```
3. Dan:
   ```sh
   nvm use
   npm ci
   npm run dev
   ```

| Opdracht | Wat |
| --- | --- |
| `npm run dev` | Ontwikkelserver met hot reload |
| `npm run build` | De site in `dist/`, met een pagina en linkpreview per dag |
| `npm run preview` | Serveert `dist/` zoals GitHub Pages |
| `npm run images` | Zet originele foto's en cartoons (`img/*-src/`) om naar WebP |
| `npm run uploads` | Haalt de foto's uit de Drive-map en verwerkt ze |
| `npm test` | Bouwt en draait de smoke-tests (Playwright) |

## Indeling

```
trip.config.ts    alles van deze reis: dagen, teksten, kleuren, vertrekdatum, URL
vite.config.ts    defineConfig(tripDiary(trip))
index.html        alleen <!-- trip-diary -->: de plugin zet de pagina van de app ervoor in de plaats
img/              foto's per dag, cartoons, startscherm
public/           favicons
e2e/              smoke-tests: start, een dag, toegankelijkheid
```

## GitHub

- Secret `PACKAGES_TOKEN` (repo én Dependabot): het token uit stap 1.
- Environment `github-pages`: secrets `GDRIVE_FOLDER_ID` en `GDRIVE_SERVICE_ACCOUNT` voor de foto-upload uit Drive.
- Pages: bron GitHub Actions. Een push naar `main` die door CI komt, gaat live; "Foto's ophalen" zet elke 15 minuten nieuwe foto's online.
