import type { Map as MapLibreMap, Popup } from "maplibre-gl";
import { stopAt, type Stop } from "./data/itinerary.ts";
import { initialPopupMachine, type PopupMachine } from "./map/popup-machine.ts";

/** The day card that is open on the map, anchored to its marker */
export interface ActiveMapPopup {
  /** the card's border colour, used for the beam */
  color: string;
  popup: Popup;
  slide: HTMLElement;
  /** stop index (= slide index) */
  index: number;
}

interface AppState {
  /** The open stop: index into `itinerary`, `slides` and `pageIndicators` */
  current: number;
  /** built from the slide <template>, one per stop */
  slides: HTMLElement[];
  /** timeline cards, one per stop */
  pageIndicators: HTMLButtonElement[];

  /** null until (and unless) the map could be created */
  tripMap: MapLibreMap | null;
  mapStyleReady: boolean;
  /** the card on the map, also while it closes (see popup-machine.ts) */
  activeMapPopup: ActiveMapPopup | null;
  popup: PopupMachine;
  requestedPopupOffset: number;
  /** day whose marker becomes current after the camera move */
  pendingMapDay: number | null;
  suppressMapMarkerCommit: boolean;
}

/**
 * Shared app state. Modules read and write these fields directly; an
 * imported `let` would be read-only, so state that more than one module
 * changes lives here.
 */
export const state: AppState = {
  current: 0,
  slides: [],
  pageIndicators: [],
  tripMap: null,
  mapStyleReady: false,
  activeMapPopup: null,
  popup: initialPopupMachine,
  requestedPopupOffset: 14,
  pendingMapDay: null,
  suppressMapMarkerCommit: false,
};

/** The stop that is open now */
export function currentStop(): Stop {
  return stopAt(state.current);
}

/** The slide of a stop; throws before buildSlides() has run (a bug) */
export function slideAt(index: number): HTMLElement {
  const slide = state.slides[index];
  if (!slide) throw new Error(`No slide at index ${index}`);
  return slide;
}

const events = new EventTarget();

/**
 * Switch to another stop. Everything that shows the current day listens to
 * "daychange" (see onDayChange) instead of being called from here.
 */
export function setDay(index: number): void {
  state.current = index;
  events.dispatchEvent(new Event("daychange"));
}

export function onDayChange(listener: () => void): void {
  events.addEventListener("daychange", listener);
}
