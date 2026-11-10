---
status: accepted
date: 2026-11-10
---

# De kaartpopup als pure toestandsmachine

## Context en probleem

Welke dagkaart op de kaart stond, volgde uit `requestedPopupIndex`, `requestedPopupDuration`, een `closing`-vlag en twee bodyklassen, verspreid over drie functies. Snel klikken tijdens een sluitanimatie was het risicovolste pad, en niet te unit-testen.

## Keuze

`src/map/popup-machine.ts`: toestanden `closed → open(i) → closing(i) → closed`, plus `wanted` (de stop die erna moet komen). `stepPopup()` is puur: het krijgt een gebeurtenis en geeft een nieuwe toestand en een effect terug (`open` of `close`). `popup.ts` voert de effecten uit (MapLibre-popup, animaties) en weet verder niets van de logica.

### Gevolgen

- Goed: 9 unit-tests dekken de randgevallen (wensen die zich opstapelen tijdens het sluiten, heen en weer); een e2e-test controleert snel klikken in de echte app.
- Goed: er staat nooit meer dan één kaart op de kaart.
- Nog niet gedaan: de camera-vlaggen (`pendingMapDay`, `suppressMapMarkerCommit`) zitten nog in `state.ts`; ze zijn de volgende kandidaat voor dezelfde aanpak.

## Meer informatie

- Commit `6c6d201`
