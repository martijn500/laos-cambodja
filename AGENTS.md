# AGENTS.md

Afspraken voor iedereen die aan deze reis werkt, mens of AI-agent ([agents.md](https://agents.md)).

## Wat dit is

Het reisdagboek van de reis Laos & Cambodja, op GitHub Pages. Deze repo bevat alleen de reis: `trip.config.ts` (dagen, teksten, kleuren, vertrekdatum, URL) en de afbeeldingen in `img/`. De app en de build komen uit privé-packages (`@martijn500/vite-plugin`, `@martijn500/uploads`); hun broncode staat hier niet en hoort hier ook niet.

```sh
nvm use            # Node 24
npm ci             # vraagt npm login bij GitHub Packages, zie README.md
npm run dev        # http://localhost:5173/<repo>/
npm test           # bouwt en draait de smoke-tests
```

## Afspraken

- **Nooit op `main` committen of pushen.** Elke wijziging op een branch, met een pull request.
- **Conventional Commits** in het Engels (`feat: add day 19`), tekst in de app en docs in het Nederlands.
- **Dagen en foto's** toevoegen of wijzigen: de skill `add-trip-stop`.
- **`.npmrc` niet omzeilen**: `min-release-age` en `ignore-scripts` zijn bewust.
- **Geen app-code hier.** Een bug of wens in de app hoort in de (privé) app-repo, niet als lapmiddel in deze repo.
- `index.html` bevat alleen `<!-- trip-diary -->`: de plugin zet de pagina van de app ervoor in de plaats.
- Originelen in `img/*-src/` staan niet in git en zijn niet terug te halen: niet verwijderen zonder te vragen.
