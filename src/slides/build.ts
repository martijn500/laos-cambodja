import { state } from "../state.ts";
import { itinerary } from "../data/itinerary.ts";
import { stopThemes } from "../data/themes.ts";
import { closeSlidePopup } from "../deck.ts";
import { requireElement } from "../utils/dom.ts";
import { createGallery, galleryFor, slidePhotoSrc } from "./gallery.ts";

export const deck = requireElement(".deck");

export function buildSlides(): void {
  const template = requireElement<HTMLTemplateElement>("#slide-template");
  const slideTemplate = requireElement(".slide", template.content);
  state.slides = itinerary.map((stop, idx) => {
    const slide = slideTemplate.cloneNode(true) as HTMLElement;
    const tag = requireElement(".tag", slide);
    const heading = requireElement("h2", slide);
    const description = requireElement(".desc", slide);
    const quote = requireElement("blockquote", slide);
    const slideImage = requireElement<HTMLImageElement>("img", slide);
    const imageBox = requireElement(".img-box", slide);
    const card = requireElement(".card", slide);
    const [routeValue, sleepValue] = slide.querySelectorAll(".stat-value");
    const caricature = document.createElement("span");
    const caricatureImage = document.createElement("img");
    const closeButton = document.createElement("button");

    card.style.borderColor = stopThemes[stop.theme];
    imageBox.style.borderColor = stopThemes[stop.theme];
    slide.setAttribute("role", "dialog");
    slide.setAttribute("aria-label", stop.title);
    // Photos come from img/slides/<08 | 08-s1>/01.webp, 02.webp…; the first
    // one is loaded later (opening day first, the rest once it is ready).
    slideImage.className = "slide-photo is-current";
    slideImage.dataset.src = slidePhotoSrc(stop, 1);
    slideImage.alt = `Sfeerfoto 1 van ${stop.place}`;
    slideImage.addEventListener(
      "error",
      () => {
        const gallery = galleryFor(slide);
        if (gallery) gallery.done = true;
      },
      { once: true },
    );
    createGallery(slide, stop, slideImage);
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
    if (routeValue) routeValue.textContent = String(stop.day);
    if (sleepValue) {
      sleepValue.textContent = stop.sleep.replace(/^Slaap: /, "");
    }
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
      caricatureImage.dataset.src = `${import.meta.env.BASE_URL}img/cartoons/${stop.slug}.webp`;
      caricature.append(caricatureImage);
      card.append(caricature);
    }
    return slide;
  });
  deck.append(...state.slides);
}
