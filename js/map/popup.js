import { state } from "../state.js";
import { finishBooting } from "../boot.js";
import { itinerary, tripDayNumbers } from "../data/itinerary.js";
import { trackPopupBeam, updateMapPopupBeam } from "./beam.js";
import { mapDayMarkers, markerButtonForSlide, pulseMarker } from "./markers.js";
import { deck } from "../slides/build.js";
import { resetGallery } from "../slides/gallery.js";
import { restartAnimationClass } from "../utils/dom.js";

// Scale the popup around the centre of its map marker
export function setPopupOriginToMarker(slide, slideIndex) {
  const marker = markerButtonForSlide(slideIndex);
  if (!marker) {
    slide.style.transformOrigin = "50% 100%";
    return;
  }
  const slideBounds = slide.getBoundingClientRect();
  const markerBounds = marker.getBoundingClientRect();
  const originX = markerBounds.left + markerBounds.width / 2 - slideBounds.left;
  const originY = markerBounds.top + markerBounds.height / 2 - slideBounds.top;
  slide.style.transformOrigin = `${originX}px ${originY}px`;
}

export function popupTransitionDuration(fromIndex, toIndex) {
  const from = itinerary[fromIndex];
  const to = itinerary[toIndex];
  const fromPoint = state.tripMap.project([
    from.location.coordinates[1],
    from.location.coordinates[0],
  ]);
  const toPoint = state.tripMap.project([
    to.location.coordinates[1],
    to.location.coordinates[0],
  ]);
  const distance = Math.hypot(fromPoint.x - toPoint.x, fromPoint.y - toPoint.y);
  if (distance < 120) return 140;
  if (distance < 360) return 180;
  return 250;
}

export function setActiveMapPopup(stop) {
  state.requestedPopupIndex = stop ? stop.slideIndex : null;
  if (!state.tripMap || !state.mapStyleReady) return;

  if (state.requestedPopupIndex !== null) {
    if (state.activeMapPopup?.slideIndex !== state.requestedPopupIndex) {
      state.slides[state.requestedPopupIndex].classList.add(
        "map-popup-pending",
      );
    }
    document.body.classList.add("map-popup-transition");
  }

  if (state.activeMapPopup) {
    if (
      state.activeMapPopup.slideIndex === state.requestedPopupIndex &&
      !state.activeMapPopup.closing
    ) {
      return;
    }
    if (state.activeMapPopup.closing) return;
    // Duration of the card being absorbed into its marker
    state.requestedPopupDuration =
      state.requestedPopupIndex === null
        ? 340
        : popupTransitionDuration(
            state.activeMapPopup.slideIndex,
            state.requestedPopupIndex,
          ) + 100;
    closeActiveMapPopup();
    return;
  }

  if (state.requestedPopupIndex !== null) {
    openRequestedMapPopup();
  } else {
    document.body.classList.remove("map-popup-transition");
  }
}

export function openRequestedMapPopup() {
  if (
    state.activeMapPopup ||
    state.requestedPopupIndex === null ||
    document.body.classList.contains("popup-closed") ||
    !state.tripMap ||
    !state.mapStyleReady ||
    state.tripMap.isMoving()
  ) {
    return;
  }

  const slideIndex = state.requestedPopupIndex;
  const slide = state.slides[slideIndex];
  const stop = itinerary.find((item) => item.slideIndex === slideIndex);
  const day = tripDayNumbers.get(stop.date);
  const dayMarker = mapDayMarkers.find((marker) => marker.day === day);
  const color = getComputedStyle(slide.querySelector(".card")).borderTopColor;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  // Drop the finished close animation (fill: both) of a previous visit
  slide.getAnimations().forEach((animation) => animation.cancel());
  slide.classList.add("trip-popup-slide");

  const popup = new maplibregl.Popup({
    anchor: "bottom",
    autoPan: false,
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    focusAfterOpen: false,
    maxWidth: "none",
    offset: state.requestedPopupOffset,
  })
    .setLngLat([
      ...(dayMarker?.coordinates ?? [
        stop.location.coordinates[1],
        stop.location.coordinates[0],
      ]),
    ])
    .setDOMContent(slide)
    .addTo(state.tripMap);
  const popupElement = popup.getElement();
  popupElement.classList.add("trip-day-popup");
  popupElement.style.setProperty("--popup-color", color);
  state.activeMapPopup = {
    color,
    popup,
    slide,
    slideIndex,
    closing: false,
  };
  setPopupOriginToMarker(slide, slideIndex);
  updateMapPopupBeam();

  resetGallery(slide);
  if (!reducedMotion) {
    // The card springs out of the centre of its marker
    restartAnimationClass(slide, "is-entering");
    pulseMarker(slideIndex);
    const animation = slide.animate(
      [
        { transform: "scale(0.02)", opacity: 0, filter: "blur(2px)" },
        { opacity: 1, offset: 0.2 },
        { transform: "scale(1)", opacity: 1, filter: "blur(0)" },
      ],
      {
        duration: 480,
        easing: "cubic-bezier(0.34, 1.22, 0.64, 1)",
        fill: "both",
      },
    );
    trackPopupBeam(animation);
  }
  slide.classList.remove("map-popup-pending");
  finishBooting();
  document.body.classList.remove("map-popup-transition");
}

export function closeActiveMapPopup() {
  const closingPopup = state.activeMapPopup;
  if (!closingPopup || closingPopup.closing) return;
  closingPopup.closing = true;

  const finishClose = () => {
    if (state.activeMapPopup !== closingPopup) return;
    closingPopup.popup.remove();
    closingPopup.slide.classList.remove("trip-popup-slide", "is-entering");
    closingPopup.slide.style.removeProperty("transform-origin");
    deck.append(closingPopup.slide);
    state.activeMapPopup = null;
    updateMapPopupBeam();
    pulseMarker(closingPopup.slideIndex);
    if (
      state.requestedPopupIndex !== null &&
      !document.body.classList.contains("popup-closed")
    ) {
      requestAnimationFrame(openRequestedMapPopup);
    } else {
      document.body.classList.remove("map-popup-transition");
    }
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishClose();
    return;
  }

  closingPopup.slide.getAnimations().forEach((animation) => {
    animation.cancel();
  });
  // The marker may have moved since opening (map resize / re-centre)
  setPopupOriginToMarker(closingPopup.slide, closingPopup.slideIndex);
  // Short anticipation swell, then the card is sucked into its marker
  const animation = closingPopup.slide.animate(
    [
      {
        transform: "scale(1)",
        opacity: 1,
        filter: "blur(0)",
        easing: "ease-out",
      },
      {
        transform: "scale(1.025)",
        opacity: 1,
        filter: "blur(0)",
        offset: 0.16,
        easing: "cubic-bezier(0.55, 0, 0.85, 0.25)",
      },
      { transform: "scale(0.02)", opacity: 0, filter: "blur(2px)" },
    ],
    {
      duration: state.requestedPopupDuration,
      fill: "both",
    },
  );
  trackPopupBeam(animation);
  animation.onfinish = finishClose;
}
