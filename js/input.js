import { itinerary } from "./data/itinerary.js";
import { focusCurrentDay, goToSlide, nextSlide, prevSlide } from "./deck.js";
import { galleryFor, showPhoto } from "./slides/gallery.js";

// Touch Swipe Controls for Mobile
// Disabled while only the map is visible, so panning/zooming isn't hijacked
export let touchStartX = 0;

export let swipeEnabled = false;

export function initInput() {
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
        const gallery = galleryFor(photoDots.closest(".slide"));
        const count = gallery.images.length;
        const next =
          (gallery.index + (e.key === "ArrowRight" ? 1 : count - 1)) % count;
        e.preventDefault();
        e.stopPropagation();
        showPhoto(gallery, next);
        /** @type {HTMLElement} */ (photoDots.children[next])?.focus({
          preventScroll: true,
        });
        return;
      }
      const group = target?.closest("#page-indicators")
        ? "timeline"
        : target?.closest(".map-day-marker")
          ? "markers"
          : null;
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (group && e.key === "Home") {
        goToSlide(itinerary[0].slideIndex, 0);
      } else if (group && e.key === "End") {
        goToSlide(itinerary.at(-1).slideIndex, itinerary.length - 1);
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
    touchStartX = e.changedTouches[0].screenX;
  });
  document.addEventListener("touchend", (e) => {
    if (!swipeEnabled) return;
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextSlide();
    if (touchEndX - touchStartX > 50) prevSlide();
  });
}
