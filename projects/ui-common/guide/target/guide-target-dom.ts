import { from, merge, Observable, of } from 'rxjs'
import { filter, map, switchMap, timeout } from 'rxjs/operators'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'

/** `querySelector` throws on an invalid selector; a registry name often is one. */
export function safeQuerySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch {
    return null
  }
}

export function isValidSelector(selector: string): boolean {
  try {
    document.createDocumentFragment().querySelector(selector)
    return true
  } catch {
    return false
  }
}

/**
 * Emits whenever what `target` resolves to may have changed: its name's
 * registrations changed, or, when it is also a valid selector, the DOM did.
 *
 * Watching the DOM is not free, so subscribe only for as long as needed.
 */
export function targetChanges(
  registry: TheSeamGuideTargetRegistry,
  target: string,
): Observable<void> {
  const registered$ = registry.changes$.pipe(
    filter((changed) => changed === target),
    map(() => undefined),
  )
  return isValidSelector(target)
    ? merge(registered$, domChanges())
    : registered$
}

function domChanges(): Observable<void> {
  return new Observable<void>((subscriber) => {
    const observer = new MutationObserver(() => subscriber.next())
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })
    return () => observer.disconnect()
  })
}

/**
 * Emits once the animations moving `element` have finished, or after
 * `maxMs`, whichever is sooner. These are animations on the element or on one
 * containing it, such as a dialog's open animation, so the highlight is
 * placed where the element ends up rather than where it starts.
 *
 * Animations that never end, such as a spinner, are not waited for. Neither
 * are animations inside the element: they do not move it, and a size change
 * is followed after the step shows.
 */
export function animationsSettled(
  element: Element,
  maxMs: number,
): Observable<unknown> {
  const doc = element.ownerDocument
  if (typeof doc.getAnimations !== 'function') {
    return of(null)
  }
  // A frame first: an animation started in the same turn that made the
  // element appear may not be running yet.
  return nextFrame().pipe(
    switchMap(() => {
      const moving = doc
        .getAnimations()
        .filter((animation) => isMoving(animation, element))
      if (moving.length === 0) {
        return of(null)
      }
      const finished = moving.map((animation) =>
        animation.finished.catch(() => undefined),
      )
      return from(Promise.all(finished)).pipe(
        timeout({ first: maxMs, with: () => of(null) }),
      )
    }),
  )
}

function isMoving(animation: Animation, element: Element): boolean {
  if (animation.playState !== 'running') {
    return false
  }
  const effect = animation.effect
  const target =
    effect !== null && 'target' in effect
      ? (effect as KeyframeEffect).target
      : null
  if (target === null || !target.contains(element)) {
    return false
  }
  const end = effect?.getComputedTiming().endTime
  return typeof end === 'number' && Number.isFinite(end)
}

function nextFrame(): Observable<void> {
  return new Observable<void>((subscriber) => {
    const id = requestAnimationFrame(() => {
      subscriber.next()
      subscriber.complete()
    })
    return () => cancelAnimationFrame(id)
  })
}
