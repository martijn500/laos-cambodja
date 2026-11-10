import {
  Map as MapLibreMap,
  setWorkerUrl,
  type EaseToOptions,
} from "maplibre-gl";
// MapLibre looks for its worker next to its own file; after bundling that
// file is gone, so let Vite bundle the worker and pass its URL
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { currentStop, state } from "../state.ts";
import { finishBooting, initialImagesReady } from "../boot.ts";
import { itinerary, type Stop } from "../data/itinerary.ts";
import { updateMapPopupBeam } from "./beam.ts";
import {
  addMinimapMarkers,
  markerForDay,
  updateMapDayMarkers,
} from "./markers.ts";
import { openRequestedMapPopup, setActiveMapPopup } from "./popup.ts";
import { dayFromPath } from "../router.ts";
import { reducedMotionQuery, requireElement } from "../utils/dom.ts";

export const mapStatusEl = requireElement("#map-status");

export const mapContainerEl = requireElement("#trip-map");

const mobileQuery = window.matchMedia("(max-width: 600px)");

export function showMapLocation(stop: Stop, { instant = false } = {}): void {
  const map = state.tripMap;
  if (!map) return;

  const { zoom } = stop.location;
  const day = stop.day;
  const center = markerForDay(day)?.lngLat ?? stop.lngLat;
  const mapBounds = mapContainerEl.getBoundingClientRect();
  const timelineTop =
    requireElement(".nav-controls").getBoundingClientRect().top;
  const slideCard =
    state.slides[stop.index]?.querySelector<HTMLElement>(".card");
  const mobilePopupMaxHeight =
    mapBounds.height - (mapBounds.bottom - timelineTop) - 120;
  const popupHeight = Math.min(
    slideCard?.offsetHeight ?? 0,
    mobileQuery.matches
      ? mobilePopupMaxHeight
      : timelineTop - mapBounds.top - 48,
  );
  const visibleCenterY = mapBounds.top + (timelineTop - mapBounds.top) / 2;
  const popupBottom = visibleCenterY + popupHeight / 2;
  state.requestedPopupOffset = Math.max(14, (timelineTop - popupBottom) / 2);
  state.activeMapPopup?.popup.setOffset(state.requestedPopupOffset);
  const targetY = visibleCenterY + popupHeight / 2 + state.requestedPopupOffset;
  const offsetY = targetY - (mapBounds.top + mapBounds.height / 2);
  const camera: EaseToOptions = {
    center,
    zoom,
    offset: [0, offsetY],
    bearing: 0,
    pitch: 0,
  };

  if (state.mapStyleReady) {
    if (map.isMoving()) {
      state.suppressMapMarkerCommit = true;
      try {
        map.stop();
      } finally {
        state.suppressMapMarkerCommit = false;
      }
    }
    const targetPoint = map.project(center);
    const focusX = mapBounds.width / 2;
    const focusY = mapBounds.height / 2 + offsetY;
    const isAlreadyAtLocation =
      Math.abs(map.getZoom() - zoom) < 0.01 &&
      Math.hypot(targetPoint.x - focusX, targetPoint.y - focusY) < 2;
    if (isAlreadyAtLocation) {
      updateMapDayMarkers(day);
      state.pendingMapDay = null;
      return;
    }
  }

  // Before the style has loaded (first paint of a /dag-N page) jump
  // straight to the final framing, so the map never visibly scrolls
  if (instant || !state.mapStyleReady || reducedMotionQuery.matches) {
    state.pendingMapDay = null;
    // jumpTo ignores `offset`; a zero-length easeTo honours it
    map.easeTo({ ...camera, duration: 0 });
    updateMapDayMarkers(day);
  } else {
    state.pendingMapDay = day;
    map.easeTo({ ...camera, duration: 900, essential: false });
  }
}

export function initMap(): void {
  setWorkerUrl(mapWorkerUrl);
  const initialStop =
    itinerary.find((stop) => stop.day === dayFromPath()) ?? currentStop();
  let map: MapLibreMap;
  try {
    map = new MapLibreMap({
      attributionControl: false,
      boxZoom: false,
      center: initialStop.lngLat,
      container: mapContainerEl,
      doubleClickZoom: false,
      interactive: true,
      // Screen-reader name of the canvas (MapLibre default is "Map")
      locale: {
        "Map.Title": "Kaart: pijltjes verschuiven, plus en min zoomen",
      },
      style: "https://tiles.openfreemap.org/styles/positron",
      zoom: initialStop.location.zoom,
    });
  } catch (error) {
    // Throws without WebGL 2; the days still work without the map
    console.error(error);
    mapStatusEl.textContent = "Kaart kan niet laden in deze browser";
    // After the rest of main.ts has picked and shown the right day
    queueMicrotask(() => void initialImagesReady.then(finishBooting));
    return;
  }
  state.tripMap = map;

  // Fall back to the plain slide if the map takes far too long
  setTimeout(() => {
    if (!state.mapStyleReady) finishBooting();
  }, 8000);

  map.once("load", () => {
    state.mapStyleReady = true;
    mapStatusEl.hidden = true;
    addMinimapMarkers();
    // Settle the final framing without animation on first load
    showMapLocation(currentStop(), { instant: true });
    void initialImagesReady.then(() => {
      if (!document.body.classList.contains("popup-closed")) {
        setActiveMapPopup(currentStop());
      }
    });
  });
  map.on("error", () => {
    if (!mapStatusEl.hidden) {
      mapStatusEl.textContent = "Kaarttegels niet beschikbaar";
    }
  });
  map.on("moveend", () => {
    if (state.suppressMapMarkerCommit) return;
    if (state.pendingMapDay !== null) {
      updateMapDayMarkers(state.pendingMapDay);
      state.pendingMapDay = null;
    }
    openRequestedMapPopup();
  });
  map.on("render", updateMapPopupBeam);

  let resizeFrame: number | null = null;
  window.addEventListener("resize", () => {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      map.resize();
      if (state.activeMapPopup) showMapLocation(currentStop());
    });
  });
}
