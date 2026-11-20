import { MultiPolygon, Polygon } from 'geojson'

import { LabelSourceFeature, buildFeatureLabels } from './build-feature-labels'

/** An axis-aligned square polygon of side `size` with its lower-left at x,y. */
const squareAt = (x: number, y: number, size = 10): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [x, y],
      [x + size, y],
      [x + size, y + size],
      [x, y + size],
      [x, y],
    ],
  ],
})

const source = (
  over: Partial<LabelSourceFeature> & Pick<LabelSourceFeature, 'groupKey'>,
): LabelSourceFeature => ({
  text: 'North 40',
  geometry: squareAt(0, 0),
  selected: false,
  ...over,
})

describe('buildFeatureLabels', () => {
  describe('one label per group (the default)', () => {
    it('emits a single label for a group of several features', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', geometry: squareAt(0, 0) }),
          source({ groupKey: 'A', geometry: squareAt(20, 0) }),
        ],
        { perPolygon: false },
      )
      expect(labels).toHaveLength(1)
      expect(labels[0].key).toBe('A')
      expect(labels[0].text).toBe('North 40')
    })

    it('spans the whole group with the bounds, for the size threshold', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', geometry: squareAt(0, 0) }),
          source({ groupKey: 'A', geometry: squareAt(20, 0) }),
        ],
        { perPolygon: false },
      )
      expect(labels[0].bounds).toEqual([
        [0, 0],
        [30, 10],
      ])
    })

    it('anchors on the largest part, so the label lands on actual shape', () => {
      // A tiny outlier and a big field. The merged bounding box centre would
      // fall in the empty space between them; the label belongs on the field.
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', geometry: squareAt(0, 0, 2) }),
          source({ groupKey: 'A', geometry: squareAt(50, 0, 20) }),
        ],
        { perPolygon: false },
      )
      const [x] = labels[0].position
      expect(x).toBeGreaterThan(50)
      expect(x).toBeLessThan(70)
    })

    it('emits one label per group when there are several groups', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', text: 'North 40' }),
          source({
            groupKey: 'B',
            text: 'South 20',
            geometry: squareAt(20, 0),
          }),
        ],
        { perPolygon: false },
      )
      expect(labels.map((l) => l.key).sort()).toEqual(['A', 'B'])
    })
  })

  describe('one label per polygon', () => {
    it('emits a label for each feature in the group', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', geometry: squareAt(0, 0) }),
          source({ groupKey: 'A', geometry: squareAt(20, 0) }),
        ],
        { perPolygon: true },
      )
      expect(labels).toHaveLength(2)
      expect(labels.map((l) => l.text)).toEqual(['North 40', 'North 40'])
    })

    it('emits a label for each part of a MultiPolygon feature', () => {
      const twoIslands: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: [squareAt(0, 0).coordinates, squareAt(40, 0).coordinates],
      }
      const labels = buildFeatureLabels(
        [source({ groupKey: 'A', geometry: twoIslands })],
        { perPolygon: true },
      )
      expect(labels).toHaveLength(2)
      expect(labels[0].position[0]).toBeCloseTo(5, 1)
      expect(labels[1].position[0]).toBeCloseTo(45, 1)
    })

    it('bounds each label to its own polygon, not the group', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', geometry: squareAt(0, 0) }),
          source({ groupKey: 'A', geometry: squareAt(20, 0) }),
        ],
        { perPolygon: true },
      )
      expect(labels[0].bounds).toEqual([
        [0, 0],
        [10, 10],
      ])
    })

    it('gives each polygon a distinct, stable key', () => {
      const build = () =>
        buildFeatureLabels(
          [
            source({ groupKey: 'A', geometry: squareAt(0, 0) }),
            source({ groupKey: 'A', geometry: squareAt(20, 0) }),
          ],
          { perPolygon: true },
        ).map((l) => l.key)
      expect(new Set(build()).size).toBe(2)
      expect(build()).toEqual(build())
    })
  })

  describe('priority', () => {
    it('ranks a selected group above an unselected one', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', selected: false }),
          source({ groupKey: 'B', selected: true, geometry: squareAt(20, 0) }),
        ],
        { perPolygon: false },
      )
      const a = labels.find((l) => l.key === 'A')!
      const b = labels.find((l) => l.key === 'B')!
      expect(b.priority).toBeGreaterThan(a.priority)
    })

    it('ranks a larger group above a smaller one when neither is selected', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'small', geometry: squareAt(0, 0, 2) }),
          source({ groupKey: 'big', geometry: squareAt(20, 0, 20) }),
        ],
        { perPolygon: false },
      )
      const small = labels.find((l) => l.key === 'small')!
      const big = labels.find((l) => l.key === 'big')!
      expect(big.priority).toBeGreaterThan(small.priority)
    })

    it('ranks any selected group above every unselected one, however large', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'huge', geometry: squareAt(0, 0, 500) }),
          source({
            groupKey: 'tiny',
            selected: true,
            geometry: squareAt(1000, 0, 1),
          }),
        ],
        { perPolygon: false },
      )
      const huge = labels.find((l) => l.key === 'huge')!
      const tiny = labels.find((l) => l.key === 'tiny')!
      expect(tiny.priority).toBeGreaterThan(huge.priority)
    })
  })

  describe('features without a label', () => {
    it('emits nothing for a group whose text is empty', () => {
      expect(
        buildFeatureLabels([source({ groupKey: 'A', text: '' })], {
          perPolygon: false,
        }),
      ).toEqual([])
    })

    it('emits nothing for a group whose text is empty, per polygon too', () => {
      expect(
        buildFeatureLabels([source({ groupKey: 'A', text: '' })], {
          perPolygon: true,
        }),
      ).toEqual([])
    })

    it('still labels a group where only some features carry the text', () => {
      const labels = buildFeatureLabels(
        [
          source({ groupKey: 'A', text: '' }),
          source({
            groupKey: 'A',
            text: 'North 40',
            geometry: squareAt(20, 0),
          }),
        ],
        { perPolygon: false },
      )
      expect(labels).toHaveLength(1)
      expect(labels[0].text).toBe('North 40')
    })
  })

  it('builds nothing from no features', () => {
    expect(buildFeatureLabels([], { perPolygon: false })).toEqual([])
  })
})
