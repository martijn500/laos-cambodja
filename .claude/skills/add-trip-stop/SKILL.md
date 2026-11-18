---
name: add-trip-stop
description: Add or change a travel day or side quest in this trip diary (Laos & Cambodja), including its photos, cartoon and thumbnail. Use when the user wants to add a day, a side quest, photos or a cartoon, change a stop's text, location or order, or "een dag/foto toevoegen".
---

# Een dag of side quest toevoegen of wijzigen

## Namen

Een dag heet `08`, een side quest op die dag `08-s1`, `08-s2`. Die naam (de `slug`) wordt **afgeleid** van de volgorde in `trip.config.ts`: een stop met `sideQuest: true` hoort bij de dag ervoor. Schuif je stops, dan schuiven de slugs mee en moeten mappen en cartoons ook hernoemd worden.

## 1. De stop in `trip.config.ts`

Voeg een object toe in `stops` op de juiste plek. Verplichte velden (TypeScript dwingt ze af): `date` ("MA · 22 FEB"; side quests dezelfde datum als hun dag), `flags`, `title`, `location` (`name` "Plaats · Land", `coordinates` **[lat, lng]**, `zoom`), `quote`, `detail`, `sleep` ("Slaap: …"), `icon` (emoji) met `iconLabel`, `theme` (sleutel uit `themes` in hetzelfde bestand; buurdagen een andere kleur). Optioneel: `sideQuest: true`, `caricatureAlign: "top"`, `caricature: false`.

Tekst is Nederlands, in de toon van de bestaande dagen.

## 2. Afbeeldingen

Originelen gaan in mappen die niet in git staan:

```
img/slides-src/<slug>/01.jpg, 02.jpg…    foto's, op naam gesorteerd
img/slides-src/CREDITS.md                 bron per foto bijwerken
img/cartoons-src/<slug>.png               cartoon met transparante achtergrond
```

Dan:

```sh
npm run images            # foto's, thumbnails en cartoons → WebP
npm run images cartoons   # alleen één stap: photos, thumbs of cartoons
```

Dit maakt `img/slides/<slug>/01.webp…`, `thumb.webp` en `img/cartoons/<slug>.webp`; die gaan wel in git.

Het deelplaatje van de dag (linkpreview op social media, `img/share/<NN>.jpg`) maakt de build zelf uit de eerste foto, cartoon, datum en titel; bekijken kan na `npm run build` in `dist/img/share/`.

## 3. Controleren

De build controleert de reisdata: ontbrekende foto's, thumbnail of cartoon, een gat in de nummering, een fotomap zonder stop, onmogelijke coördinaten. `npm run dev` meldt het in de terminal; `npm run build` stopt.

Dan `npm test` (de smoke-tests in `e2e/`, die dag 8 openen). Verschuif je stops, kijk dan of dag 8 nog bestaat. Nieuwe dag: `dag-N.html` komt vanzelf uit de build, met een eigen linkpreview.

## Valkuilen

- Originelen in `img/*-src/` staan niet in git: niet verwijderen zonder te vragen.
- `npm run images` zonder argument maakt `img/slides/` opnieuw uit de originelen; heb je originelen niet lokaal, draai dan alleen `thumbs` of `cartoons`.
- Datums van het hele overzicht ("15 FEB — 4 MRT 2027") staan in `period` in `trip.config.ts`.
