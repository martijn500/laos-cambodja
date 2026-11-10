import { setDay, state } from "./state.js";
import { playBeep } from "./audio.js";
import { itinerary, tripDayNumbers } from "./data/itinerary.js";
import { showMapLocation } from "./map/map.js";
import {
  mapDayMarkers,
  setMarkerTabStop,
  updateMapDayMarkers,
} from "./map/markers.js";
import { setActiveMapPopup } from "./map/popup.js";
import { updateSlideUrl } from "./router.js";
import { pageIndicatorsEl } from "./timeline.js";
import { restartAnimationClass } from "./utils/dom.js";

export const progressEl = document.getElementById("progress");

export const progressDayEl = progressEl.querySelector(".progress-day");

export const progressIconEl = progressEl.querySelector(".progress-icon");

export function updateDeck() {
  const popupPending =
    state.mapStyleReady &&
    !document.body.classList.contains("popup-closed") &&
    state.activeMapPopup?.slideIndex !== state.current;
  if (popupPending) {
    document.body.classList.add("map-popup-transition");
  }

  state.slides.forEach((slide, idx) => {
    slide.classList.toggle(
      "map-popup-pending",
      popupPending && idx === state.current,
    );
    slide.classList.toggle("active", idx === state.current);
  });
  state.pageIndicators.forEach((indicator, idx) => {
    if (idx === state.current) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }
    // Roving tabindex: only the current day is a Tab stop
    indicator.tabIndex = idx === state.current ? 0 : -1;
  });
  const activeIndicator = state.pageIndicators[state.current];
  document.body.style.setProperty(
    "--day-color",
    activeIndicator.style.getPropertyValue("--indicator-color"),
  );
  const indicatorBounds = activeIndicator.getBoundingClientRect();
  const timelineBounds = pageIndicatorsEl.getBoundingClientRect();
  const desiredScrollLeft =
    pageIndicatorsEl.scrollLeft +
    indicatorBounds.left +
    indicatorBounds.width / 2 -
    timelineBounds.left -
    timelineBounds.width / 2;
  const maxScrollLeft =
    pageIndicatorsEl.scrollWidth - pageIndicatorsEl.clientWidth;
  const targetScrollLeft = Math.min(
    maxScrollLeft,
    Math.max(0, desiredScrollLeft),
  );
  if (Math.abs(targetScrollLeft - pageIndicatorsEl.scrollLeft) > 1) {
    pageIndicatorsEl.scrollTo({
      left: targetScrollLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  const currentStop = itinerary[state.current];
  const progressLabel = `Dag ${tripDayNumbers.get(currentStop.date)}`;
  if (
    progressDayEl.textContent !== progressLabel ||
    progressIconEl.textContent !== currentStop.icon
  ) {
    restartAnimationClass(progressEl, "is-updating");
  }
  progressDayEl.textContent = progressLabel;
  progressIconEl.textContent = currentStop.icon;
  progressIconEl.setAttribute("aria-label", currentStop.iconLabel);
  updateMapDayMarkers(tripDayNumbers.get(currentStop.date));
  showMapLocation(currentStop);
  setActiveMapPopup(currentStop);
}

// Keep keyboard focus on the current day inside the timeline / markers
export function focusCurrentDay(group) {
  if (group === "timeline") {
    state.pageIndicators[state.current]?.focus({
      preventScroll: true,
    });
    return;
  }
  const day = tripDayNumbers.get(itinerary[state.current].date);
  const marker = mapDayMarkers.find((entry) => entry.day === day);
  if (!marker) return;
  setMarkerTabStop(day);
  // preventScroll: the map container must never be scrolled by focus
  marker.button.focus({ preventScroll: true });
}

export function closeSlidePopup() {
  playBeep(293.66, "triangle", 0.1);
  document.body.classList.add("popup-closed");
  setActiveMapPopup(null);
  mapDayMarkers
    .find(
      ({ day }) => day === tripDayNumbers.get(itinerary[state.current].date),
    )
    ?.button.focus();
}

/** @param {number} index stop in the itinerary (= its slide) */
export function goToSlide(index) {
  const popupWasClosed = document.body.classList.contains("popup-closed");
  document.body.classList.remove("popup-closed");
  if (index === state.current) {
    // Same day: only reopen its popup if it was closed
    if (popupWasClosed) updateDeck();
    return;
  }
  playBeep(587.33, "triangle", 0.12);
  setDay(index);
  updateSlideUrl();
}

export function nextSlide() {
  document.body.classList.remove("popup-closed");
  let next = state.current + 1;
  if (next < state.slides.length) {
    playBeep(587.33, "triangle", 0.12);
  } else {
    // Past the last day: wrap around to the start
    next = 0;
    playBeep(880, "sawtooth", 0.2);
  }
  setDay(next);
  updateSlideUrl();
}

export function prevSlide() {
  document.body.classList.remove("popup-closed");
  if (state.current === 0) return;
  const previous = state.current - 1;
  playBeep(349.23, "triangle", 0.12);
  setDay(previous);
  updateSlideUrl();
}
