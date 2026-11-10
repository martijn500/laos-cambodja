import { itinerary } from "./data/itinerary.ts";
import { focusCurrentDay, goToSlide, nextSlide, prevSlide } from "./deck.ts";
import { galleryFor, showPhoto } from "./slides/gallery.ts";
import type { DayGroup } from "./deck.ts";

// Touch Swipe Controls for Mobile
// Disabled while only the map is visible, so panning/zooming isn't hijacked
export let touchStartX = 0;

export let swipeEnabled = false;

export function initInput(): void {
  /*
   * Keyboard: ← / → = previous / next day, anywhere in the app. Inside the
   * timeline or the map markers focus follows the current day, and
   * Home / End jump to the first / last day. The map canvas keeps its
   * own arrow keys for panning. Capture phase: MapLibre handles (and
   * prevents) arrow keys for everything inside the map, markers included.
   */
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(".maplibregl-canvas, input, textarea, select")) {
        return;
      }
      const photoDots = target?.closest(".photo-dots");
      if (photoDots && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        const slide = photoDots.closest<HTMLElement>(".slide");
        const gallery = slide && galleryFor(slide);
        if (!gallery) return;
        const count = gallery.images.length;
        const next =
          (gallery.index + (e.key === "ArrowRight" ? 1 : count - 1)) % count;
        e.preventDefault();
        e.stopPropagation();
        showPhoto(gallery, next);
        const dot = photoDots.children[next];
        if (dot instanceof HTMLElement) dot.focus({ preventScroll: true });
        return;
      }
      const group: DayGroup | null = target?.closest("#page-indicators")
        ? "timeline"
        : target?.closest(".map-day-marker")
          ? "markers"
          : null;
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (group && e.key === "Home") {
        goToSlide(0);
      } else if (group && e.key === "End") {
        goToSlide(itinerary.length - 1);
      } else {
        return;
      }
      e.preventDefault();
      if (group) {
        // Don't let the map pan as well when a marker has focus
        e.stopPropagation();
        focusCurrentDay(group);
      }
    },
    true,
  );
  document.addEventListener("touchstart", (e) => {
    swipeEnabled =
      e.touches.length === 1 &&
      !document.body.classList.contains("popup-closed");
    touchStartX = e.changedTouches[0]?.screenX ?? 0;
  });
  document.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    if (!swipeEnabled || !touch) return;
    const touchEndX = touch.screenX;
    if (touchStartX - touchEndX > 50) nextSlide();
    if (touchEndX - touchStartX > 50) prevSlide();
  });
}
