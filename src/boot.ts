import { currentStop, slideAt, state } from "./state.ts";
import { requireElement } from "./utils/dom.ts";

/**
 * Resolves once the opening day's images have decoded, or after 4s. Set by
 * preloadBootImages(), which main.ts calls before anything awaits it.
 */
export let initialImagesReady: Promise<unknown> = Promise.resolve();

export function finishBooting(): void {
  document.body.classList.remove("is-booting");
}

/*
 * Preload the opening day's photo and cartoon with high priority; the
 * popup waits for them (at most 4s) so the card appears complete. Every
 * other image only starts afterwards, so it doesn't steal bandwidth.
 */
export function loadDeferredImage(
  image: HTMLImageElement,
  priority: HTMLImageElement["fetchPriority"] = "auto",
): void {
  const { src } = image.dataset;
  if (!src) return;
  image.fetchPriority = priority;
  image.src = src;
  delete image.dataset.src;
}

export function preloadBootImages(): void {
  const bootImages = [
    ...slideAt(state.current).querySelectorAll<HTMLImageElement>(
      "img[data-src]",
    ),
  ];
  bootImages.forEach((image) => loadDeferredImage(image, "high"));
  initialImagesReady = Promise.race([
    Promise.allSettled(bootImages.map((image) => image.decode())),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
  void initialImagesReady.then(() => {
    document
      .querySelectorAll<HTMLImageElement>("img[data-src]")
      .forEach((image) => loadDeferredImage(image));
  });
}

export function showBootDay(): void {
  const stop = currentStop();
  requireElement("#boot-day").textContent =
    `DAG ${stop.day}: ${stop.place.toUpperCase()}`;
}
