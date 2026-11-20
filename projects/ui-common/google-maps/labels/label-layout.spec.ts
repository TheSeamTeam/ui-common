import { LabelBox, resolveLabelOverlaps } from './label-layout'

/** A 100x20 box centred on `(x, y)`, which is how the overlay positions one. */
const box = (
  key: string,
  x: number,
  y: number,
  priority = 0,
  width = 100,
  height = 20,
): LabelBox => ({ key, x, y, width, height, priority })

/** The resolved y for `key`, or `null` when it was hidden. */
const yOf = (
  placements: Map<string, number | null>,
  key: string,
): number | null | undefined => placements.get(key)

describe('resolveLabelOverlaps', () => {
  it('leaves a label that collides with nothing where it is', () => {
    const placements = resolveLabelOverlaps([
      box('a', 0, 0),
      box('b', 500, 500),
    ])
    expect(yOf(placements, 'a')).toBe(0)
    expect(yOf(placements, 'b')).toBe(500)
  })

  it('leaves labels that merely sit side by side alone', () => {
    // Touching horizontally but not overlapping: 100 wide, centres 100 apart.
    const placements = resolveLabelOverlaps([box('a', 0, 0), box('b', 100, 0)])
    expect(yOf(placements, 'a')).toBe(0)
    expect(yOf(placements, 'b')).toBe(0)
  })

  it('keeps the higher-priority label in place and moves the other', () => {
    const placements = resolveLabelOverlaps([
      box('low', 0, 0, 1),
      box('high', 0, 0, 5),
    ])
    expect(yOf(placements, 'high')).toBe(0)
    expect(yOf(placements, 'low')).not.toBe(0)
  })

  it('pushes a colliding label a full box height clear, plus the gap', () => {
    const placements = resolveLabelOverlaps(
      [box('high', 0, 0, 5), box('low', 0, 0, 1)],
      { gapPx: 4 },
    )
    expect(yOf(placements, 'low')).toBe(24)
  })

  it('alternates below then above, so a third label goes the other way', () => {
    const placements = resolveLabelOverlaps(
      [box('a', 0, 0, 3), box('b', 0, 0, 2), box('c', 0, 0, 1)],
      { gapPx: 4 },
    )
    expect(yOf(placements, 'a')).toBe(0)
    expect(yOf(placements, 'b')).toBe(24)
    expect(yOf(placements, 'c')).toBe(-24)
  })

  it('hides a label that is still colliding once the step budget runs out', () => {
    const boxes = [
      box('a', 0, 0, 9),
      box('b', 0, 0, 8),
      box('c', 0, 0, 7),
      box('d', 0, 0, 6),
    ]
    const placements = resolveLabelOverlaps(boxes, { gapPx: 4, maxSteps: 1 })
    expect(yOf(placements, 'a')).toBe(0)
    expect(yOf(placements, 'b')).toBe(24)
    expect(yOf(placements, 'c')).toBe(-24)
    expect(yOf(placements, 'd')).toBeNull()
  })

  it('orders equal priorities by key, so placement is stable across frames', () => {
    const forwards = resolveLabelOverlaps([box('a', 0, 0), box('b', 0, 0)])
    const backwards = resolveLabelOverlaps([box('b', 0, 0), box('a', 0, 0)])
    expect(yOf(forwards, 'a')).toBe(yOf(backwards, 'a'))
    expect(yOf(forwards, 'b')).toBe(yOf(backwards, 'b'))
    expect(yOf(forwards, 'a')).toBe(0)
  })

  it('returns a placement for every label it was given', () => {
    const placements = resolveLabelOverlaps([
      box('a', 0, 0),
      box('b', 0, 0),
      box('c', 0, 0),
    ])
    expect([...placements.keys()].sort()).toEqual(['a', 'b', 'c'])
  })

  it('places nothing when given nothing', () => {
    expect(resolveLabelOverlaps([]).size).toBe(0)
  })
})
