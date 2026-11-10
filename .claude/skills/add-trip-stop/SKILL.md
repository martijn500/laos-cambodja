---
name: add-trip-stop
description: Add or change a travel day or side quest in the laos-cambodja trip diary, including its photos, cartoon and thumbnail. Use when the user wants to add a day, a side quest, photos or a cartoon, change a stop's text, location or order, or "een dag/foto toevoegen".
---

# Een dag of side quest toevoegen of wijzigen

## Namen

Een dag heet `08`, een side quest op die dag `08-s1`, `08-s2`. Die naam (de `slug`) wordt **afgeleid** van de volgorde in `src/data/itinerary.ts`: een stop met `sideQuest: true` hoort bij de dag ervoor. Schuif je stops, dan schuiven de slugs mee en moeten mappen en cartoons ook hernoemd worden.

## 1. De stop in `src/data/itinerary.ts`

Voeg een object toe in `stops` op de juiste plek. Verplichte velden (TypeScript dwingt ze af): `date` ("MA · 22 FEB"; side quests dezelfde datum als hun dag), `flags`, `title`, `location` (`name` "Plaats · Land", `coordinates` **[lat, lng]**, `zoom`), `quote`, `detail`, `sleep` ("Slaap: …"), `icon` (emoji) met `iconLabel`, `theme` (sleutel uit `src/data/themes.ts`; buurdagen een andere kleur). Optioneel: `sideQuest: true`, `caricatureAlign: "top"`, `caricature: false`.

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

## 3. Controleren

De build controleert de reisdata (`src/data/validate.ts`): ontbrekende foto's, thumbnail of cartoon, een gat in de nummering, een fotomap zonder stop, onmogelijke coördinaten. `npm run dev` meldt het in de terminal; `npm run build` stopt.

Dan de skill `verify-change`. Pas e2e-tests aan die op een vaste dag rekenen (titels en URL's in `e2e/app.spec.ts`) als je stops verschuift. Nieuwe dag: `dag-N.html` met linkpreview komt vanzelf uit de build.

## Valkuilen

- Originelen in `img/*-src/` staan niet in git: niet verwijderen zonder te vragen.
- `npm run images` zonder argument maakt `img/slides/` opnieuw uit de originelen; heb je originelen niet lokaal, draai dan alleen `thumbs` of `cartoons`.
- Datums van het hele overzicht ("15 FEB — 4 MRT 2027") staan in `index.html`.
