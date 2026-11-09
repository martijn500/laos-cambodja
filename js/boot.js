import { state } from "./state.js";
import { itinerary, tripDayNumbers } from "./data/itinerary.js";

export let initialImagesReady;

export function finishBooting() {
  document.body.classList.remove("is-booting");
}

/*
 * Preload the opening day's photo and cartoon with high priority; the
 * popup waits for them (at most 4s) so the card appears complete. Every
 * other image only starts afterwards, so it doesn't steal bandwidth.
 */
export function loadDeferredImage(image, priority = "auto") {
  image.fetchPriority = priority;
  image.src = image.dataset.src;
  delete image.dataset.src;
}

export function preloadBootImages() {
  const bootImages = [
    ...state.slides[state.currentSlide].querySelectorAll(
      /** @type {"img"} */ ("img[data-src]"),
    ),
  ];
  bootImages.forEach((image) => loadDeferredImage(image, "high"));
  initialImagesReady = Promise.race([
    Promise.allSettled(bootImages.map((image) => image.decode())),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
  initialImagesReady.then(() => {
    document
      .querySelectorAll("img[data-src]")
      .forEach((image) => loadDeferredImage(image));
  });
}

export function showBootDay() {
  document.getElementById("boot-day").textContent =
    `DAG ${tripDayNumbers.get(itinerary[state.currentTimelineIndex].date)}: ${itinerary[state.currentTimelineIndex].location.name.split(" · ")[0].toUpperCase()}`;
}
