# Terra Draw Drawing-Library Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the deprecated `google.maps.drawing.DrawingManager` with Terra Draw for polygon input in the `seam-google-maps` wrapper, moving the correctness-critical geometry math into pure, unit-tested GeoJSON functions.

**Architecture:** Terra Draw captures polygon input and emits GeoJSON on `finish`. Pure `utils/geo-json` functions validate, decide cutout-vs-new, and merge rings. `GoogleMapsService` applies the result to `google.maps.Data` — mutating existing `Data.Feature` instances via `setGeometry` (never recreating them). A new Angular map-control button toggles drawing, replacing Google's removed built-in drawing toolbar. Everything downstream of drawing stays on the (non-deprecated) `google.maps.Data` layer.

**Tech Stack:** Angular (standalone: false NgModule), TypeScript, RxJS, Jest (`jest-preset-angular`), `terra-draw` + `terra-draw-google-maps-adapter`, `@turf/*` (granular v7), `geojson` types.

## Global Constraints

- **Public API contract — do not break.** `TheSeamGoogleMapsComponent`: `zoom`, `latitude`, `longitude`, `value`, `editingEnabled`, `fitBounds`, `getGeoJson`. `GoogleMapsService`: `setFeatureHoveredStyleOverride`, `googleMap`.
- **Feature-instance identity.** Never round-trip an existing `google.maps.Data.Feature` to GeoJSON and back into a new instance. Apply geometry changes to existing instances via `setGeometry`. Only genuinely new (just-drawn) polygons may be constructed as new `Data.Feature`s.
- **Test strategy — pure logic only.** Add Jest specs for pure GeoJSON functions (auto-run via the existing `**/utils/**/*.spec.ts` match). Do NOT add `google.maps.*`-mocking service specs; the `google-maps` folder stays out of `testMatch`. Service/component/control changes are verified via the manual checklist in the final task.
- **No new turf dependency.** Winding is handled by a local pure helper, not `@turf/rewind`.
- **Branch:** `marklb/replace-google-draw-lib` (already checked out).
- **Test command:** `npx jest <path-to-spec>` for a single file.
- **Commit style:** Conventional Commits; end body with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## File Structure

**Pure GeoJSON utilities** (`projects/ui-common/utils/geo-json/`):
- Create `polygon-violates-min-max.ts` — extracted point-count predicate (shared with validator).
- Create `polygon-has-min-distinct-vertices.ts` — drawing-side min-vertex check (distinct vertices).
- Create `polygon-contains.ts` — turf containment predicate on GeoJSON.
- Create `add-hole-to-polygon.ts` — cutout merge with opposite-winding hole ring (+ ring orientation helpers).
- Modify `close-polygons.ts` — idempotency + bare `Polygon`/`MultiPolygon` handling.
- Modify `min-max-points.validator.ts` — import the extracted predicate.
- Modify `projects/ui-common/utils/public-api.ts` — export the new modules.
- Specs alongside each new file, plus a new `close-polygons.spec.ts`; relocate point-count cases out of `min-max-points.validator.spec.ts`.

**Google Maps integration** (`projects/ui-common/google-maps/`):
- Modify `google-maps.service.ts` — Terra Draw lifecycle + `finish` flow + drawing state.
- Modify `google-maps-feature-helpers.ts` — add `dataPolygonFromGeoJson`, `geoJsonPolygonFromDataFeature`; retire `createDataFeatureFromPolygon`, `addInnerFeatureCutoutToExteriorFeature`, `featureContains`, `fixPathDifferentStartingAndEndingPoint`.
- Create `google-maps-draw-button-control/google-maps-draw-button-control.component.{ts,html,scss}`.
- Modify `google-maps.module.ts` — declare the new control component.
- Modify `google-maps/google-maps.component.ts` + `.html` — register the draw control, gate on `editingEnabled`.
- Modify `google-maps.stories.ts` — drop `'drawing'` from requested libraries.
- Add `terra-draw`, `terra-draw-google-maps-adapter` to `package.json`.

---

## Task 1: Extract `polygonViolatesMinMax` predicate

**Files:**
- Create: `projects/ui-common/utils/geo-json/polygon-violates-min-max.ts`
- Create: `projects/ui-common/utils/geo-json/polygon-violates-min-max.spec.ts`
- Modify: `projects/ui-common/utils/geo-json/min-max-points.validator.ts`
- Modify: `projects/ui-common/utils/geo-json/min-max-points.validator.spec.ts`

**Interfaces:**
- Produces: `polygonViolatesMinMax(coordinateLength: number, min: number, max?: number | undefined): boolean`

- [ ] **Step 1: Write the failing test**

Create `polygon-violates-min-max.spec.ts`:

```ts
import { polygonViolatesMinMax } from './polygon-violates-min-max'

describe('polygonViolatesMinMax', () => {
  it('returns true when length is below min', () => {
    expect(polygonViolatesMinMax(2, 3)).toBe(true)
  })

  it('returns false when length equals min', () => {
    expect(polygonViolatesMinMax(3, 3)).toBe(false)
  })

  it('returns false when length is above min and no max', () => {
    expect(polygonViolatesMinMax(10, 3)).toBe(false)
  })

  it('returns true when length exceeds max (and max > min)', () => {
    expect(polygonViolatesMinMax(11, 3, 10)).toBe(true)
  })

  it('ignores max when max is not greater than min', () => {
    expect(polygonViolatesMinMax(100, 3, 3)).toBe(false)
  })

  it('returns false when length is within [min, max]', () => {
    expect(polygonViolatesMinMax(5, 3, 10)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-violates-min-max.spec.ts`
Expected: FAIL — cannot find module `./polygon-violates-min-max`.

- [ ] **Step 3: Write minimal implementation**

Create `polygon-violates-min-max.ts` (logic copied verbatim from the current private function in `min-max-points.validator.ts`):

```ts
import { notNullOrUndefined } from '../not-null-or-undefined'

/**
 * Checks if a single polygon ring's coordinate count violates the given
 * min/max point bounds. `max` is only applied when it is greater than `min`.
 */
export function polygonViolatesMinMax(
  coordinateLength: number,
  min: number,
  max?: number | undefined,
): boolean {
  if (
    coordinateLength < min ||
    (notNullOrUndefined(max) && max > min && coordinateLength > max)
  ) {
    return true
  }

  return false
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-violates-min-max.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Update the validator to import the extracted predicate**

In `min-max-points.validator.ts`: add `import { polygonViolatesMinMax } from './polygon-violates-min-max'` and DELETE the local `polygonViolatesMinMax` function (lines 68-81). Keep `collectionViolatesMinMax` as-is (it now calls the imported predicate). Leave the rest of the file unchanged.

- [ ] **Step 6: Relocate redundant point-count tests**

In `min-max-points.validator.spec.ts`, remove any test cases that assert the raw number-boundary behavior now covered by `polygon-violates-min-max.spec.ts` (pure length-in/length-out cases). Keep tests that exercise the validator itself: empty-value passthrough, `coerceFeatureCollection` handling, the returned error object shape (`{ 'min-max-points': { reason } }`), and Polygon/MultiPolygon feature-collection traversal. If, after removal, a behavior is no longer covered anywhere, keep it in the validator spec.

- [ ] **Step 7: Run both specs**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-violates-min-max.spec.ts projects/ui-common/utils/geo-json/min-max-points.validator.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/utils/geo-json/polygon-violates-min-max.ts projects/ui-common/utils/geo-json/polygon-violates-min-max.spec.ts projects/ui-common/utils/geo-json/min-max-points.validator.ts projects/ui-common/utils/geo-json/min-max-points.validator.spec.ts
git commit -m "refactor(geo-json): extract polygonViolatesMinMax predicate"
```

---

## Task 2: Add `polygonHasMinDistinctVertices` (drawing-side min-vertex check)

Terra Draw emits **closed** rings (first coord repeated at the end), whereas the old `polygonHasValidPathsLengths` counted unclosed Google paths. This helper counts *distinct* vertices so the "≥ 3 points" rule matches the old behavior regardless of ring closure.

**Files:**
- Create: `projects/ui-common/utils/geo-json/polygon-has-min-distinct-vertices.ts`
- Create: `projects/ui-common/utils/geo-json/polygon-has-min-distinct-vertices.spec.ts`

**Interfaces:**
- Consumes: `polygonViolatesMinMax` (Task 1).
- Produces: `polygonHasMinDistinctVertices(polygon: Polygon, min?: number): boolean` (default `min = 3`).

- [ ] **Step 1: Write the failing test**

Create `polygon-has-min-distinct-vertices.spec.ts`:

```ts
import { Polygon } from 'geojson'

import { polygonHasMinDistinctVertices } from './polygon-has-min-distinct-vertices'

function polygon(outer: number[][]): Polygon {
  return { type: 'Polygon', coordinates: [outer] }
}

describe('polygonHasMinDistinctVertices', () => {
  it('accepts a closed triangle (3 distinct vertices)', () => {
    const tri = polygon([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
    expect(polygonHasMinDistinctVertices(tri)).toBe(true)
  })

  it('accepts an unclosed triangle (3 distinct vertices)', () => {
    const tri = polygon([
      [0, 0],
      [0, 1],
      [1, 0],
    ])
    expect(polygonHasMinDistinctVertices(tri)).toBe(true)
  })

  it('rejects a closed ring with only 2 distinct vertices', () => {
    const degenerate = polygon([
      [0, 0],
      [0, 1],
      [0, 0],
    ])
    expect(polygonHasMinDistinctVertices(degenerate)).toBe(false)
  })

  it('rejects an empty polygon', () => {
    expect(polygonHasMinDistinctVertices({ type: 'Polygon', coordinates: [] })).toBe(
      false,
    )
  })

  it('honors a custom minimum', () => {
    const square = polygon([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ])
    expect(polygonHasMinDistinctVertices(square, 5)).toBe(false)
    expect(polygonHasMinDistinctVertices(square, 4)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-has-min-distinct-vertices.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write minimal implementation**

Create `polygon-has-min-distinct-vertices.ts`:

```ts
import { Polygon, Position } from 'geojson'

import { polygonViolatesMinMax } from './polygon-violates-min-max'

/** Count distinct vertices in a ring, ignoring an explicit closing point. */
function distinctVertexCount(ring: Position[]): number {
  if (ring.length === 0) {
    return 0
  }
  const first = ring[0]
  const last = ring[ring.length - 1]
  const isClosed =
    ring.length > 1 && first[0] === last[0] && first[1] === last[1]
  return isClosed ? ring.length - 1 : ring.length
}

/**
 * Whether a polygon's outer ring has at least `min` distinct vertices.
 * Ring closure (a repeated first/last point) does not count toward the total,
 * so this behaves the same for closed and unclosed rings.
 */
export function polygonHasMinDistinctVertices(
  polygon: Polygon,
  min: number = 3,
): boolean {
  const outer = polygon.coordinates[0] ?? []
  return !polygonViolatesMinMax(distinctVertexCount(outer), min, undefined)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-has-min-distinct-vertices.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/geo-json/polygon-has-min-distinct-vertices.ts projects/ui-common/utils/geo-json/polygon-has-min-distinct-vertices.spec.ts
git commit -m "feat(geo-json): add polygonHasMinDistinctVertices"
```

---

## Task 3: Fix `closePolygons` idempotency and bare-geometry handling

**Files:**
- Modify: `projects/ui-common/utils/geo-json/close-polygons.ts`
- Create: `projects/ui-common/utils/geo-json/close-polygons.spec.ts`

**Interfaces:**
- Produces (unchanged signature): `closePolygons(geoJson: FeatureCollection | Feature | Polygon | MultiPolygon): void` — now idempotent and handling bare `Polygon`/`MultiPolygon`.

- [ ] **Step 1: Write the failing test**

Create `close-polygons.spec.ts`:

```ts
import { Feature, MultiPolygon, Polygon } from 'geojson'

import { closePolygons } from './close-polygons'

describe('closePolygons', () => {
  it('closes an open Polygon ring', () => {
    const geo: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 0],
        ],
      ],
    }
    closePolygons(geo)
    expect(geo.coordinates[0]).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('does not double-close an already-closed ring (idempotent)', () => {
    const geo: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      ],
    }
    closePolygons(geo)
    closePolygons(geo)
    expect(geo.coordinates[0]).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('closes a bare MultiPolygon', () => {
    const geo: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [0, 1],
            [1, 0],
          ],
        ],
      ],
    }
    closePolygons(geo)
    expect(geo.coordinates[0][0]).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('closes polygons inside a Feature', () => {
    const feature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 0],
          ],
        ],
      },
    }
    closePolygons(feature)
    expect((feature.geometry as Polygon).coordinates[0]).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/utils/geo-json/close-polygons.spec.ts`
Expected: FAIL — the idempotency test (double-close) and the bare-MultiPolygon test fail against the current implementation.

- [ ] **Step 3: Write the implementation**

Replace the full contents of `close-polygons.ts`:

```ts
import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'

/**
 * Close all polygons in the GeoJSON so the first and last position of every
 * ring are identical.
 *
 * Google Maps requires closed polygon rings, but not all libraries produce
 * them. This is idempotent: rings that are already closed are left unchanged.
 */
export function closePolygons(
  geoJson: FeatureCollection | Feature | Polygon | MultiPolygon,
): void {
  if (geoJson.type === 'FeatureCollection') {
    for (const f of geoJson.features) {
      closePolygonsFeature(f)
    }
  } else if (geoJson.type === 'Feature') {
    closePolygonsFeature(geoJson)
  } else if (geoJson.type === 'Polygon') {
    closePolygon(geoJson)
  } else if (geoJson.type === 'MultiPolygon') {
    closeMultiPolygon(geoJson)
  }
}

function closePolygonsFeature(feature: Feature): void {
  if (feature.geometry.type === 'Polygon') {
    closePolygon(feature.geometry)
  } else if (feature.geometry.type === 'MultiPolygon') {
    closeMultiPolygon(feature.geometry)
  }
}

function closePolygon(polygon: Polygon): void {
  for (const ring of polygon.coordinates) {
    closeRing(ring)
  }
}

function closeMultiPolygon(multiPolygon: MultiPolygon): void {
  for (const polygon of multiPolygon.coordinates) {
    for (const ring of polygon) {
      closeRing(ring)
    }
  }
}

/**
 * Appends the first position to the end of a ring only when it is not already
 * closed. Exact equality is correct here: the closing point is a copy of the
 * first point, so we compare a value against its own copy.
 */
function closeRing(ring: Position[]): void {
  if (ring.length < 1) {
    return
  }
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return
  }
  ring.push([...first])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest projects/ui-common/utils/geo-json/close-polygons.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/geo-json/close-polygons.ts projects/ui-common/utils/geo-json/close-polygons.spec.ts
git commit -m "fix(geo-json): make closePolygons idempotent and handle bare geometries"
```

---

## Task 4: Add `polygonContains` predicate

**Files:**
- Create: `projects/ui-common/utils/geo-json/polygon-contains.ts`
- Create: `projects/ui-common/utils/geo-json/polygon-contains.spec.ts`

**Interfaces:**
- Produces: `polygonContains(outer: Polygon, inner: Polygon): boolean`

- [ ] **Step 1: Write the failing test**

Create `polygon-contains.spec.ts`:

```ts
import { Polygon } from 'geojson'

import { polygonContains } from './polygon-contains'

const outer: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ],
  ],
}

describe('polygonContains', () => {
  it('returns true when inner is fully inside outer', () => {
    const inner: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [2, 4],
          [4, 4],
          [4, 2],
          [2, 2],
        ],
      ],
    }
    expect(polygonContains(outer, inner)).toBe(true)
  })

  it('returns false when inner is outside outer', () => {
    const inner: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [20, 20],
          [20, 22],
          [22, 22],
          [22, 20],
          [20, 20],
        ],
      ],
    }
    expect(polygonContains(outer, inner)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-contains.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write minimal implementation**

Create `polygon-contains.ts` (turf `booleanContains` is already a dependency and already used in the codebase):

```ts
import { Polygon } from 'geojson'

import booleanContains from '@turf/boolean-contains'
import { polygon as turfPolygon } from '@turf/helpers'

/**
 * Whether `outer` fully contains `inner`, using turf's boolean-contains on the
 * GeoJSON geometries directly (no Google Maps dependency).
 */
export function polygonContains(outer: Polygon, inner: Polygon): boolean {
  return booleanContains(
    turfPolygon(outer.coordinates),
    turfPolygon(inner.coordinates),
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest projects/ui-common/utils/geo-json/polygon-contains.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/geo-json/polygon-contains.ts projects/ui-common/utils/geo-json/polygon-contains.spec.ts
git commit -m "feat(geo-json): add polygonContains predicate"
```

---

## Task 5: Add `addHoleToPolygon` with opposite-winding hole ring

This replaces the geometry math in the old `addInnerFeatureCutoutToExteriorFeature`. It appends the hole's outer ring to the exterior polygon as an interior ring, wound **opposite** the exterior ring (the spec's winding upgrade), implemented with a pure shoelace orientation helper — no `@turf/rewind` dependency.

**Files:**
- Create: `projects/ui-common/utils/geo-json/add-hole-to-polygon.ts`
- Create: `projects/ui-common/utils/geo-json/add-hole-to-polygon.spec.ts`

**Interfaces:**
- Produces:
  - `ringIsClockwise(ring: Position[]): boolean`
  - `addHoleToPolygon(exterior: Polygon, hole: Polygon): Polygon`

- [ ] **Step 1: Write the failing test**

Create `add-hole-to-polygon.spec.ts`:

```ts
import { Polygon, Position } from 'geojson'

import { addHoleToPolygon, ringIsClockwise } from './add-hole-to-polygon'

// Counter-clockwise exterior square (0,0)->(10,0)->(10,10)->(0,10).
const exterior: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  ],
}

describe('ringIsClockwise', () => {
  it('detects a clockwise ring', () => {
    const cw: Position[] = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ]
    expect(ringIsClockwise(cw)).toBe(true)
  })

  it('detects a counter-clockwise ring', () => {
    expect(ringIsClockwise(exterior.coordinates[0])).toBe(false)
  })
})

describe('addHoleToPolygon', () => {
  it('appends the hole as a second ring', () => {
    const hole: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [2, 4],
          [4, 4],
          [4, 2],
          [2, 2],
        ],
      ],
    }
    const result = addHoleToPolygon(exterior, hole)
    expect(result.coordinates).toHaveLength(2)
    expect(result.coordinates[0]).toEqual(exterior.coordinates[0])
  })

  it('winds the hole ring opposite the exterior ring', () => {
    // Hole drawn with the SAME (CCW) winding as the exterior.
    const holeSameWinding: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [4, 2],
          [4, 4],
          [2, 4],
          [2, 2],
        ],
      ],
    }
    expect(ringIsClockwise(exterior.coordinates[0])).toBe(false)
    expect(ringIsClockwise(holeSameWinding.coordinates[0])).toBe(false)

    const result = addHoleToPolygon(exterior, holeSameWinding)
    // The appended hole ring must be reversed to the opposite winding.
    expect(ringIsClockwise(result.coordinates[1])).toBe(true)
  })

  it('leaves an already-opposite hole ring unchanged', () => {
    const holeOpposite: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [2, 4],
          [4, 4],
          [4, 2],
          [2, 2],
        ],
      ],
    }
    expect(ringIsClockwise(holeOpposite.coordinates[0])).toBe(true)
    const result = addHoleToPolygon(exterior, holeOpposite)
    expect(result.coordinates[1]).toEqual(holeOpposite.coordinates[0])
  })

  it('does not mutate the input exterior polygon', () => {
    const hole: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [2, 4],
          [4, 4],
          [4, 2],
          [2, 2],
        ],
      ],
    }
    addHoleToPolygon(exterior, hole)
    expect(exterior.coordinates).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/utils/geo-json/add-hole-to-polygon.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write minimal implementation**

Create `add-hole-to-polygon.ts`:

```ts
import { Polygon, Position } from 'geojson'

/**
 * Whether a ring is wound clockwise, via the shoelace signed-area sign.
 * Sum of (x2 - x1) * (y2 + y1) is positive for clockwise rings in standard
 * (x = lng, y = lat) orientation.
 */
export function ringIsClockwise(ring: Position[]): boolean {
  let sum = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    sum += (x2 - x1) * (y2 + y1)
  }
  return sum > 0
}

/** Return `ring` wound opposite to `reference`, reversing a copy if needed. */
function ringWoundOpposite(reference: Position[], ring: Position[]): Position[] {
  if (ringIsClockwise(reference) === ringIsClockwise(ring)) {
    return [...ring].reverse()
  }
  return [...ring]
}

/**
 * Append the outer ring of `hole` to `exterior` as an interior ring (a
 * cutout), wound opposite the exterior ring so it renders as a hole. Returns a
 * new Polygon; inputs are not mutated.
 */
export function addHoleToPolygon(exterior: Polygon, hole: Polygon): Polygon {
  const exteriorRing = exterior.coordinates[0]
  const holeRing = ringWoundOpposite(exteriorRing, hole.coordinates[0])
  return {
    type: 'Polygon',
    coordinates: [...exterior.coordinates, holeRing],
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest projects/ui-common/utils/geo-json/add-hole-to-polygon.spec.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/geo-json/add-hole-to-polygon.ts projects/ui-common/utils/geo-json/add-hole-to-polygon.spec.ts
git commit -m "feat(geo-json): add addHoleToPolygon with opposite-winding hole ring"
```

---

## Task 6: Export new utilities from the barrel

**Files:**
- Modify: `projects/ui-common/utils/public-api.ts`

- [ ] **Step 1: Add exports**

After the existing `./geo-json/close-polygons` export (line 30), add:

```ts
export * from './geo-json/polygon-violates-min-max'
export * from './geo-json/polygon-has-min-distinct-vertices'
export * from './geo-json/polygon-contains'
export * from './geo-json/add-hole-to-polygon'
```

- [ ] **Step 2: Verify the library type-checks**

Run: `npx tsc -p projects/ui-common/tsconfig.spec.json --noEmit`
Expected: no errors referencing the new modules. (If the project has a lib build script such as `npx ng build ui-common`, running it is an acceptable alternative check.)

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/utils/public-api.ts
git commit -m "feat(geo-json): export new polygon utilities"
```

---

## Task 7: Add Terra Draw and wire its lifecycle into `GoogleMapsService`

Replaces the `DrawingManager` field, init, `isDrawing`, `stopDrawing`, and the `setEditingEnabled` drawing branch. The `finish` flow is Task 8. No unit tests (per test strategy); verified in Task 10.

**Files:**
- Modify: `package.json`
- Modify: `projects/ui-common/google-maps/google-maps.service.ts`

**Interfaces:**
- Produces (internal, consumed by Tasks 8-9):
  - `GoogleMapsService.isDrawing(): boolean`
  - `GoogleMapsService.startDrawing(): void`
  - `GoogleMapsService.stopDrawing(): void`
  - `GoogleMapsService.drawing$: Observable<boolean>` — emits `true` while polygon mode is active, `false` otherwise.

- [ ] **Step 1: Install Terra Draw**

Run:

```bash
npm install terra-draw terra-draw-google-maps-adapter
```

Expected: both packages added to `package.json` dependencies; `package-lock.json` updated.

- [ ] **Step 2: Add imports and drawing-state members to the service**

In `google-maps.service.ts`, add imports at the top (with the other imports):

```ts
import { TerraDraw, TerraDrawPolygonMode } from 'terra-draw'
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter'
```

Replace the `_drawingManager` field declaration:

```ts
  private _drawingManager?: google.maps.drawing.DrawingManager
```

with:

```ts
  private _terraDraw?: TerraDraw
  private _terraDrawReady = false
  private readonly _drawingSubject = new BehaviorSubject<boolean>(false)
  public readonly drawing$ = this._drawingSubject.asObservable()
```

Delete the now-unused `DEFAULT_DRAWING_MANAGER_OPTIONS` constant (lines 40-49) and the `DEFAULT_POLYGON_OPTIONS` constant (lines 32-38) — Terra Draw manages its own overlay styling.

- [ ] **Step 3: Replace `_initDrawingManager` with Terra Draw init**

Replace the entire `_initDrawingManager()` method with:

```ts
  private _initTerraDraw(): void {
    if (notNullOrUndefined(this._terraDraw)) {
      throw Error(`Terra Draw is already initialized.`)
    }
    this._assertInitialized()

    // The Google Maps adapter attaches an OverlayView to the map's DOM element,
    // which must have an id.
    const div = this.googleMap.getDiv() as HTMLElement
    if (!div.id) {
      div.id = `seam-google-map-${Math.floor(performance.now())}`
    }

    const draw = new TerraDraw({
      adapter: new TerraDrawGoogleMapsAdapter({
        lib: google.maps,
        map: this.googleMap,
      }),
      modes: [new TerraDrawPolygonMode()],
    })

    draw.on('ready', () => {
      this._terraDrawReady = true
      // Start in the resting (non-drawing) mode.
      draw.setMode('static')
    })

    draw.on('finish', (id, context) => {
      if (context.action !== 'draw') {
        return
      }
      this._ngZone.run(() => this._onDrawFinished(id))
    })

    draw.start()
    this._terraDraw = draw
  }
```

> NOTE: `_onDrawFinished` is added in Task 8. Until then this method will not compile if you build; that is expected — Tasks 7 and 8 are committed together conceptually but split for review. If executing strictly task-by-task, add a temporary stub `private _onDrawFinished(_id: string): void {}` at the end of Step 3 and replace it in Task 8.

- [ ] **Step 4: Rename the init call**

In `setMap` (line 151), change `this._initDrawingManager()` to `this._initTerraDraw()`.

- [ ] **Step 5: Replace `isDrawing`, `startDrawing`, `stopDrawing`**

Replace the `stopDrawing()` method (lines 224-265) and `isDrawing()` method (lines 529-535) with:

```ts
  /** Whether polygon drawing mode is currently active. */
  public isDrawing(): boolean {
    return this._terraDraw?.getMode() === 'polygon'
  }

  /** Enter polygon drawing mode. */
  public startDrawing(): void {
    if (!this._terraDraw || !this._terraDrawReady || !this.isEditingEnabled()) {
      return
    }
    this._terraDraw.setMode('polygon')
    this._drawingSubject.next(true)
  }

  /**
   * Cancel any in-progress drawing and leave drawing mode. Switching to the
   * `static` mode clears an unfinished polygon.
   */
  public stopDrawing(): void {
    if (!this._terraDraw || !this._terraDrawReady) {
      return
    }
    this._terraDraw.setMode('static')
    this._drawingSubject.next(false)
  }
```

- [ ] **Step 6: Update the `setEditingEnabled` drawing branch**

Replace the body of `setEditingEnabled` (lines 170-192) with:

```ts
  public setEditingEnabled(enabled: boolean): void {
    this._editingEnabledSubject.next(enabled)

    if (this.mapReady) {
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      if (!enabled) {
        this.stopDrawing()
        this.googleMap.data.forEach((f) => {
          if (isFeatureSelected(f)) {
            setFeatureSelected(f, false)
          }
        })
      }
    }
  }
```

(Data-layer editing of existing features is still driven by the per-feature `editable` style options in `_initFeatureStyling`; nothing else is needed here.)

- [ ] **Step 7: Tear down Terra Draw on destroy**

In `ngOnDestroy` (lines 143-146), add before the `_ngUnsubscribe` calls:

```ts
    if (this._terraDraw?.enabled) {
      this._terraDraw.stop()
    }
    this._terraDraw = undefined
    this._drawingSubject.complete()
```

- [ ] **Step 8: Manual smoke check (build/type-check only for this task)**

Run: `npx tsc -p projects/ui-common/tsconfig.spec.json --noEmit`
Expected: compiles (with the Task 8 stub in place if executing strictly task-by-task). Full drawing behavior is verified in Task 10.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json projects/ui-common/google-maps/google-maps.service.ts
git commit -m "feat(google-maps): add Terra Draw and wire drawing lifecycle"
```

---

## Task 8: Replace the `polygoncomplete` flow with the GeoJSON `finish` flow

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps.service.ts`
- Modify: `projects/ui-common/google-maps/google-maps-feature-helpers.ts`

**Interfaces:**
- Consumes: `polygonHasMinDistinctVertices`, `polygonContains`, `addHoleToPolygon`, `closePolygons` (from `@theseam/ui-common/utils`); `isFeatureSelected`, `setFeatureSelected`, `polygonCoordinates` (feature-helpers).
- Produces (feature-helpers):
  - `dataPolygonFromGeoJson(polygon: Polygon): google.maps.Data.Polygon`
  - `geoJsonPolygonFromDataFeature(feature: google.maps.Data.Feature): Polygon | undefined`

- [ ] **Step 1: Add the two glue helpers to feature-helpers**

In `google-maps-feature-helpers.ts`, add imports:

```ts
import { Polygon } from 'geojson'
import { closePolygons } from '@theseam/ui-common/utils'
```

Add:

```ts
/** Build a google.maps.Data.Polygon from a GeoJSON Polygon (lng/lat order). */
export function dataPolygonFromGeoJson(
  polygon: Polygon,
): google.maps.Data.Polygon {
  const rings = polygon.coordinates.map((ring) =>
    ring.map(([lng, lat]) => ({ lat, lng }) as google.maps.LatLngLiteral),
  )
  return new google.maps.Data.Polygon(rings)
}

/**
 * Read an existing feature's Polygon geometry as a closed GeoJSON Polygon.
 * Returns undefined for non-Polygon geometries. Does not mutate the feature.
 */
export function geoJsonPolygonFromDataFeature(
  feature: google.maps.Data.Feature,
): Polygon | undefined {
  const geometry = feature.getGeometry()
  if (geometry === null || geometry.getType() !== 'Polygon') {
    return undefined
  }
  const polygon: Polygon = {
    type: 'Polygon',
    coordinates: polygonCoordinates(geometry as google.maps.Data.Polygon),
  }
  closePolygons(polygon)
  return polygon
}
```

- [ ] **Step 2: Retire the replaced helpers**

In `google-maps-feature-helpers.ts`, delete these now-unused functions:
- `addInnerFeatureCutoutToExteriorFeature` (lines 117-147) — replaced by `addHoleToPolygon` + `setGeometry`.
- `createDataFeatureFromPolygon` (lines 231-241) — replaced by `dataPolygonFromGeoJson`.
- `featureContains` (lines 222-229) and `toTurfJsFeature` (208-220), `toTurfJsPolygon` (198-200), `toTurfJsMultiPolygon` (202-206) IF they have no other importers.
- `fixPathDifferentStartingAndEndingPoint` (lines 153-167) — replaced by `closePolygons` (still called inside `polygonCoordinates`; see Step 3).

Before deleting each, confirm no remaining importers:

Run: `npx grep -rn "addInnerFeatureCutoutToExteriorFeature\|createDataFeatureFromPolygon\|featureContains\|toTurfJsFeature\|fixPathDifferentStartingAndEndingPoint\|getPossibleExteriorFeature" projects` — (use the Grep tool). Keep any function that still has an importer outside this file; if `getPossibleExteriorFeature` is only used by the service, it is replaced in Step 4 and can be removed too.

- [ ] **Step 3: Keep `polygonCoordinates` ring-closing working**

`polygonCoordinates` currently calls `fixPathDifferentStartingAndEndingPoint(coords)` per ring. Replace that call so the ring is closed via the shared util. Change:

```ts
export function polygonCoordinates(
  polygon: google.maps.Data.Polygon,
): number[][][] {
  return polygon.getArray().map((linRing) => {
    const coords = linRing.getArray().map((x) => [x.lng(), x.lat()])
    fixPathDifferentStartingAndEndingPoint(coords)
    return coords
  })
}
```

to:

```ts
export function polygonCoordinates(
  polygon: google.maps.Data.Polygon,
): number[][][] {
  const polygonGeoJson: Polygon = {
    type: 'Polygon',
    coordinates: polygon
      .getArray()
      .map((linRing) => linRing.getArray().map((x) => [x.lng(), x.lat()])),
  }
  closePolygons(polygonGeoJson)
  return polygonGeoJson.coordinates
}
```

- [ ] **Step 4: Replace the finish handler in the service**

In `google-maps.service.ts`, add imports:

```ts
import { Polygon } from 'geojson'
import {
  addHoleToPolygon,
  polygonContains,
  polygonHasMinDistinctVertices,
} from '@theseam/ui-common/utils'
```

Add to the feature-helpers import block:

```ts
  dataPolygonFromGeoJson,
  geoJsonPolygonFromDataFeature,
```

In `_initFeatureChangeListeners`, DELETE the entire `if (notNullOrUndefined(this._drawingManager)) { ... 'polygoncomplete' ... }` block (lines 474-526). The feature-change observable and the `contextmenu` listener above it stay.

Replace the Task 7 `_onDrawFinished` stub with the real implementation:

```ts
  private _onDrawFinished(id: string): void {
    const feature = this._terraDraw?.getSnapshotFeature(id)
    this._terraDraw?.removeFeatures([id])
    this.stopDrawing()

    if (!feature || feature.geometry.type !== 'Polygon') {
      return
    }
    const drawn = feature.geometry as Polygon
    if (!polygonHasMinDistinctVertices(drawn, 3)) {
      return
    }

    this._assertInitialized()

    const exteriorFeature = this._allowDrawingHoleInPolygon
      ? this._getPossibleExteriorFeature(drawn)
      : undefined

    if (exteriorFeature) {
      const exteriorPolygon = geoJsonPolygonFromDataFeature(exteriorFeature)
      if (exteriorPolygon) {
        const merged = addHoleToPolygon(exteriorPolygon, drawn)
        // Mutate the EXISTING feature instance to preserve its identity and
        // properties (see design constraints).
        exteriorFeature.setGeometry(dataPolygonFromGeoJson(merged))
        setFeatureSelected(exteriorFeature, true)
        return
      }
    }

    const newFeature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(drawn),
    })
    this.googleMap.data.add(newFeature)
    setFeatureSelected(newFeature, true)
  }

  /**
   * Find an existing Polygon feature that fully contains the drawn polygon, so
   * the drawing can be applied as a cutout. Returns the existing feature
   * instance (never a copy).
   */
  private _getPossibleExteriorFeature(
    drawn: Polygon,
  ): google.maps.Data.Feature | undefined {
    this._assertInitialized()
    let match: google.maps.Data.Feature | undefined
    this.googleMap.data.forEach((f) => {
      if (match) {
        return
      }
      const candidate = geoJsonPolygonFromDataFeature(f)
      if (candidate && polygonContains(candidate, drawn)) {
        match = f
      }
    })
    return match
  }
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -p projects/ui-common/tsconfig.spec.json --noEmit`
Expected: compiles with no unresolved references.

- [ ] **Step 6: Run the full geo-json spec suite (ensure no util regressions)**

Run: `npx jest projects/ui-common/utils/geo-json`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/google-maps-feature-helpers.ts
git commit -m "feat(google-maps): draw polygons via Terra Draw GeoJSON finish flow"
```

---

## Task 9: Add the draw-toggle map control and register it

**Files:**
- Create: `projects/ui-common/google-maps/google-maps-draw-button-control/google-maps-draw-button-control.component.ts`
- Create: `projects/ui-common/google-maps/google-maps-draw-button-control/google-maps-draw-button-control.component.html`
- Create: `projects/ui-common/google-maps/google-maps-draw-button-control/google-maps-draw-button-control.component.scss`
- Modify: `projects/ui-common/google-maps/google-maps.module.ts`
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.ts`
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.html`

**Interfaces:**
- Consumes: `GoogleMapsService.drawing$`, `isDrawing()`, `startDrawing()`, `stopDrawing()` (Task 7); `MAP_CONTROL_DATA`, `MapControl` (existing).

- [ ] **Step 1: Create the control component**

Create `google-maps-draw-button-control.component.ts` (mirrors the recenter control's pattern — attribute selector, `MAP_CONTROL_DATA` injection, OnPush):

```ts
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core'
import { Subject, takeUntil } from 'rxjs'

import { SeamIcon } from '@theseam/ui-common/icon'

import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROL_DATA } from '../map-controls-service'

export interface GoogleMapsDrawButtonControlData {
  label?: string | undefined | null
  icon?: SeamIcon | undefined | null
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seam-google-maps-draw-button-control]',
  templateUrl: './google-maps-draw-button-control.component.html',
  styleUrls: ['./google-maps-draw-button-control.component.scss'],
  host: {
    '[attr.draggable]': 'false',
    '[attr.aria-label]': 'label',
    '[attr.title]': 'label',
    '[attr.aria-pressed]': '_active',
    '[class.active]': '_active',
    type: 'button',
    class: 'gmnoprint gm-control-active',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TheSeamGoogleMapsDrawButtonControlComponent
  implements OnInit, OnDestroy
{
  private readonly _ngUnsubscribe = new Subject<void>()

  _active = false

  @Input() label: string | undefined | null = 'Draw Field'

  @Input() icon: SeamIcon | undefined | null

  @HostListener('click')
  _onClick() {
    if (this._googleMaps.isDrawing()) {
      this._googleMaps.stopDrawing()
    } else {
      this._googleMaps.startDrawing()
    }
  }

  constructor(
    private readonly _googleMaps: GoogleMapsService,
    private readonly _cdr: ChangeDetectorRef,
    @Optional()
    @Inject(MAP_CONTROL_DATA)
    _data?: GoogleMapsDrawButtonControlData,
  ) {
    if (_data) {
      if (Object.prototype.hasOwnProperty.call(_data, 'label')) {
        this.label = _data.label
      }
      if (Object.prototype.hasOwnProperty.call(_data, 'icon')) {
        this.icon = _data.icon
      }
    }
  }

  ngOnInit() {
    this._googleMaps.drawing$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((drawing) => {
        this._active = drawing
        this._cdr.markForCheck()
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }
}
```

- [ ] **Step 2: Create the template**

Create `google-maps-draw-button-control.component.html`:

```html
<seam-icon [icon]="icon" iconType="image-fill"></seam-icon>
```

- [ ] **Step 3: Create the (empty) styles**

Create `google-maps-draw-button-control.component.scss`:

```scss
:host.active {
  background-color: #e6e6e6;
}
```

- [ ] **Step 4: Declare the component in the module**

In `google-maps.module.ts`, add the import:

```ts
import { TheSeamGoogleMapsDrawButtonControlComponent } from './google-maps-draw-button-control/google-maps-draw-button-control.component'
```

Add `TheSeamGoogleMapsDrawButtonControlComponent` to the `declarations` array.

- [ ] **Step 5: Register the control in the map component**

In `google-maps/google-maps.component.ts`, add the import:

```ts
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons'
```

Add a control def property alongside `_reCenterControlDef` (after line 121):

```ts
  readonly _drawControlDef: MapControl = {
    component: TheSeamGoogleMapsDrawButtonControlComponent,
    data: { label: 'Draw Field', icon: faDrawPolygon },
    position: 2 /* google.maps.ControlPosition.TOP_CENTER */,
  }
```

Add the import for the component:

```ts
import { TheSeamGoogleMapsDrawButtonControlComponent } from '../google-maps-draw-button-control/google-maps-draw-button-control.component'
```

- [ ] **Step 6: Render the control, gated on editing**

In `google-maps/google-maps.component.html`, after the recenter control block (lines 27-30), add:

```html
<seam-map-control
  *ngIf="editingEnabled"
  [def]="_drawControlDef"
></seam-map-control>
```

- [ ] **Step 7: Type-check and build the library**

Run: `npx tsc -p projects/ui-common/tsconfig.spec.json --noEmit`
Expected: compiles.

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/google-maps/google-maps-draw-button-control projects/ui-common/google-maps/google-maps.module.ts projects/ui-common/google-maps/google-maps/google-maps.component.ts projects/ui-common/google-maps/google-maps/google-maps.component.html
git commit -m "feat(google-maps): add draw-toggle map control"
```

---

## Task 10: Drop the `drawing` library and manual verification

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps.stories.ts`

- [ ] **Step 1: Remove `'drawing'` from requested libraries**

In `google-maps.stories.ts` (line 30), change:

```ts
            libraries: ['drawing', 'places'],
```

to:

```ts
            libraries: ['places'],
```

- [ ] **Step 2: Run the full utils suite**

Run: `npx jest projects/ui-common/utils/geo-json`
Expected: PASS (all new and existing geo-json specs).

- [ ] **Step 3: Launch Storybook and manually verify**

Run the project's Storybook (e.g. `npx ng run <project>:storybook` or the repo's documented storybook command) and open the `seam-google-maps` story. Verify each item:

- [ ] The draw button appears on the map when `editingEnabled` is true and is hidden when false.
- [ ] Clicking the draw button enters drawing mode (button shows active state); drawing a polygon and closing it (click the start point, or press Enter) creates a field.
- [ ] Pressing Escape mid-draw cancels the in-progress polygon; the draw button returns to inactive.
- [ ] After a polygon completes, drawing mode turns off (button inactive) — matches prior behavior.
- [ ] With `allowDrawingHoleInPolygon` true, drawing a polygon fully inside an existing one cuts a hole (the interior renders empty, not filled).
- [ ] Selecting an existing polygon and editing/dragging a vertex works, including on a polygon that has a hole.
- [ ] Deleting a selected feature (Delete key / context menu) works.
- [ ] The emitted value (`getGeoJson` / form value) reflects drawn/edited/holed geometry as valid GeoJSON.
- [ ] Hover styling via `setFeatureHoveredStyleOverride` still applies (feature identity preserved) — if a legend-style consumer is available, confirm its per-feature tracking still works; otherwise confirm hover highlight on data features.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.stories.ts
git commit -m "chore(google-maps): stop requesting deprecated drawing library"
```

---

## Self-Review Notes

- **Spec coverage:** §Dependencies → Task 7 Step 1 + Task 10. Pure GeoJSON logic (`addHoleToPolygon`, `polygonContains`, min-point) → Tasks 4, 5, 2. `closePolygons` fix → Task 3. Validator extraction + test relocation → Task 1. Terra Draw integration (init/finish/mode/stopDrawing/isDrawing/teardown) → Tasks 7-8. Feature-identity constraint → Task 8 Step 4 (`setGeometry` on existing instance) + `geoJsonPolygonFromDataFeature` read-only. Draw-toggle control → Task 9. Loader change → Task 10. Test strategy (pure only) → Tasks 1-5 specs; no service mocks. Winding upgrade → Task 5 (pure shoelace, fulfilling the spec's opposite-winding requirement without `@turf/rewind`).
- **Type consistency:** `polygonViolatesMinMax(number, number, number?)` used identically in Tasks 1 & 2. `addHoleToPolygon(Polygon, Polygon): Polygon`, `polygonContains(Polygon, Polygon): boolean`, `dataPolygonFromGeoJson(Polygon): Data.Polygon`, `geoJsonPolygonFromDataFeature(Data.Feature): Polygon | undefined` consistent across Tasks 5/8. `drawing$`/`isDrawing`/`startDrawing`/`stopDrawing` consistent across Tasks 7/9.
- **Known implementation note:** Task 7's `_initTerraDraw` references `_onDrawFinished` (added in Task 8). If executing strictly one task at a time, add the temporary stub called out in Task 7 Step 3.
```
