import { state } from "../state.ts";
import { mapContainerEl } from "./map.ts";
import { markerButtonForSlide } from "./markers.ts";
import { rgbStringToHsl } from "../utils/color.ts";
import { requireElement } from "../utils/dom.ts";

export const mapPopupBeamEl = requireElement<SVGSVGElement>("#map-popup-beam");

// Keep the beam glued to the card while it scales in or out
export function trackPopupBeam(animation: Animation): void {
  const tick = () => {
    updateMapPopupBeam();
    // "pending": play() was called but the first frame isn't out yet
    if (animation.playState === "running" || animation.pending) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

export const BEAM_BAR_HEIGHT = 4;

export const BEAM_BAR_GAP = 3;

export const BEAM_PIXEL = 4;

export const mapPopupBeamBarsEl = requireElement<SVGGElement>(
  ".map-popup-beam-bars",
  mapPopupBeamEl,
);

export function clearMapPopupBeam(): void {
  mapPopupBeamBarsEl.replaceChildren();
}

/*
 * Arcade beam: a stack of horizontal bars from the marker up to the
 * card. Bars widen in pixel steps, each gets its own hue step of the
 * card colour and they fade out towards the card, so the card looks
 * like it pops out of the marker.
 */
export function updateMapPopupBeam(): void {
  if (!state.activeMapPopup) {
    clearMapPopupBeam();
    return;
  }

  const marker = markerButtonForSlide(state.activeMapPopup.index);
  // The card's box includes the running scale animation
  const card = state.activeMapPopup.slide.querySelector(".card");
  if (!marker || !card) return;

  const mapBounds = mapContainerEl.getBoundingClientRect();
  const popupBounds = card.getBoundingClientRect();
  const markerBounds = marker.getBoundingClientRect();
  mapPopupBeamEl.style.opacity = getComputedStyle(
    state.activeMapPopup.slide,
  ).opacity;
  mapPopupBeamEl.setAttribute(
    "viewBox",
    `0 0 ${mapBounds.width} ${mapBounds.height}`,
  );

  // Bottom of the stack: just above the marker; top: the card edge
  const stackBottom = markerBounds.top - mapBounds.top - 3;
  const stackTop = popupBounds.bottom - mapBounds.top;
  const stackHeight = stackBottom - stackTop;
  const barCount = Math.floor(
    (stackHeight + BEAM_BAR_GAP) / (BEAM_BAR_HEIGHT + BEAM_BAR_GAP),
  );
  if (popupBounds.width < 8 || barCount < 1) {
    clearMapPopupBeam();
    return;
  }

  const sourceX = markerBounds.left + markerBounds.width / 2 - mapBounds.left;
  const cardX = popupBounds.left + popupBounds.width / 2 - mapBounds.left;
  const beamInset = Math.min(18, popupBounds.width * 0.1);
  const bottomWidth = markerBounds.width;
  const topWidth = Math.max(bottomWidth, popupBounds.width - beamInset * 2);
  const [hue, saturation, lightness] = rgbStringToHsl(
    state.activeMapPopup.color,
  );

  while (mapPopupBeamBarsEl.childElementCount > barCount) {
    mapPopupBeamBarsEl.lastElementChild?.remove();
  }
  while (mapPopupBeamBarsEl.childElementCount < barCount) {
    mapPopupBeamBarsEl.append(
      document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    );
  }

  // Spread the bars evenly so the top bar touches the card
  const pitch =
    barCount > 1 ? (stackHeight - BEAM_BAR_HEIGHT) / (barCount - 1) : 0;
  Array.from(mapPopupBeamBarsEl.children).forEach((bar, index) => {
    // index 0 sits on the marker, the last bar touches the card
    const t = barCount > 1 ? index / (barCount - 1) : 0.5;
    // Flare out towards the card, snapped to a pixel grid
    const flare = t ** 1.4;
    const width =
      Math.round(
        (bottomWidth + (topWidth - bottomWidth) * flare) / BEAM_PIXEL,
      ) * BEAM_PIXEL;
    const centerX = sourceX + (cardX - sourceX) * flare;
    const y = stackBottom - BEAM_BAR_HEIGHT - index * pitch;
    // Calm: small hue drift, a shade darker than the day colour
    const barHue = (hue + t * 20 + 360) % 360;
    const barLightness = Math.max(28, lightness - 12 + t * 6);
    bar.setAttribute("x", (centerX - width / 2).toFixed(1));
    bar.setAttribute("y", y.toFixed(1));
    bar.setAttribute("width", String(width));
    bar.setAttribute("height", String(BEAM_BAR_HEIGHT));
    bar.setAttribute(
      "fill",
      `hsl(${barHue.toFixed(0)} ${saturation.toFixed(0)}% ${barLightness.toFixed(0)}%)`,
    );
    // Like a motion trail: solid where the card is, fading towards the
    // marker it came out of
    bar.setAttribute("fill-opacity", (0.18 + t * 0.52).toFixed(2));
  });
}
