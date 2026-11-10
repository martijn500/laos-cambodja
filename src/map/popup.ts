import { Popup } from "maplibre-gl";
import { slideAt, state } from "../state.ts";
import { finishBooting } from "../boot.ts";
import { stopAt, type Stop } from "../data/itinerary.ts";
import { stepPopup, type PopupEvent } from "./popup-machine.ts";
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

/** Whether a card may appear on the map right now */
function canOpenPopup(): boolean {
  const map = state.tripMap;
  return (
    map !== null &&
    state.mapStyleReady &&
    !map.isMoving() &&
    !document.body.classList.contains("popup-closed")
  );
}

/** Feed the popup machine and carry out what it decides */
function stepAndApply(event: PopupEvent): void {
  const { machine, effect } = stepPopup(state.popup, event, canOpenPopup());
  state.popup = machine;
  if (effect?.type === "open") openMapPopup(effect.index);
  if (effect?.type === "close") closeMapPopup(effect.toward);
}

/** Show this stop's card on the map (null: no card), animating as needed */
export function setActiveMapPopup(stop: Stop | null): void {
  const wanted = stop ? stop.index : null;
  if (state.tripMap && state.mapStyleReady && wanted !== null) {
    if (state.activeMapPopup?.index !== wanted) {
      slideAt(wanted).classList.add("map-popup-pending");
    }
    document.body.classList.add("map-popup-transition");
  }
  stepAndApply({ type: "want", index: wanted });
  if (state.popup.phase.name === "closed" && wanted === null) {
    document.body.classList.remove("map-popup-transition");
  }
}

/**
 * Open the wanted card if it couldn't open before: called when the map
 * has loaded or stopped moving.
 */
export function openRequestedMapPopup(): void {
  stepAndApply({ type: "want", index: state.popup.wanted });
}

function openMapPopup(slideIndex: number): void {
  const map = state.tripMap;
  if (!map) return;
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

/** Absorb the open card into its marker; `toward` is the next stop */
function closeMapPopup(toward: number | null): void {
  const closingPopup = state.activeMapPopup;
  if (!closingPopup) {
    stepAndApply({ type: "closed" });
    return;
  }
  // Longer when the next card is far away on the map
  const duration =
    toward === null
      ? 340
      : popupTransitionDuration(closingPopup.index, toward) + 100;

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
      state.popup.wanted !== null &&
      !document.body.classList.contains("popup-closed")
    ) {
      // Next card one frame later, so the two never share a frame
      state.popup = stepPopup(state.popup, { type: "closed" }, false).machine;
      requestAnimationFrame(openRequestedMapPopup);
    } else {
      stepAndApply({ type: "closed" });
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
      duration,
      fill: "both",
    },
  );
  trackPopupBeam(animation);
  animation.onfinish = finishClose;
}
