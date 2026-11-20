import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y'

/**
 * Pauses the focus trap of whatever the guide is shown over, such as a modal,
 * until the returned function is called.
 *
 * driver.js puts its popover on `<body>` and focuses it on every step. A CDK
 * focus trap sees that as focus leaving its element and, on a timeout, moves
 * focus back to the element's first tabbable element. The browser scrolls
 * that element into view, which undoes the scroll to the step's target and
 * leaves the highlight pointing off screen.
 *
 * CDK keeps its `ConfigurableFocusTrap`s in a stack and only the top one is
 * active. This pushes a trap around all of `<body>`: it is active, so the one
 * below pauses, and nothing focusable is outside it, so it never moves focus
 * itself. Removing it resumes the trap below. A dialog opened during the
 * guide pushes its own trap on top and works as usual.
 *
 * Keyboard focus is still kept on the guide: driver.js cycles Tab between
 * its popover and the highlighted element.
 *
 * Returns the function that resumes the paused trap.
 */
export function pauseFocusTraps(
  factory: ConfigurableFocusTrapFactory,
): () => void {
  // `defer` keeps the trap from adding its tab anchors around `<body>`.
  const trap = factory.create(document.body, { defer: true })
  return () => trap.destroy()
}
