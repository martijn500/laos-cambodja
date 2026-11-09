import { setDay, state } from "./state.js";
import { itinerary, tripDayNumbers } from "./data/itinerary.js";

export const appBasePath = (() => {
  const basePath = new URL(document.baseURI).pathname;
  if (document.querySelector("base"))
    return basePath.endsWith("/") ? basePath : `${basePath}/`;
  if (basePath.endsWith("/index.html"))
    return basePath.slice(0, -"index.html".length);
  return basePath.endsWith("/") ? basePath : "/";
})();

// Day from the /dag-N path, so the map can start at the right place
export function dayFromPath() {
  const dayRoute = window.location.pathname
    .slice(appBasePath.length)
    .match(/^dag-(\d+)\/?$/);
  return dayRoute ? Number(dayRoute[1]) : 1;
}

export function updateSlideUrl(replace = false) {
  if (!["http:", "https:"].includes(window.location.protocol)) return;
  const day = tripDayNumbers.get(itinerary[state.currentTimelineIndex].date);
  const route = `${appBasePath}dag-${day}`;
  const historyState = {
    ...(history.state && typeof history.state === "object"
      ? history.state
      : {}),
    tripSlideIndex: state.currentSlide,
    tripTimelineIndex: state.currentTimelineIndex,
  };
  if (replace) {
    history.replaceState(historyState, "", route);
  } else {
    history.pushState(historyState, "", route);
  }
}

export function applyInitialRoute() {
  const initialDay = dayFromPath();
  const initialTimelineIndex = itinerary.findIndex(
    (stop) => tripDayNumbers.get(stop.date) === initialDay,
  );
  if (initialTimelineIndex >= 0) {
    state.currentTimelineIndex = initialTimelineIndex;
    state.currentSlide = itinerary[initialTimelineIndex].slideIndex;
  }
}

export function initRouter() {
  window.addEventListener("popstate", (event) => {
    document.body.classList.remove("popup-closed");
    const dayRoute = window.location.pathname
      .slice(appBasePath.length)
      .match(/^dag-(\d+)\/?$/);
    const day = dayRoute ? Number(dayRoute[1]) : 1;
    const stateTimelineIndex = event.state?.tripTimelineIndex;
    const stateSlideIndex = event.state?.tripSlideIndex;
    const hasValidState =
      Number.isInteger(stateTimelineIndex) &&
      Number.isInteger(stateSlideIndex) &&
      itinerary[stateTimelineIndex]?.slideIndex === stateSlideIndex &&
      tripDayNumbers.get(itinerary[stateTimelineIndex].date) === day;
    const timelineIndex = hasValidState
      ? stateTimelineIndex
      : itinerary.findIndex((stop) => tripDayNumbers.get(stop.date) === day);

    const currentTimelineIndex = timelineIndex >= 0 ? timelineIndex : 0;
    setDay(
      hasValidState
        ? stateSlideIndex
        : itinerary[currentTimelineIndex].slideIndex,
      currentTimelineIndex,
    );
  });
}
