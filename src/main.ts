// Entry point: wires the modules together in start-up order.
import { toggleAudio } from "./audio.ts";
import { preloadBootImages, showBootDay } from "./boot.ts";
import { nextSlide, prevSlide, updateDeck } from "./deck.ts";
import { initInput } from "./input.ts";
import { initMap } from "./map/map.ts";
import { addMinimapMarkers } from "./map/markers.ts";
import { applyInitialRoute, initRouter, updateSlideUrl } from "./router.ts";
import { onDayChange } from "./state.ts";
import { buildSlides } from "./slides/build.ts";
import { buildTimeline } from "./timeline.ts";
import { requireElement } from "./utils/dom.ts";

// The map starts loading first; its load handler opens the day popup.
initMap();
buildSlides();
applyInitialRoute();
preloadBootImages();
showBootDay();
buildTimeline();
addMinimapMarkers();

requireElement(".nav-btn-prev").addEventListener("click", prevSlide);
requireElement(".nav-btn-next").addEventListener("click", nextSlide);
requireElement(".sound-btn").addEventListener("click", toggleAudio);

// From here on every day change re-renders the deck, popup and timeline
onDayChange(updateDeck);
initRouter();
updateSlideUrl(true);
updateDeck();
initInput();
