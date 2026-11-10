import { state } from "../state.ts";
import { playBeep } from "../audio.ts";
import type { Stop } from "../data/itinerary.ts";
import {
  reducedMotionQuery,
  requireElement,
  restartAnimationClass,
} from "../utils/dom.ts";

/*
 * Photo gallery per slide. Photos live in img/slides/<slide>/NN.webp
 * (see scripts/optimize-images.sh); the app finds them by loading 01,
 * 02, 03… until one is missing. They play one after another: the
 * current pixel in the indicator fills up (CSS animation) and its end
 * starts the next photo with an arcade bar wipe in the day colour.
 */
export const PHOTO_BARS = 6;

export interface Gallery {
  slide: HTMLElement;
  stop: Stop;
  box: HTMLElement;
  bars: HTMLElement;
  controls: HTMLElement;
  dots: HTMLElement;
  images: HTMLImageElement[];
  /** the photo on screen */
  index: number;
  /** every photo of this slide has been found */
  done: boolean;
  probing: boolean;
  animating: boolean;
}

const galleries = new WeakMap<HTMLElement, Gallery>();

export function slidePhotoSrc(stop: Stop, number: number): string {
  return `${import.meta.env.BASE_URL}img/slides/${stop.slug}/${String(number).padStart(2, "0")}.webp`;
}

export function galleryFor(slide: HTMLElement): Gallery | undefined {
  return galleries.get(slide);
}

export function createGallery(
  slide: HTMLElement,
  stop: Stop,
  firstImage: HTMLImageElement,
): void {
  const box = requireElement(".img-box", slide);
  const bars = document.createElement("span");
  bars.className = "photo-bars";
  bars.setAttribute("aria-hidden", "true");
  for (let i = 0; i < PHOTO_BARS; i++) {
    bars.append(document.createElement("span"));
  }
  const controls = document.createElement("span");
  controls.className = "photo-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", `Foto's van ${stop.place}`);
  controls.hidden = true;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "photo-toggle";
  toggle.addEventListener("click", toggleSlideshow);
  const dots = document.createElement("span");
  dots.className = "photo-dots";
  controls.append(toggle, dots);
  box.append(bars, controls);
  syncSlideshowToggle(toggle);
  const gallery: Gallery = {
    slide,
    stop,
    box,
    bars,
    controls,
    dots,
    images: [firstImage],
    index: 0,
    done: false,
    probing: false,
    animating: false,
  };
  galleries.set(slide, gallery);
  addPhotoDot(gallery, 0);
}

export function addPhotoDot(gallery: Gallery, index: number): void {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "photo-dot";
  dot.setAttribute("aria-label", `Foto ${index + 1} van ${gallery.stop.place}`);
  dot.addEventListener("click", () => void showPhoto(gallery, index));
  dot.addEventListener("animationend", (event) => {
    if (event.animationName === "photo-dot-fill") advanceGallery(gallery);
  });
  gallery.dots.append(dot);
  gallery.controls.hidden = gallery.images.length < 2;
  syncPhotoDots(gallery);
}

// One switch for every slideshow (WCAG 2.2.2: moving content can be
// paused). Only this key pauses; hover and focus don't.
export function syncSlideshowToggle(toggle: HTMLElement): void {
  const stopped = document.body.classList.contains("slideshow-stopped");
  toggle.setAttribute("aria-label", "Diashow pauzeren");
  toggle.setAttribute("aria-pressed", String(stopped));
  toggle.title = stopped ? "Diashow afspelen" : "Diashow pauzeren";
}

export function toggleSlideshow(): void {
  document.body.classList.toggle("slideshow-stopped");
  playBeep(
    document.body.classList.contains("slideshow-stopped") ? 330 : 494,
    "square",
    0.06,
  );
  document
    .querySelectorAll<HTMLElement>(".photo-toggle")
    .forEach(syncSlideshowToggle);
}

export function syncPhotoDots(gallery: Gallery): void {
  [...gallery.dots.querySelectorAll<HTMLElement>(".photo-dot")].forEach(
    (dot, index) => {
      const current = index === gallery.index;
      dot.classList.toggle("is-current", current);
      if (current) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
      // One Tab stop for the whole indicator; ← → switch photos
      dot.tabIndex = current ? 0 : -1;
    },
  );
  const currentDot = gallery.dots.children[gallery.index];
  if (currentDot instanceof HTMLElement) {
    restartAnimationClass(currentDot, "is-current");
  }
}

// Find 02, 03… one after another, only for a slide that is on screen
export function probeGallery(gallery: Gallery): void {
  if (gallery.done || gallery.probing) return;
  gallery.probing = true;
  const number = gallery.images.length + 1;
  const image = new Image();
  image.className = "slide-photo";
  image.alt = `Sfeerfoto ${number} van ${gallery.stop.place}`;
  image.decoding = "async";
  image.onload = () => {
    gallery.probing = false;
    gallery.box.insertBefore(image, gallery.bars);
    gallery.images.push(image);
    addPhotoDot(gallery, gallery.images.length - 1);
    probeGallery(gallery);
  };
  image.onerror = () => {
    gallery.probing = false;
    gallery.done = true;
  };
  image.src = slidePhotoSrc(gallery.stop, number);
}

export function visibleGallerySlide(): HTMLElement | null {
  if (state.activeMapPopup && !state.activeMapPopup.closing) {
    return state.activeMapPopup.slide;
  }
  return state.mapStyleReady ? null : (state.slides[state.current] ?? null);
}

export function resetGallery(slide: HTMLElement): void {
  const gallery = galleryFor(slide);
  if (!gallery) return;
  gallery.bars.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  gallery.animating = false;
  setCurrentPhoto(gallery, 0);
  probeGallery(gallery);
}

export function setCurrentPhoto(gallery: Gallery, index: number): void {
  gallery.images.forEach((image, i) =>
    image.classList.toggle("is-current", i === index),
  );
  gallery.index = index;
  syncPhotoDots(gallery);
}

export function advanceGallery(gallery: Gallery): void {
  if (reducedMotionQuery.matches || gallery.images.length < 2) return;
  if (document.body.classList.contains("slideshow-stopped")) return;
  if (visibleGallerySlide() !== gallery.slide) return;
  void showPhoto(gallery, (gallery.index + 1) % gallery.images.length);
}

/** A cancelled animation rejects `finished`; that is expected here */
function ignoreCancel(): void {
  // nothing to do: the next transition takes over
}

export async function showPhoto(
  gallery: Gallery,
  index: number,
): Promise<void> {
  if (index === gallery.index || gallery.animating) return;
  if (reducedMotionQuery.matches) {
    setCurrentPhoto(gallery, index);
    return;
  }
  gallery.animating = true;
  const bars = [...gallery.bars.querySelectorAll("span")];
  const step = 38;
  // Cover: bars shoot in from the left in chunky steps, top to bottom
  const cover = bars.map((bar, i) =>
    bar.animate(
      [
        { scale: "0 1", transformOrigin: "0 50%" },
        { scale: "1 1", transformOrigin: "0 50%" },
      ],
      {
        duration: 220,
        delay: i * step,
        easing: "steps(5, end)",
        fill: "both",
      },
    ),
  );
  await cover.at(-1)?.finished.catch(ignoreCancel);
  // resetGallery() may have stopped this transition while we waited
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!gallery.animating) return;
  setCurrentPhoto(gallery, index);
  gallery.images[index]?.animate(
    [{ scale: 1.08, filter: "saturate(1.6) brightness(1.25)" }, {}],
    { duration: 700, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
  // Reveal: bars leave to the right, bottom bar first
  const reveal = bars.map((bar, i) =>
    bar.animate(
      [
        { scale: "1 1", transformOrigin: "100% 50%" },
        { scale: "0 1", transformOrigin: "100% 50%" },
      ],
      {
        duration: 220,
        delay: (bars.length - 1 - i) * step,
        easing: "steps(5, end)",
        fill: "both",
      },
    ),
  );
  // The top bar leaves last
  await reveal[0]?.finished.catch(ignoreCancel);
  cover.concat(reveal).forEach((a) => a.cancel());
  gallery.animating = false;
}
