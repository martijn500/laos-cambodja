/**
 * Shared app state. Modules read and write these fields directly; an
 * imported `let` would be read-only, so state that more than one module
 * changes lives here.
 */
export const state = {
  /** Index into `slides` / `itinerary` of the open day */
  currentSlide: 0,
  currentTimelineIndex: 0,
  /** @type {HTMLElement[]} built from the slide <template> */
  slides: [],
  /** @type {HTMLButtonElement[]} timeline cards */
  pageIndicators: [],

  /** @type {any} MapLibre map, null until (and unless) the library loads */
  tripMap: null,
  mapStyleReady: false,
  /** @type {{ color: string, popup: any, slide: HTMLElement, slideIndex: number, closing: boolean } | null} */
  activeMapPopup: null,
  /** @type {number | null} */
  requestedPopupIndex: null,
  requestedPopupDuration: 240,
  requestedPopupOffset: 14,
  /** @type {number | null} day whose marker becomes current after the camera move */
  pendingMapDay: null,
  suppressMapMarkerCommit: false,
};

const events = new EventTarget();

/**
 * Switch to another stop. Everything that shows the current day listens to
 * "daychange" (see onDayChange) instead of being called from here.
 * @param {number} slideIndex
 * @param {number} [timelineIndex]
 */
export function setDay(slideIndex, timelineIndex = slideIndex) {
  state.currentSlide = slideIndex;
  state.currentTimelineIndex = timelineIndex;
  events.dispatchEvent(new Event("daychange"));
}

/** @param {() => void} listener */
export function onDayChange(listener) {
  events.addEventListener("daychange", listener);
}
