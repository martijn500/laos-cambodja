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
  const day = tripDayNumbers.get(itinerary[state.current].date);
  const route = `${appBasePath}dag-${day}`;
  const historyState = {
    ...(history.state && typeof history.state === "object"
      ? history.state
      : {}),
    tripIndex: state.current,
  };
  if (replace) {
    history.replaceState(historyState, "", route);
  } else {
    history.pushState(historyState, "", route);
  }
}

export function applyInitialRoute() {
  const initialDay = dayFromPath();
  const initialIndex = itinerary.findIndex(
    (stop) => tripDayNumbers.get(stop.date) === initialDay,
  );
  if (initialIndex >= 0) state.current = initialIndex;
}

export function initRouter() {
  window.addEventListener("popstate", (event) => {
    document.body.classList.remove("popup-closed");
    const dayRoute = window.location.pathname
      .slice(appBasePath.length)
      .match(/^dag-(\d+)\/?$/);
    const day = dayRoute ? Number(dayRoute[1]) : 1;
    // History entries remember the exact stop, so a side quest comes back
    // as the side quest and not as its day
    const stateIndex = event.state?.tripIndex;
    const hasValidState =
      Number.isInteger(stateIndex) &&
      itinerary[stateIndex] !== undefined &&
      tripDayNumbers.get(itinerary[stateIndex].date) === day;
    const index = hasValidState
      ? stateIndex
      : itinerary.findIndex((stop) => tripDayNumbers.get(stop.date) === day);
    setDay(index >= 0 ? index : 0);
  });
}
