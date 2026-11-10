import { Marker } from "maplibre-gl";
import { state } from "../state.js";
import { itinerary, tripDayNumbers } from "../data/itinerary.js";
import { goToSlide } from "../deck.js";

export const mapDayMarkers = [];

export function markerButtonForSlide(slideIndex) {
  const day = tripDayNumbers.get(itinerary[slideIndex].date);
  return mapDayMarkers.find((mapMarker) => mapMarker.day === day)?.button;
}

// Little "gulp" on the marker when a card leaves or enters it
export function pulseMarker(slideIndex) {
  const marker = markerButtonForSlide(slideIndex);
  if (
    !marker ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
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

export function addMinimapMarkers() {
  if (!state.tripMap || !state.mapStyleReady || mapDayMarkers.length) return;

  const firstStopByDate = new Map();
  itinerary.forEach((stop, index) => {
    if (!firstStopByDate.has(stop.date)) {
      firstStopByDate.set(stop.date, { stop, index });
    }
  });
  const tripStops = [...firstStopByDate.values()];
  const coordinateCounts = new Map();
  tripStops.forEach(({ stop }) => {
    const coordinateKey = stop.location.coordinates.join(",");
    coordinateCounts.set(
      coordinateKey,
      (coordinateCounts.get(coordinateKey) ?? 0) + 1,
    );
  });
  const coordinateIndexes = new Map();

  tripStops.forEach(({ stop, index }) => {
    const day = tripDayNumbers.get(stop.date);
    const coordinateKey = stop.location.coordinates.join(",");
    const coordinateIndex = coordinateIndexes.get(coordinateKey) ?? 0;
    const coordinateCount = coordinateCounts.get(coordinateKey);
    coordinateIndexes.set(coordinateKey, coordinateIndex + 1);

    const markerButton = document.createElement("button");
    const markerElement = document.createElement("div");
    markerElement.className = "map-day-marker-wrap";
    markerButton.type = "button";
    markerButton.className = "map-day-marker";
    markerButton.style.setProperty(
      "--marker-color",
      getComputedStyle(state.slides[stop.slideIndex].querySelector(".card"))
        .borderTopColor,
    );
    markerButton.textContent = String(day);
    markerButton.setAttribute(
      "aria-label",
      `Reisdag ${day}: ${stop.title} in ${stop.location.name}`,
    );
    markerButton.title = `Dag ${day} · ${stop.title}`;
    markerButton.tabIndex = -1;
    markerButton.addEventListener("click", () => {
      goToSlide(index);
    });
    markerElement.append(markerButton);

    const horizontalOffset = (coordinateIndex - (coordinateCount - 1) / 2) * 28;
    new Marker({
      anchor: "center",
      element: markerElement,
      offset: [horizontalOffset, 0],
    })
      .setLngLat([stop.location.coordinates[1], stop.location.coordinates[0]])
      .addTo(state.tripMap);
    mapDayMarkers.push({
      button: markerButton,
      coordinates: [stop.location.coordinates[1], stop.location.coordinates[0]],
      day,
    });
  });
  updateMapDayMarkers(tripDayNumbers.get(itinerary[state.current].date));
}

export function setMarkerTabStop(activeDay) {
  mapDayMarkers.forEach(({ button, day }) => {
    button.tabIndex = day === activeDay ? 0 : -1;
  });
}

export function updateMapDayMarkers(activeDay) {
  mapDayMarkers.forEach(({ button, day }) => {
    if (day === activeDay) {
      button.setAttribute("aria-current", "date");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  setMarkerTabStop(activeDay);
}
