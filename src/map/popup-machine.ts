/*
 * Which day card is on the map, as a small state machine. Pure logic, no
 * DOM: popup.ts feeds it what the app wants and performs the effects it
 * returns (create the MapLibre popup, play the close animation).
 *
 *            want i, map idle             want j ≠ i
 *   closed ───────────────────▶ open(i) ───────────▶ closing(i)
 *     ▲                                                  │
 *     └──────────────── close animation done ────────────┘
 *
 * Only one card is ever on the map. A new wish while a card is closing
 * is remembered (`wanted`) and handled once the close has finished, so
 * fast clicking can't stack two cards or reopen a card mid-animation.
 */

export type PopupPhase =
  | { readonly name: "closed" }
  | { readonly name: "open"; readonly index: number }
  | { readonly name: "closing"; readonly index: number };

export interface PopupMachine {
  readonly phase: PopupPhase;
  /** the stop whose card should be on the map; null = none */
  readonly wanted: number | null;
}

export type PopupEffect =
  | { readonly type: "open"; readonly index: number }
  | {
      readonly type: "close";
      readonly index: number;
      /** where the next card will come from, for the animation length */
      readonly toward: number | null;
    };

export interface Step {
  readonly machine: PopupMachine;
  readonly effect: PopupEffect | null;
}

export type PopupEvent =
  /** the app wants this stop's card (null: no card) */
  | { readonly type: "want"; readonly index: number | null }
  /** the close animation has finished */
  | { readonly type: "closed" };

export const initialPopupMachine: PopupMachine = {
  phase: { name: "closed" },
  wanted: null,
};

/**
 * Next state for an event. `canOpen` is false while a card may not
 * appear yet (map still loading or moving, card closed by the user); the
 * caller steps again with { type: "want" } when that changes.
 */
export function stepPopup(
  machine: PopupMachine,
  event: PopupEvent,
  canOpen: boolean,
): Step {
  const wanted = event.type === "want" ? event.index : machine.wanted;
  const phase: PopupPhase =
    event.type === "closed" && machine.phase.name === "closing"
      ? { name: "closed" }
      : machine.phase;

  switch (phase.name) {
    case "closed":
      if (wanted !== null && canOpen) {
        return {
          machine: { phase: { name: "open", index: wanted }, wanted },
          effect: { type: "open", index: wanted },
        };
      }
      return { machine: { phase, wanted }, effect: null };
    case "open":
      if (wanted === phase.index) {
        return { machine: { phase, wanted }, effect: null };
      }
      return {
        machine: { phase: { name: "closing", index: phase.index }, wanted },
        effect: { type: "close", index: phase.index, toward: wanted },
      };
    case "closing":
      // Wait for "closed"; the latest wish is kept
      return { machine: { phase, wanted }, effect: null };
  }
}
