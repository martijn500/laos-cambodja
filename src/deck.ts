import { currentStop, setDay, state } from "./state.ts";
import { playBeep } from "./audio.ts";
import { showMapLocation } from "./map/map.ts";
import {
  markerForDay,
  setMarkerTabStop,
  updateMapDayMarkers,
} from "./map/markers.ts";
import { setActiveMapPopup } from "./map/popup.ts";
import { updateSlideUrl } from "./router.ts";
import { pageIndicatorsEl } from "./timeline.ts";
import {
  reducedMotionQuery,
  requireElement,
  restartAnimationClass,
} from "./utils/dom.ts";

/** Where keyboard focus moves along with the current day */
export type DayGroup = "timeline" | "markers";

export const progressEl = requireElement("#progress");

export const progressDayEl = requireElement(".progress-day", progressEl);

export const progressIconEl = requireElement(".progress-icon", progressEl);

export function updateDeck(): void {
  const popupPending =
    state.mapStyleReady &&
    !document.body.classList.contains("popup-closed") &&
    state.activeMapPopup?.index !== state.current;
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
  if (!activeIndicator) return;
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
      behavior: reducedMotionQuery.matches ? "auto" : "smooth",
    });
  }
  const stop = currentStop();
  const progressLabel = `Dag ${stop.day}`;
  if (
    progressDayEl.textContent !== progressLabel ||
    progressIconEl.textContent !== stop.icon
  ) {
    restartAnimationClass(progressEl, "is-updating");
  }
  progressDayEl.textContent = progressLabel;
  progressIconEl.textContent = stop.icon;
  progressIconEl.setAttribute("aria-label", stop.iconLabel);
  updateMapDayMarkers(stop.day);
  showMapLocation(stop);
  setActiveMapPopup(stop);
}

// Keep keyboard focus on the current day inside the timeline / markers
export function focusCurrentDay(group: DayGroup): void {
  if (group === "timeline") {
    state.pageIndicators[state.current]?.focus({
      preventScroll: true,
    });
    return;
  }
  const day = currentStop().day;
  const marker = markerForDay(day);
  if (!marker) return;
  setMarkerTabStop(day);
  // preventScroll: the map container must never be scrolled by focus
  marker.button.focus({ preventScroll: true });
}

export function closeSlidePopup(): void {
  playBeep(293.66, "triangle", 0.1);
  document.body.classList.add("popup-closed");
  setActiveMapPopup(null);
  markerForDay(currentStop().day)?.button.focus();
}

/** Open stop `index` (= its slide) from a click on a marker or card */
export function goToSlide(index: number): void {
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

export function nextSlide(): void {
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

export function prevSlide(): void {
  document.body.classList.remove("popup-closed");
  if (state.current === 0) return;
  const previous = state.current - 1;
  playBeep(349.23, "triangle", 0.12);
  setDay(previous);
  updateSlideUrl();
}
