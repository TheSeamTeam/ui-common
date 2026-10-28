/**
 * The legacy `google.maps.places.Autocomplete` renders its suggestion list in
 * a `.pac-container` it appends to `body` a moment after it is constructed,
 * and never removes it: the class has no teardown. Nothing on the container
 * names the input it serves, so each one is matched to its autocomplete by
 * creation order — Google adds them in the order the autocompletes were
 * constructed.
 */

const waiting: ((container: HTMLElement) => void)[] = []
/** Every container already handed out, so moving one is not mistaken for a new one. */
const claimed = new WeakSet<HTMLElement>()
let observer: MutationObserver | undefined

/**
 * Hands the next `.pac-container` added to `body` to `onClaimed`. Call it
 * immediately before constructing the `Autocomplete`.
 *
 * @returns A function that withdraws the claim, for an autocomplete destroyed
 * before its container arrived.
 */
export function claimNextPacContainer(
  onClaimed: (container: HTMLElement) => void,
): () => void {
  waiting.push(onClaimed)
  _observe()
  return () => {
    const index = waiting.indexOf(onClaimed)
    if (index !== -1) {
      waiting.splice(index, 1)
    }
    if (waiting.length === 0) {
      _disconnect()
    }
  }
}

function _observe(): void {
  if (observer !== undefined) {
    return
  }
  observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          node.classList.contains('pac-container') &&
          !claimed.has(node)
        ) {
          const onClaimed = waiting.shift()
          if (onClaimed !== undefined) {
            claimed.add(node)
            onClaimed(node)
          }
        }
      })
    }
    if (waiting.length === 0) {
      _disconnect()
    }
  })
  observer.observe(document.body, { childList: true })
}

function _disconnect(): void {
  observer?.disconnect()
  observer = undefined
}

/**
 * Keeps a suggestion list visible while its input is in fullscreen. Only the
 * fullscreen element and its descendants render then, and the list lives on
 * `body`, so it is moved into the fullscreen element and back out on exit.
 */
export function syncPacContainerWithFullscreen(
  container: HTMLElement,
  input: HTMLElement,
): void {
  const fullscreenElement = document.fullscreenElement
  const parent =
    fullscreenElement !== null && fullscreenElement.contains(input)
      ? fullscreenElement
      : document.body
  if (container.parentElement !== parent) {
    parent.appendChild(container)
  }
}
