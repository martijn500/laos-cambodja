import { state } from "../state.js";
import { playBeep } from "../audio.js";
import { caricatureNames } from "../data/itinerary.js";
import { reducedMotionQuery, restartAnimationClass } from "../utils/dom.js";

/*
 * Photo gallery per slide. Photos live in img/slides/<slide>/NN.webp
 * (see scripts/optimize-images.sh); the app finds them by loading 01,
 * 02, 03… until one is missing. They play one after another: the
 * current pixel in the indicator fills up (CSS animation) and its end
 * starts the next photo with an arcade bar wipe in the day colour.
 */
export const PHOTO_BARS = 6;

export const galleries = new WeakMap();

export function slidePhotoSrc(stop, number) {
  return `img/slides/${caricatureNames.get(stop)}/${String(number).padStart(2, "0")}.webp`;
}

export function galleryFor(slide) {
  return galleries.get(slide);
}

export function createGallery(slide, stop, firstImage, placeName) {
  const box = firstImage.closest(".img-box");
  const bars = document.createElement("span");
  bars.className = "photo-bars";
  bars.setAttribute("aria-hidden", "true");
  for (let i = 0; i < PHOTO_BARS; i++) {
    bars.append(document.createElement("span"));
  }
  const controls = document.createElement("span");
  controls.className = "photo-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", `Foto's van ${placeName}`);
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
  const gallery = {
    slide,
    stop,
    box,
    bars,
    controls,
    dots,
    placeName,
    images: [firstImage],
    index: 0,
    done: false,
    probing: false,
    animating: false,
  };
  galleries.set(slide, gallery);
  addPhotoDot(gallery, 0);
}

export function addPhotoDot(gallery, index) {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "photo-dot";
  dot.setAttribute("aria-label", `Foto ${index + 1} van ${gallery.placeName}`);
  dot.addEventListener("click", () => showPhoto(gallery, index));
  dot.addEventListener("animationend", (event) => {
    if (event.animationName === "photo-dot-fill") advanceGallery(gallery);
  });
  gallery.dots.append(dot);
  gallery.controls.hidden = gallery.images.length < 2;
  syncPhotoDots(gallery);
}

// One switch for every slideshow (WCAG 2.2.2: moving content can be
// paused). Only this key pauses; hover and focus don't.
export function syncSlideshowToggle(toggle) {
  const stopped = document.body.classList.contains("slideshow-stopped");
  toggle.setAttribute("aria-label", "Diashow pauzeren");
  toggle.setAttribute("aria-pressed", String(stopped));
  toggle.title = stopped ? "Diashow afspelen" : "Diashow pauzeren";
}

export function toggleSlideshow() {
  document.body.classList.toggle("slideshow-stopped");
  playBeep(
    document.body.classList.contains("slideshow-stopped") ? 330 : 494,
    "square",
    0.06,
  );
  document.querySelectorAll(".photo-toggle").forEach(syncSlideshowToggle);
}

export function syncPhotoDots(gallery) {
  [...gallery.dots.children].forEach((dot, index) => {
    const current = index === gallery.index;
    dot.classList.toggle("is-current", current);
    if (current) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
    // One Tab stop for the whole indicator; ← → switch photos
    dot.tabIndex = current ? 0 : -1;
  });
  const currentDot = gallery.dots.children[gallery.index];
  if (currentDot) restartAnimationClass(currentDot, "is-current");
}

// Find 02, 03… one after another, only for a slide that is on screen
export function probeGallery(gallery) {
  if (gallery.done || gallery.probing) return;
  gallery.probing = true;
  const number = gallery.images.length + 1;
  const image = new Image();
  image.className = "slide-photo";
  image.alt = `Sfeerfoto ${number} van ${gallery.placeName}`;
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

export function visibleGallerySlide() {
  if (state.activeMapPopup && !state.activeMapPopup.closing) {
    return state.activeMapPopup.slide;
  }
  return state.mapStyleReady ? null : state.slides[state.current];
}

export function resetGallery(slide) {
  const gallery = galleryFor(slide);
  if (!gallery) return;
  gallery.bars.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  gallery.animating = false;
  setCurrentPhoto(gallery, 0);
  probeGallery(gallery);
}

export function setCurrentPhoto(gallery, index) {
  gallery.images.forEach((image, i) =>
    image.classList.toggle("is-current", i === index),
  );
  gallery.index = index;
  syncPhotoDots(gallery);
}

export function advanceGallery(gallery) {
  if (reducedMotionQuery.matches || gallery.images.length < 2) return;
  if (document.body.classList.contains("slideshow-stopped")) return;
  if (visibleGallerySlide() !== gallery.slide) return;
  showPhoto(gallery, (gallery.index + 1) % gallery.images.length);
}

export async function showPhoto(gallery, index) {
  if (index === gallery.index || gallery.animating) return;
  if (reducedMotionQuery.matches) {
    setCurrentPhoto(gallery, index);
    return;
  }
  gallery.animating = true;
  const bars = [...gallery.bars.children];
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
  await cover.at(-1).finished.catch(() => {});
  if (!gallery.animating) return;
  setCurrentPhoto(gallery, index);
  gallery.images[index].animate(
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
  await reveal[0].finished.catch(() => {});
  cover.concat(reveal).forEach((a) => a.cancel());
  gallery.animating = false;
}
