import { state } from "../state.js";
import {
  caricatureNames,
  itinerary,
  tripDayNumbers,
} from "../data/itinerary.js";
import { stopThemes } from "../data/themes.js";
import { closeSlidePopup } from "../deck.js";
import { createGallery, galleryFor, slidePhotoSrc } from "./gallery.js";

export const deck = document.querySelector(".deck");

export function buildSlides() {
  const template = /** @type {HTMLTemplateElement} */ (
    document.getElementById("slide-template")
  );
  state.slides = itinerary.map((stop, idx) => {
    const slide = /** @type {HTMLElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
    const tag = slide.querySelector(".tag");
    const heading = slide.querySelector("h2");
    const description = slide.querySelector(".desc");
    const quote = slide.querySelector("blockquote");
    const slideImage = slide.querySelector("img");
    const imageBox = /** @type {HTMLElement} */ (
      slide.querySelector(".img-box")
    );
    const card = /** @type {HTMLElement} */ (slide.querySelector(".card"));
    const [routeStat, sleepStat] = slide.querySelectorAll(".stat-item");
    const tripDay = tripDayNumbers.get(stop.date);
    const caricature = document.createElement("span");
    const caricatureImage = document.createElement("img");
    const closeButton = document.createElement("button");

    stop.slideIndex = idx;
    card.style.borderColor = stopThemes[stop.theme];
    imageBox.style.borderColor = stopThemes[stop.theme];
    slide.setAttribute("role", "dialog");
    slide.setAttribute("aria-label", stop.title);
    // Photos come from img/slides/<08 | 08-s1>/01.webp, 02.webp…; the first
    // one is loaded later (opening day first, the rest once it is ready).
    const placeName = stop.location.name.split(" · ")[0];
    slideImage.className = "slide-photo is-current";
    slideImage.dataset.src = slidePhotoSrc(stop, 1);
    slideImage.alt = `Sfeerfoto 1 van ${placeName}`;
    slideImage.addEventListener(
      "error",
      () => {
        galleryFor(slide).done = true;
      },
      { once: true },
    );
    createGallery(slide, stop, slideImage, placeName);
    slide.classList.toggle("active", idx === state.current);
    tag.textContent = `${stop.date} · ${stop.flags}`;
    heading.textContent = stop.title;
    description.textContent = stop.detail;
    quote.textContent = stop.quote;
    closeButton.type = "button";
    closeButton.className = "slide-close";
    closeButton.setAttribute("aria-label", "Sluit reisdag");
    closeButton.title = "Sluit";
    const closeIcon = document.createElement("span");
    closeIcon.textContent = "×";
    closeButton.append(closeIcon);
    closeButton.addEventListener("click", closeSlidePopup);
    card.append(closeButton);
    routeStat.firstChild.textContent = "REISDAG";
    routeStat.querySelector(".stat-value").textContent = tripDay;
    sleepStat.firstChild.textContent = "OVERNACHTING";
    sleepStat.querySelector(".stat-value").textContent = stop.sleep.replace(
      /^Slaap: /,
      "",
    );
    caricature.className = "slide-caricature";
    if (stop.caricatureAlign === "top") {
      caricature.classList.add("align-top");
    }
    caricature.setAttribute("aria-hidden", "true");
    caricatureImage.alt = "";
    caricatureImage.addEventListener("error", () => caricature.remove(), {
      once: true,
    });
    if (stop.caricature !== false) {
      caricatureImage.dataset.src = `img/cartoons/${caricatureNames.get(stop)}.webp`;
      caricature.append(caricatureImage);
      card.append(caricature);
    }
    return slide;
  });
  deck.append(...state.slides);
}
