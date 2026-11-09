import { state } from "../state.js";
import { finishBooting, initialImagesReady } from "../boot.js";
import { itinerary, tripDayNumbers } from "../data/itinerary.js";
import { updateMapPopupBeam } from "./beam.js";
import {
  addMinimapMarkers,
  mapDayMarkers,
  updateMapDayMarkers,
} from "./markers.js";
import { openRequestedMapPopup, setActiveMapPopup } from "./popup.js";
import { dayFromPath } from "../router.js";

export const mapStatusEl = document.getElementById("map-status");

export const mapContainerEl = document.getElementById("trip-map");

export function showMapLocation(stop, { instant = false } = {}) {
  if (!state.tripMap) return;

  const { coordinates, zoom } = stop.location;
  const day = tripDayNumbers.get(stop.date);
  const dayMarker = mapDayMarkers.find((marker) => marker.day === day);
  const center = dayMarker?.coordinates ?? [coordinates[1], coordinates[0]];
  const mapBounds = mapContainerEl.getBoundingClientRect();
  const timelineTop = document
    .querySelector(".nav-controls")
    .getBoundingClientRect().top;
  const slideCard = /** @type {HTMLElement | undefined} */ (
    state.slides[stop.slideIndex]?.querySelector(".card")
  );
  const mobilePopupMaxHeight =
    mapBounds.height - (mapBounds.bottom - timelineTop) - 120;
  const popupHeight = Math.min(
    slideCard?.offsetHeight ?? 0,
    window.matchMedia("(max-width: 600px)").matches
      ? mobilePopupMaxHeight
      : timelineTop - mapBounds.top - 48,
  );
  const visibleCenterY = mapBounds.top + (timelineTop - mapBounds.top) / 2;
  const popupBottom = visibleCenterY + popupHeight / 2;
  state.requestedPopupOffset = Math.max(14, (timelineTop - popupBottom) / 2);
  state.activeMapPopup?.popup.setOffset(state.requestedPopupOffset);
  const targetY = visibleCenterY + popupHeight / 2 + state.requestedPopupOffset;
  const offsetY = targetY - (mapBounds.top + mapBounds.height / 2);
  const camera = {
    center,
    zoom,
    offset: [0, offsetY],
    bearing: 0,
    pitch: 0,
  };

  if (state.mapStyleReady) {
    if (state.tripMap.isMoving()) {
      state.suppressMapMarkerCommit = true;
      try {
        state.tripMap.stop();
      } finally {
        state.suppressMapMarkerCommit = false;
      }
    }
    const targetPoint = state.tripMap.project(center);
    const focusPoint = [mapBounds.width / 2, mapBounds.height / 2 + offsetY];
    const isAlreadyAtLocation =
      Math.abs(state.tripMap.getZoom() - zoom) < 0.01 &&
      Math.hypot(targetPoint.x - focusPoint[0], targetPoint.y - focusPoint[1]) <
        2;
    if (isAlreadyAtLocation) {
      updateMapDayMarkers(day);
      state.pendingMapDay = null;
      return;
    }
  }

  // Before the style has loaded (first paint of a /dag-N page) jump
  // straight to the final framing, so the map never visibly scrolls
  if (
    instant ||
    !state.mapStyleReady ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    state.pendingMapDay = null;
    // jumpTo ignores `offset`; a zero-length easeTo honours it
    state.tripMap.easeTo({ ...camera, duration: 0 });
    updateMapDayMarkers(day);
  } else {
    state.pendingMapDay = day;
    state.tripMap.easeTo({ ...camera, duration: 900, essential: false });
  }
}

export function initMap() {
  if (window.maplibregl) {
    const initialStop =
      itinerary.find(
        (stop) => tripDayNumbers.get(stop.date) === dayFromPath(),
      ) ?? itinerary[0];
    const initialLocation = initialStop.location;
    state.tripMap = new maplibregl.Map({
      attributionControl: false,
      boxZoom: false,
      center: [initialLocation.coordinates[1], initialLocation.coordinates[0]],
      container: mapContainerEl,
      doubleClickZoom: false,
      interactive: true,
      // Screen-reader name of the canvas (MapLibre default is "Map")
      locale: {
        "Map.Title": "Kaart: pijltjes verschuiven, plus en min zoomen",
      },
      style: "https://tiles.openfreemap.org/styles/positron",
      zoom: initialLocation.zoom,
    });

    // Fall back to the plain slide if the map takes far too long
    setTimeout(() => {
      if (!state.mapStyleReady) finishBooting();
    }, 8000);

    state.tripMap.once("load", () => {
      state.mapStyleReady = true;
      mapStatusEl.hidden = true;
      addMinimapMarkers();
      // Settle the final framing without animation on first load
      showMapLocation(itinerary[state.current], { instant: true });
      initialImagesReady.then(() => {
        if (!document.body.classList.contains("popup-closed")) {
          setActiveMapPopup(itinerary[state.current]);
        }
      });
    });
    state.tripMap.on("error", () => {
      if (!mapStatusEl.hidden) {
        mapStatusEl.textContent = "Kaarttegels niet beschikbaar";
      }
    });
    state.tripMap.on("moveend", () => {
      if (state.suppressMapMarkerCommit) return;
      if (state.pendingMapDay !== null) {
        updateMapDayMarkers(state.pendingMapDay);
        state.pendingMapDay = null;
      }
      openRequestedMapPopup();
    });
    state.tripMap.on("render", updateMapPopupBeam);

    let resizeFrame = null;
    window.addEventListener("resize", () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        state.tripMap.resize();
        if (state.activeMapPopup) {
          showMapLocation(itinerary[state.current]);
        }
      });
    });
  } else {
    mapStatusEl.textContent = "Kaartbibliotheek kon niet laden";
    // After the rest of this script has picked and shown the right day
    queueMicrotask(() => initialImagesReady.then(finishBooting));
  }
}
