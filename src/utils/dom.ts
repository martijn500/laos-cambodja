export const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

/**
 * querySelector that fails loudly: a missing element is a bug in
 * index.html or the template, not something to handle at every call.
 */
// Like querySelector<T>, the caller states which element type it expects
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function requireElement<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
}

// Re-adding a class restarts its CSS animation (reflow in between)
export function restartAnimationClass(
  element: HTMLElement,
  className: string,
): void {
  element.classList.remove(className);
  // Reading a layout property forces the reflow
  // eslint-disable-next-line @typescript-eslint/no-meaningless-void-operator
  void element.offsetWidth;
  element.classList.add(className);
}
