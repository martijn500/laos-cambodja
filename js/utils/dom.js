export const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

// Re-adding a class restarts its CSS animation (reflow in between)
export function restartAnimationClass(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}
