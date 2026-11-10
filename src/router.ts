import { currentStop, setDay, state } from "./state.ts";
import { itinerary } from "./data/itinerary.ts";

// "/laos-cambodja/" (vite.config.ts); every day has its own page dag-N.html
export const appBasePath = import.meta.env.BASE_URL;

/** Travel day from the /dag-N path; 1 on the home page */
export function dayFromPath(): number {
  const dayRoute = window.location.pathname
    .slice(appBasePath.length)
    .match(/^dag-(\d+)(?:\.html)?\/?$/);
  return dayRoute ? Number(dayRoute[1]) : 1;
}

/** First stop of a travel day (the day itself, not its side quests) */
function indexOfDay(day: number): number {
  return Math.max(
    0,
    itinerary.findIndex((stop) => stop.day === day),
  );
}

export function updateSlideUrl(replace = false): void {
  if (!["http:", "https:"].includes(window.location.protocol)) return;
  const route = `${appBasePath}dag-${currentStop().day}`;
  const historyState: unknown = {
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

export function applyInitialRoute(): void {
  state.current = indexOfDay(dayFromPath());
}

export function initRouter(): void {
  window.addEventListener("popstate", (event: PopStateEvent) => {
    document.body.classList.remove("popup-closed");
    const day = dayFromPath();
    // History entries remember the exact stop, so a side quest comes back
    // as the side quest and not as its day
    const saved: unknown =
      event.state && typeof event.state === "object"
        ? (event.state as { tripIndex?: unknown }).tripIndex
        : undefined;
    const savedStop = typeof saved === "number" ? itinerary[saved] : undefined;
    setDay(savedStop?.day === day ? savedStop.index : indexOfDay(day));
  });
}
