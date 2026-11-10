import { Marker } from "maplibre-gl";
import { currentStop, slideAt, state } from "../state.ts";
import { itinerary, stopAt } from "../data/itinerary.ts";
import { goToSlide } from "../deck.ts";
import { reducedMotionQuery, requireElement } from "../utils/dom.ts";

/** One numbered marker per travel day; side quests share their day's */
export interface DayMarker {
  button: HTMLButtonElement;
  /** where the marker sits, [lng, lat] */
  lngLat: [number, number];
  day: number;
}

export const mapDayMarkers: DayMarker[] = [];

export function markerForDay(day: number): DayMarker | undefined {
  return mapDayMarkers.find((marker) => marker.day === day);
}

export function markerButtonForSlide(
  index: number,
): HTMLButtonElement | undefined {
  return markerForDay(stopAt(index).day)?.button;
}

// Little "gulp" on the marker when a card leaves or enters it
export function pulseMarker(index: number): void {
  const marker = markerButtonForSlide(index);
  if (!marker || reducedMotionQuery.matches) return;
  marker.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.35)", offset: 0.35 },
      { transform: "scale(0.92)", offset: 0.7 },
      { transform: "scale(1)" },
    ],
    { duration: 420, easing: "ease-out" },
  );
}

export function addMinimapMarkers(): void {
  const map = state.tripMap;
  if (!map || !state.mapStyleReady || mapDayMarkers.length) return;

  const days = itinerary.filter((stop) => !stop.sideQuest);
  // Days at the same place (two nights in one town) sit side by side
  const placeKey = (lngLat: readonly number[]) => lngLat.join(",");
  const daysPerPlace = new Map<string, number>();
  days.forEach((stop) => {
    const key = placeKey(stop.lngLat);
    daysPerPlace.set(key, (daysPerPlace.get(key) ?? 0) + 1);
  });
  const placedPerPlace = new Map<string, number>();

  days.forEach((stop) => {
    const key = placeKey(stop.lngLat);
    const position = placedPerPlace.get(key) ?? 0;
    const count = daysPerPlace.get(key) ?? 1;
    placedPerPlace.set(key, position + 1);

    const markerButton = document.createElement("button");
    const markerElement = document.createElement("div");
    markerElement.className = "map-day-marker-wrap";
    markerButton.type = "button";
    markerButton.className = "map-day-marker";
    markerButton.style.setProperty(
      "--marker-color",
      getComputedStyle(requireElement(".card", slideAt(stop.index)))
        .borderTopColor,
    );
    markerButton.textContent = String(stop.day);
    markerButton.setAttribute(
      "aria-label",
      `Reisdag ${stop.day}: ${stop.title} in ${stop.location.name}`,
    );
    markerButton.title = `Dag ${stop.day} · ${stop.title}`;
    markerButton.tabIndex = -1;
    markerButton.addEventListener("click", () => goToSlide(stop.index));
    markerElement.append(markerButton);

    const horizontalOffset = (position - (count - 1) / 2) * 28;
    new Marker({
      anchor: "center",
      element: markerElement,
      offset: [horizontalOffset, 0],
    })
      .setLngLat(stop.lngLat)
      .addTo(map);
    mapDayMarkers.push({
      button: markerButton,
      lngLat: stop.lngLat,
      day: stop.day,
    });
  });
  updateMapDayMarkers(currentStop().day);
}

export function setMarkerTabStop(activeDay: number): void {
  mapDayMarkers.forEach(({ button, day }) => {
    button.tabIndex = day === activeDay ? 0 : -1;
  });
}

export function updateMapDayMarkers(activeDay: number): void {
  mapDayMarkers.forEach(({ button, day }) => {
    if (day === activeDay) {
      button.setAttribute("aria-current", "date");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  setMarkerTabStop(activeDay);
}
