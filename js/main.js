// Entry point: wires the modules together in start-up order.
import { toggleAudio } from "./audio.js";
import { preloadBootImages, showBootDay } from "./boot.js";
import { nextSlide, prevSlide, updateDeck } from "./deck.js";
import { initInput } from "./input.js";
import { initMap } from "./map/map.js";
import { addMinimapMarkers } from "./map/markers.js";
import { applyInitialRoute, initRouter, updateSlideUrl } from "./router.js";
import { onDayChange } from "./state.js";
import { buildSlides } from "./slides/build.js";
import { buildTimeline } from "./timeline.js";

// Scripts run only after the stylesheets above them have loaded: from here
// on the page can be shown (see the inline <style> in index.html).
document.body.classList.add("is-styled");

// The map starts loading first; its load handler opens the day popup.
initMap();
buildSlides();
applyInitialRoute();
preloadBootImages();
showBootDay();
buildTimeline();
addMinimapMarkers();

document.querySelector(".nav-btn-prev").addEventListener("click", prevSlide);
document.querySelector(".nav-btn-next").addEventListener("click", nextSlide);
document.querySelector(".sound-btn").addEventListener("click", toggleAudio);

// From here on every day change re-renders the deck, popup and timeline
onDayChange(updateDeck);
initRouter();
updateSlideUrl(true);
updateDeck();
initInput();
