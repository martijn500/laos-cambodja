import { Popup } from "maplibre-gl";
import { slideAt, state } from "../state.ts";
import { finishBooting } from "../boot.ts";
import { stopAt, type Stop } from "../data/itinerary.ts";
import { trackPopupBeam, updateMapPopupBeam } from "./beam.ts";
import { markerButtonForSlide, markerForDay, pulseMarker } from "./markers.ts";
import { deck } from "../slides/build.ts";
import { resetGallery } from "../slides/gallery.ts";
import {
  reducedMotionQuery,
  requireElement,
  restartAnimationClass,
} from "../utils/dom.ts";

// Scale the popup around the centre of its map marker
export function setPopupOriginToMarker(
  slide: HTMLElement,
  slideIndex: number,
): void {
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

export function popupTransitionDuration(
  fromIndex: number,
  toIndex: number,
): number {
  if (!state.tripMap) return 250;
  const fromPoint = state.tripMap.project(stopAt(fromIndex).lngLat);
  const toPoint = state.tripMap.project(stopAt(toIndex).lngLat);
  const distance = Math.hypot(fromPoint.x - toPoint.x, fromPoint.y - toPoint.y);
  if (distance < 120) return 140;
  if (distance < 360) return 180;
  return 250;
}

export function setActiveMapPopup(stop: Stop | null): void {
  state.requestedPopupIndex = stop ? stop.index : null;
  if (!state.tripMap || !state.mapStyleReady) return;

  if (state.requestedPopupIndex !== null) {
    if (state.activeMapPopup?.index !== state.requestedPopupIndex) {
      slideAt(state.requestedPopupIndex).classList.add("map-popup-pending");
    }
    document.body.classList.add("map-popup-transition");
  }

  if (state.activeMapPopup) {
    if (
      state.activeMapPopup.index === state.requestedPopupIndex &&
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
            state.activeMapPopup.index,
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

export function openRequestedMapPopup(): void {
  const map = state.tripMap;
  if (
    !map ||
    state.activeMapPopup ||
    state.requestedPopupIndex === null ||
    document.body.classList.contains("popup-closed") ||
    !state.mapStyleReady ||
    map.isMoving()
  ) {
    return;
  }

  const slideIndex = state.requestedPopupIndex;
  const slide = slideAt(slideIndex);
  const stop = stopAt(slideIndex);
  const color = getComputedStyle(requireElement(".card", slide)).borderTopColor;
  const reducedMotion = reducedMotionQuery.matches;
  // Drop the finished close animation (fill: both) of a previous visit
  slide.getAnimations().forEach((animation) => animation.cancel());
  slide.classList.add("trip-popup-slide");

  const popup = new Popup({
    anchor: "bottom",
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    focusAfterOpen: false,
    maxWidth: "none",
    offset: state.requestedPopupOffset,
  })
    .setLngLat(markerForDay(stop.day)?.lngLat ?? stop.lngLat)
    .setDOMContent(slide)
    .addTo(map);
  const popupElement = popup.getElement();
  popupElement.classList.add("trip-day-popup");
  popupElement.style.setProperty("--popup-color", color);
  state.activeMapPopup = {
    color,
    popup,
    slide,
    index: slideIndex,
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

export function closeActiveMapPopup(): void {
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
    pulseMarker(closingPopup.index);
    if (
      state.requestedPopupIndex !== null &&
      !document.body.classList.contains("popup-closed")
    ) {
      requestAnimationFrame(openRequestedMapPopup);
    } else {
      document.body.classList.remove("map-popup-transition");
    }
  };

  if (reducedMotionQuery.matches) {
    finishClose();
    return;
  }

  closingPopup.slide.getAnimations().forEach((animation) => {
    animation.cancel();
  });
  // The marker may have moved since opening (map resize / re-centre)
  setPopupOriginToMarker(closingPopup.slide, closingPopup.index);
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
