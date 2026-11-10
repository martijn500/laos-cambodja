import { slideAt, state } from "./state.ts";
import { itinerary } from "./data/itinerary.ts";
import { goToSlide } from "./deck.ts";
import { slideThumbSrc } from "./slides/gallery.ts";
import { requireElement } from "./utils/dom.ts";

export const pageIndicatorsEl = requireElement("#page-indicators");

/** The day colour as the browser resolved it, "rgb(…)" */
function cardColor(slide: HTMLElement): string {
  return getComputedStyle(requireElement(".card", slide)).borderTopColor;
}

export function buildTimeline(): void {
  state.pageIndicators = itinerary.map((stop, idx) => {
    const slide = slideAt(stop.index);
    const button = document.createElement("button");
    const image = document.createElement("img");
    const thumbnail = document.createElement("span");
    const flags = document.createElement("span");
    const meta = document.createElement("span");
    const dateBadge = document.createElement("span");
    const stopTitle = document.createElement("span");
    const copy = document.createElement("span");
    const card = document.createElement("span");
    const connector = document.createElement("span");
    const node = document.createElement("span");
    const dateNumber = document.createElement("span");

    button.type = "button";
    button.className = "page-indicator";
    const indicatorColor = cardColor(slide);
    const nextStop = itinerary[idx + 1];
    const nextIndicatorColor = cardColor(
      nextStop ? slideAt(nextStop.index) : slide,
    );
    button.style.setProperty("--indicator-color", indicatorColor);
    button.style.setProperty("--next-indicator-color", nextIndicatorColor);
    if (stop.sideQuest) {
      button.classList.add("side-quest");
    }
    button.title = `${stop.date} · ${stop.flags} · ${stop.icon} ${stop.iconLabel} · ${stop.title} — ${stop.detail} ${stop.sleep}`;

    image.className = "timeline-thumb";
    image.dataset.src = slideThumbSrc(stop);
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    thumbnail.className = "timeline-thumb-wrap";
    meta.className = "timeline-meta";
    flags.className = "timeline-flags";
    flags.textContent = stop.flags;
    flags.setAttribute("aria-hidden", "true");
    meta.append(flags);
    dateBadge.className = "timeline-date-badge";
    // Side quests share their date with the main day: label them instead
    dateBadge.textContent = stop.sideQuest
      ? "SIDE QUEST"
      : stop.date.replace(/^[^·]+·\s*/, "");
    dateBadge.setAttribute("aria-hidden", "true");
    // Spaces between the parts, so their text doesn't run together
    // ("519 FEB") when it is read as one string
    thumbnail.append(image, dateBadge, " ", meta);
    stopTitle.className = "timeline-title";
    stopTitle.textContent = stop.title.replace(/^SIDE QUEST:\s*/i, "");
    copy.className = "timeline-copy";
    copy.append(stopTitle);
    card.className = "timeline-card";
    connector.className = "timeline-connector";
    node.className = "timeline-node";
    node.setAttribute("aria-hidden", "true");
    dateNumber.className = "timeline-date-number";
    dateNumber.style.setProperty("--marker-color", indicatorColor);
    const isFirstStopOfDate = itinerary[idx - 1]?.date !== stop.date;
    if (isFirstStopOfDate) {
      dateNumber.textContent = String(stop.day);
      dateNumber.setAttribute("aria-hidden", "true");
    }

    // The name starts with exactly what the card shows ("5 19 FEB 🇱🇦
    // Gibbon Experience: dag 2"), so a voice-control user can say what
    // they see (WCAG 2.5.3); the details follow
    const visibleText = [
      dateNumber.textContent,
      dateBadge.textContent,
      flags.textContent,
      stopTitle.textContent,
    ]
      .filter(Boolean)
      .join(" ");
    button.setAttribute(
      "aria-label",
      `Dag ${visibleText}. ${stop.iconLabel}. ${stop.detail} ${stop.sleep}`,
    );
    card.append(thumbnail, " ", copy);
    button.append(connector, node, dateNumber, " ", card);
    button.dataset.index = String(idx);
    pageIndicatorsEl.append(button);
    return button;
  });

  // One listener for the whole timeline (event delegation)
  pageIndicatorsEl.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>(".page-indicator");
    if (button) goToSlide(Number(button.dataset.index));
  });
}
