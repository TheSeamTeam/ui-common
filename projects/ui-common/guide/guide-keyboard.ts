export interface GuideKeyHandlers {
  next(): void
  previous(): void
  /** Escape. Called whether or not the guide may be dismissed. */
  escape(): void
}

/**
 * Elements that use Escape or the arrow keys themselves. A key typed in one
 * belongs to it, even when it sits inside the highlighted element.
 */
const OWNS_KEYS = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="radiogroup"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="tablist"]',
  '[role="tree"]',
  '[role="grid"]',
].join(', ')

/** A CDK overlay pane: a modal, menu, or dropdown. */
const OVERLAY_PANE = '.cdk-overlay-pane'

/**
 * Listens for the guide's keys: Right and Left to move, Escape to close.
 *
 * A capture listener on `window`, so it hears a key before anything else
 * does, and can keep an Escape it acts on from also closing the modal the
 * guide is shown over. It leaves a key alone when it comes from:
 *
 * - a field, or another element that uses those keys itself;
 * - a CDK overlay pane opened after the guide started, such as a
 *   confirmation dialog opened from a highlighted button. Escape closes that
 *   dialog, not the guide.
 *
 * Returns the function that stops listening.
 */
export function listenForGuideKeys(handlers: GuideKeyHandlers): () => void {
  const view = document.defaultView
  if (view === null) {
    return () => {}
  }
  const panesAtStart = new Set(
    Array.from(document.querySelectorAll(OVERLAY_PANE)),
  )

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.isComposing) {
      return
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }
    if (
      event.key !== 'Escape' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowLeft'
    ) {
      return
    }
    if (isOwnedElsewhere(event.target, panesAtStart)) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      handlers.escape()
    } else if (!event.repeat) {
      if (event.key === 'ArrowRight') {
        handlers.next()
      } else {
        handlers.previous()
      }
    }
  }

  view.addEventListener('keydown', onKeydown, true)
  return () => view.removeEventListener('keydown', onKeydown, true)
}

function isOwnedElsewhere(
  target: EventTarget | null,
  panesAtStart: ReadonlySet<Element>,
): boolean {
  if (!(target instanceof Element)) {
    return false
  }
  if (target.closest(OWNS_KEYS) !== null) {
    return true
  }
  const pane = target.closest(OVERLAY_PANE)
  return pane !== null && !panesAtStart.has(pane)
}
