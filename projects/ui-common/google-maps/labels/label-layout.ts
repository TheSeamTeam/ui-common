/** A label's measured size and its unadjusted position, in div pixels. */
export interface LabelBox {
  key: string
  /** Centre x of the label, as projected. Never adjusted. */
  x: number
  /** Centre y of the label, as projected. The resolver may move this. */
  y: number
  width: number
  height: number
  /** Higher wins a collision and keeps its position. */
  priority: number
}

export interface ResolveLabelOverlapsOptions {
  /** Clear space left between two stacked labels. */
  gapPx?: number
  /** How many box-heights a label may be pushed in either direction. */
  maxSteps?: number
}

export const DEFAULT_LABEL_GAP_PX = 4
export const DEFAULT_LABEL_MAX_STEPS = 3

/**
 * Resolves overlapping labels by pushing the lower-priority ones above or
 * below, and hiding the ones that still have nowhere to go.
 *
 * Returns the final centre y per key, or `null` for a label that should be
 * hidden. Only y moves: a label's x ties it to the shape it names, and sliding
 * it sideways would walk it off its own polygon, which is the bug
 * `polygonLabelPoint` exists to prevent. Vertical stacking keeps every label
 * horizontally over its shape.
 *
 * Placement is greedy in priority order, and ties break on key, so the same
 * set of labels always resolves the same way. That matters more than
 * optimality here: an exact solution that reshuffles between frames would make
 * labels jump around while the map is panned, whereas a stable approximate one
 * looks still.
 */
export function resolveLabelOverlaps(
  boxes: LabelBox[],
  options: ResolveLabelOverlapsOptions = {},
): Map<string, number | null> {
  const gap = options.gapPx ?? DEFAULT_LABEL_GAP_PX
  const maxSteps = options.maxSteps ?? DEFAULT_LABEL_MAX_STEPS

  const placements = new Map<string, number | null>()
  const placed: LabelBox[] = []

  for (const box of [...boxes].sort(byPriorityThenKey)) {
    const y = firstFreeY(box, placed, gap, maxSteps)
    placements.set(box.key, y)
    if (y !== null) {
      placed.push({ ...box, y })
    }
  }

  return placements
}

function byPriorityThenKey(a: LabelBox, b: LabelBox): number {
  return b.priority - a.priority || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
}

/**
 * The box's own y if nothing is there, else the nearest free y stepping
 * alternately down and up. `null` when every candidate within the budget is
 * taken.
 */
function firstFreeY(
  box: LabelBox,
  placed: LabelBox[],
  gap: number,
  maxSteps: number,
): number | null {
  const step = box.height + gap

  for (const offset of candidateOffsets(step, maxSteps)) {
    const candidate = { ...box, y: box.y + offset }
    if (!placed.some((other) => overlaps(candidate, other, gap))) {
      return candidate.y
    }
  }
  return null
}

/** `0, +step, -step, +2step, -2step, …` out to `maxSteps`. */
function* candidateOffsets(step: number, maxSteps: number): Generator<number> {
  yield 0
  for (let n = 1; n <= maxSteps; n++) {
    yield n * step
    yield -n * step
  }
}

/**
 * Whether two centred boxes overlap, counting the gap vertically only.
 * Horizontally they may touch: side-by-side labels on adjacent fields read
 * fine, and insisting on a gap there would displace labels that are not really
 * in each other's way.
 */
function overlaps(a: LabelBox, b: LabelBox, gap: number): boolean {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2 + gap
  )
}
