# Google Maps Multi-Feature Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@theseam/ui-common/google-maps` so one map can manage many field boundaries — grouped features, click-to-select without arming geometry edit, polygon labels, per-feature editability, and programmatic selection — without changing behaviour for existing consumers.

**Architecture:** An opt-in `interactionMode: 'legacy' | 'grouped'` input selects a `MapInteractionModel` strategy. `GoogleMapsService` keeps owning the Maps API and terra-draw plumbing and delegates five decisions to the model. Feature grouping is resolved from a consumer-named GeoJSON property by a `FeatureGroupRegistry`. Feature styling moves out of the `setStyle` closure into a pure function so the precedence chain and the editability clamp are unit-testable.

**Tech Stack:** Angular 20 (NgModule-based component, `OnPush`), TypeScript, Jest (`jest-preset-angular`), Storybook 9 CSF3 with `play` functions, `@types/google.maps`, `@types/geojson`, terra-draw 1.32.

**Spec:** [`docs/superpowers/specs/2026-09-02-google-maps-multi-feature-design.md`](../specs/2026-09-02-google-maps-multi-feature-design.md) — read it alongside this plan; the plan argues from it.

## Global Constraints

- **Additive and opt-in.** `interactionMode` defaults to `'legacy'`. `TheSeam.PeanutTrustClient` and `TheSeam.DataCommons.App` must require no PR. Every new input has a default that reproduces today's behaviour.
- **Prettier config** (`.prettierrc`): 2-space indent, **no semicolons**, single quotes, trailing commas, arrow parens always. Pre-commit runs `prettier --write` and `eslint --fix` on staged files.
- **Naming:** exported types use the `TheSeam` prefix. Do **not** prefix interfaces with `I`. Component selectors `seam-`, directives `seam` camelCase.
- **Private members** are prefixed `_`. Template-only members are also `_`-prefixed. Injected properties are `readonly`.
- **Change detection:** `ChangeDetectionStrategy.OnPush`.
- **Exports** go through `projects/ui-common/google-maps/public-api.ts`. The root `public_api.ts` is intentionally empty — do not touch it.
- **Do not add an `<ng-content>` slot** to `google-maps.component.html`. Controls mount via `addControl()` against the Maps JS API; the missing slot is deliberate.
- **Commits:** conventional commits (`feat:`, `fix:`, `test:`, `chore:`, `refactor:`). The whole branch releases as `feat:` — a minor bump.
- **Node:** 24.16.0 (`.nvmrc`). `npm ci --legacy-peer-deps`. Some comments still reference 22.12.0, which is what the repo used before; the checked-in `.nvmrc` is authoritative.
- **Test commands:** `npm run test:ci` (single run, in-band). A single file: `npx jest --config projects/ui-common/jest.config.ts <path>`.

---

### Task 1: Jest infrastructure for the google-maps module

The `google-maps` directory has no specs and is not in `testMatch`. Everything downstream needs a `google.maps` test double, so it is built first and proven against helpers that already exist.

**Files:**

- Modify: `projects/ui-common/jest.config.ts` (add to `testMatch`)
- Create: `projects/ui-common/google-maps/testing/fake-google-maps.ts`
- Create: `projects/ui-common/google-maps/testing/public-api.ts`
- Create: `projects/ui-common/google-maps/testing/ng-package.json`
- Test: `projects/ui-common/google-maps/google-maps-feature-helpers.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `installFakeGoogleMaps(): void` and `uninstallFakeGoogleMaps(): void`, which set and delete `globalThis.google`. Every later task's spec calls `installFakeGoogleMaps()` in `beforeEach` and `uninstallFakeGoogleMaps()` in `afterEach`.

**No delay argument.** `TheSeamLazyMapsApiLoader` means `google` genuinely is
undefined for a while in the browser, so simulating that is a fair thing to
want. But a test that cares about the pre-load window can just not install the
fake, or install it inside a timer — the behaviour under test is the guard, not
the fake. Building the delay into the installer would put an option in every
spec's setup to serve a handful of them.

- [ ] **Step 1: Add the directory to `testMatch`**

In `projects/ui-common/jest.config.ts`, add one line to the `testMatch` array after `'**/utils/**/*.spec.ts',`:

```ts
    '**/google-maps/**/*.spec.ts',
```

- [ ] **Step 2: Write the failing test**

Create `projects/ui-common/google-maps/google-maps-feature-helpers.spec.ts`:

```ts
import { Polygon } from 'geojson'

import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from './testing/fake-google-maps'
import {
  dataPolygonFromGeoJson,
  geoJsonPolygonFromDataFeature,
  getFeatureBounds,
} from './google-maps-feature-helpers'

const square: Polygon = {
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

describe('google-maps-feature-helpers', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('drops the explicit closing point when building a Data.Polygon', () => {
    // Direction matters, and the two rules look contradictory until you notice
    // which side of the boundary each applies to. GeoJSON rings are explicitly
    // closed (RFC 7946 3.1.6), which is what `closePolygons` guarantees on the
    // way OUT and what `data.addGeoJson()` expects. But a
    // `google.maps.Data.Polygon` is built from LinearRings, which are
    // IMPLICITLY closed — repeating the first point there creates a real
    // duplicate vertex that edits independently and serializes as a double
    // closing point. So a 5-position closed ring becomes 4 path points.
    const polygon = dataPolygonFromGeoJson(square)
    expect(polygon.getArray()[0].getArray()).toHaveLength(4)
  })

  it('round-trips a Polygon back to closed GeoJSON', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
    })
    expect(geoJsonPolygonFromDataFeature(feature)).toEqual(square)
  })

  it('computes bounds covering every vertex', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
    })
    const bounds = getFeatureBounds(feature)
    expect(bounds.getCenter().lat()).toBeCloseTo(5)
    expect(bounds.getCenter().lng()).toBeCloseTo(5)
  })
})
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts google-maps-feature-helpers`
Expected: FAIL — `Cannot find module './testing/fake-google-maps'`.

- [ ] **Step 4: Write the test double**

Create `projects/ui-common/google-maps/testing/fake-google-maps.ts`. Only the surface the helpers and services actually touch is modelled — enough to run logic, not to render.

```ts
/**
 * A minimal stand-in for the parts of the Google Maps JS API this module uses.
 *
 * The real API is loaded from a script tag and is unavailable under Jest. This
 * models only the geometry, feature, and data-layer surface the module touches,
 * which is enough to test every decision the module makes. It renders nothing.
 */

class FakeLatLng {
  constructor(
    private readonly _lat: number,
    private readonly _lng: number,
  ) {}
  lat(): number {
    return this._lat
  }
  lng(): number {
    return this._lng
  }
}

class FakeLatLngBounds {
  private _minLat = Number.POSITIVE_INFINITY
  private _maxLat = Number.NEGATIVE_INFINITY
  private _minLng = Number.POSITIVE_INFINITY
  private _maxLng = Number.NEGATIVE_INFINITY

  extend(latLng: FakeLatLng): FakeLatLngBounds {
    this._minLat = Math.min(this._minLat, latLng.lat())
    this._maxLat = Math.max(this._maxLat, latLng.lat())
    this._minLng = Math.min(this._minLng, latLng.lng())
    this._maxLng = Math.max(this._maxLng, latLng.lng())
    return this
  }
  isEmpty(): boolean {
    return this._minLat > this._maxLat
  }
  getCenter(): FakeLatLng {
    return new FakeLatLng(
      (this._minLat + this._maxLat) / 2,
      (this._minLng + this._maxLng) / 2,
    )
  }
  getNorthEast(): FakeLatLng {
    return new FakeLatLng(this._maxLat, this._maxLng)
  }
  getSouthWest(): FakeLatLng {
    return new FakeLatLng(this._minLat, this._minLng)
  }
}

const toLatLng = (value: any): FakeLatLng =>
  value instanceof FakeLatLng ? value : new FakeLatLng(value.lat, value.lng)

class FakeLinearRing {
  private readonly _points: FakeLatLng[]
  constructor(points: any[]) {
    this._points = points.map(toLatLng)
  }
  getArray(): FakeLatLng[] {
    return [...this._points]
  }
  getLength(): number {
    return this._points.length
  }
  forEachLatLng(cb: (latLng: FakeLatLng) => void): void {
    this._points.forEach(cb)
  }
}

class FakeDataPolygon {
  private readonly _rings: FakeLinearRing[]
  constructor(rings: any[]) {
    this._rings = rings.map((r) =>
      r instanceof FakeLinearRing ? r : new FakeLinearRing(r),
    )
  }
  getType(): string {
    return 'Polygon'
  }
  getArray(): FakeLinearRing[] {
    return [...this._rings]
  }
  forEachLatLng(cb: (latLng: FakeLatLng) => void): void {
    this._rings.forEach((r) => r.forEachLatLng(cb))
  }
}

class FakeDataMultiPolygon {
  private readonly _polygons: FakeDataPolygon[]
  constructor(polygons: any[]) {
    this._polygons = polygons.map((p) =>
      p instanceof FakeDataPolygon ? p : new FakeDataPolygon(p),
    )
  }
  getType(): string {
    return 'MultiPolygon'
  }
  getArray(): FakeDataPolygon[] {
    return [...this._polygons]
  }
  forEachLatLng(cb: (latLng: FakeLatLng) => void): void {
    this._polygons.forEach((p) => p.forEachLatLng(cb))
  }
}

let featureSeq = 0

class FakeDataFeature {
  private _geometry: any
  private readonly _properties = new Map<string, any>()
  private readonly _id: string | number

  constructor(options?: {
    geometry?: any
    id?: string | number
    properties?: Record<string, any>
  }) {
    this._geometry = options?.geometry ?? null
    this._id = options?.id ?? `fake-feature-${featureSeq++}`
    Object.entries(options?.properties ?? {}).forEach(([k, v]) =>
      this._properties.set(k, v),
    )
  }

  getId(): string | number {
    return this._id
  }
  getGeometry(): any {
    return this._geometry
  }
  setGeometry(geometry: any): void {
    this._geometry = geometry
  }
  getProperty(name: string): any {
    return this._properties.get(name)
  }
  setProperty(name: string, value: any): void {
    this._properties.set(name, value)
  }
  removeProperty(name: string): void {
    this._properties.delete(name)
  }
  forEachProperty(cb: (value: any, name: string) => void): void {
    this._properties.forEach(cb)
  }
  toGeoJson(cb: (json: any) => void): void {
    cb({ type: 'Feature', id: this._id, properties: {}, geometry: null })
  }
}

/** Listener registry shared by the fake Data layer, so specs can fire events. */
export class FakeMapsEventTarget {
  private readonly _listeners = new Map<string, ((event: any) => void)[]>()

  addListener(name: string, handler: (event: any) => void) {
    const list = this._listeners.get(name) ?? []
    list.push(handler)
    this._listeners.set(name, list)
    return {
      remove: () => {
        const current = this._listeners.get(name) ?? []
        this._listeners.set(
          name,
          current.filter((h) => h !== handler),
        )
      },
    }
  }

  /** Fire every handler registered for `name`. Used by specs. */
  emit(name: string, event?: any): void {
    ;(this._listeners.get(name) ?? []).forEach((h) => h(event))
  }
}

export class FakeData extends FakeMapsEventTarget {
  private readonly _features: FakeDataFeature[] = []
  private _styleFn: any = null
  readonly overrides = new Map<FakeDataFeature, any>()

  add(feature: any): any {
    const f = feature instanceof FakeDataFeature ? feature : new FakeDataFeature(feature)
    this._features.push(f)
    this.emit('addfeature', { feature: f })
    return f
  }
  remove(feature: any): void {
    const index = this._features.indexOf(feature)
    if (index !== -1) {
      this._features.splice(index, 1)
      this.emit('removefeature', { feature })
    }
  }
  forEach(cb: (feature: any) => void): void {
    ;[...this._features].forEach(cb)
  }
  setStyle(style: any): void {
    this._styleFn = style
  }
  /** Evaluate the registered style callback for a feature. Used by specs. */
  styleFor(feature: any): any {
    return typeof this._styleFn === 'function'
      ? this._styleFn(feature)
      : this._styleFn
  }
  overrideStyle(feature: any, style: any): void {
    this.overrides.set(feature, style)
  }
  revertStyle(feature?: any): void {
    if (feature) {
      this.overrides.delete(feature)
    } else {
      this.overrides.clear()
    }
  }
  addGeoJson(): any[] {
    throw new Error(
      'FakeData.addGeoJson is not implemented. Build features with ' +
        'dataPolygonFromGeoJson / new google.maps.Data.Feature instead.',
    )
  }
  toGeoJson(cb: (json: any) => void): void {
    cb({ type: 'FeatureCollection', features: [] })
  }
}

const FAKE_GOOGLE = {
  maps: {
    LatLng: FakeLatLng,
    LatLngBounds: FakeLatLngBounds,
    Data: Object.assign(FakeData, {
      Feature: FakeDataFeature,
      Polygon: FakeDataPolygon,
      MultiPolygon: FakeDataMultiPolygon,
      LinearRing: FakeLinearRing,
    }),
    event: {
      removeListener: (listener: any) => listener?.remove?.(),
      addListenerOnce: (
        target: any,
        name: string,
        handler: (event: any) => void,
      ) => target.addListener(name, handler),
      trigger: (target: any, name: string, event?: any) =>
        target.emit?.(name, event),
    },
    ControlPosition: { TOP_LEFT: 1, LEFT_BOTTOM: 6, RIGHT_BOTTOM: 9 },
  },
}

/** Install the fake on `globalThis.google`. Call in `beforeEach`. */
export function installFakeGoogleMaps(): void {
  featureSeq = 0
  ;(globalThis as any).google = FAKE_GOOGLE
}

/** Remove the fake. Call in `afterEach` so suites cannot leak into each other. */
export function uninstallFakeGoogleMaps(): void {
  delete (globalThis as any).google
}
```

- [ ] **Step 5: Add the testing secondary entry point**

Create `projects/ui-common/google-maps/testing/ng-package.json`:

```json
{
  "lib": {
    "entryFile": "public-api.ts"
  }
}
```

Create `projects/ui-common/google-maps/testing/public-api.ts`:

```ts
export * from './fake-google-maps'
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx jest --config projects/ui-common/jest.config.ts google-maps-feature-helpers`
Expected: PASS, 3 tests.

- [ ] **Step 7: Run the whole suite to confirm nothing else broke**

Run: `npm run test:ci`
Expected: PASS. The new `testMatch` entry adds only the new file.

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/jest.config.ts projects/ui-common/google-maps/testing projects/ui-common/google-maps/google-maps-feature-helpers.spec.ts
git commit -m "test(google-maps): add google.maps test double and enable jest for the module"
```

---

### Task 2: MultiPolygon feature helpers

43% of a real customer import is `MultiPolygon`, and `geoJsonPolygonFromDataFeature()` returns `undefined` for it — silently disabling the exterior-containment search and hole-cutting on those features. Outputs also need to read any feature as GeoJSON.

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps-feature-helpers.ts`
- Test: `projects/ui-common/google-maps/google-maps-feature-helpers.spec.ts`

**Interfaces:**

- Consumes: `installFakeGoogleMaps` (Task 1).
- Produces:
  - `polygonsFromDataFeature(feature: google.maps.Data.Feature): Polygon[]`
  - `geoJsonFeatureFromDataFeature(feature: google.maps.Data.Feature, excludeProperties?: (name: string) => boolean): Feature<Polygon | MultiPolygon> | undefined`
  - `dataMultiPolygonFromGeoJson(multiPolygon: MultiPolygon): google.maps.Data.MultiPolygon`

- [ ] **Step 1: Write the failing tests**

Append to `projects/ui-common/google-maps/google-maps-feature-helpers.spec.ts`. Add the imports at the top of the file:

```ts
import { Feature, MultiPolygon, Polygon } from 'geojson'

import {
  dataMultiPolygonFromGeoJson,
  geoJsonFeatureFromDataFeature,
  polygonsFromDataFeature,
} from './google-maps-feature-helpers'
```

Then append this suite:

```ts
const twoSquares: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0, 0],
        [0, 10],
        [10, 10],
        [10, 0],
        [0, 0],
      ],
    ],
    [
      [
        [20, 20],
        [20, 30],
        [30, 30],
        [30, 20],
        [20, 20],
      ],
    ],
  ],
}

describe('MultiPolygon helpers', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('returns every part of a MultiPolygon', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataMultiPolygonFromGeoJson(twoSquares),
    })
    const parts = polygonsFromDataFeature(feature)
    expect(parts).toHaveLength(2)
    expect(parts[0].coordinates).toEqual(twoSquares.coordinates[0])
    expect(parts[1].coordinates).toEqual(twoSquares.coordinates[1])
  })

  it('returns the single part of a Polygon feature', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
    })
    expect(polygonsFromDataFeature(feature)).toEqual([square])
  })

  it('reads a MultiPolygon feature as a GeoJSON Feature with properties', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataMultiPolygonFromGeoJson(twoSquares),
      properties: { FIELD_NAME: 'North Field' },
    })
    const result = geoJsonFeatureFromDataFeature(feature)
    expect(result?.geometry).toEqual(twoSquares)
    expect(result?.properties).toEqual({ FIELD_NAME: 'North Field' })
  })

  it('omits properties the caller excludes', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
      properties: { keep: 1, __app__isSelected: true },
    })
    const result = geoJsonFeatureFromDataFeature(feature, (name) =>
      name.startsWith('__app__'),
    )
    expect(result?.properties).toEqual({ keep: 1 })
  })

  it('returns undefined for a geometry that is neither Polygon nor MultiPolygon', () => {
    const feature = new google.maps.Data.Feature({ geometry: null })
    expect(geoJsonFeatureFromDataFeature(feature)).toBeUndefined()
    expect(polygonsFromDataFeature(feature)).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts google-maps-feature-helpers`
Expected: FAIL — `dataMultiPolygonFromGeoJson is not a function`.

- [ ] **Step 3: Implement the helpers**

In `projects/ui-common/google-maps/google-maps-feature-helpers.ts`, change the geojson import to include the extra types:

```ts
import { Feature, MultiPolygon, Polygon } from 'geojson'
```

Add after `geoJsonPolygonFromDataFeature`:

```ts
/** Build a google.maps.Data.MultiPolygon from a GeoJSON MultiPolygon. */
export function dataMultiPolygonFromGeoJson(
  multiPolygon: MultiPolygon,
): google.maps.Data.MultiPolygon {
  return new google.maps.Data.MultiPolygon(
    multiPolygon.coordinates.map((rings) =>
      dataPolygonFromGeoJson({ type: 'Polygon', coordinates: rings }),
    ),
  )
}

/**
 * Every Polygon part of a feature, as closed GeoJSON. A Polygon feature yields
 * one; a MultiPolygon yields one per part; anything else yields none.
 *
 * Callers that need to match a drawn shape against existing geometry must use
 * this rather than `geoJsonPolygonFromDataFeature`, which sees only Polygons
 * and silently ignores MultiPolygon features.
 */
export function polygonsFromDataFeature(
  feature: google.maps.Data.Feature,
): Polygon[] {
  const geometry = feature.getGeometry()
  if (geometry === null) {
    return []
  }
  if (geometry.getType() === 'Polygon') {
    const polygon: Polygon = {
      type: 'Polygon',
      coordinates: polygonCoordinates(geometry as google.maps.Data.Polygon),
    }
    closePolygons(polygon)
    return [polygon]
  }
  if (geometry.getType() === 'MultiPolygon') {
    return (geometry as google.maps.Data.MultiPolygon)
      .getArray()
      .map((part) => {
        const polygon: Polygon = {
          type: 'Polygon',
          coordinates: polygonCoordinates(part),
        }
        closePolygons(polygon)
        return polygon
      })
  }
  return []
}

/**
 * Read a feature as a GeoJSON Feature, geometry and properties together.
 *
 * `excludeProperty` filters properties out by name — used to keep internal
 * `__app__` bookkeeping out of anything handed to a consumer.
 */
export function geoJsonFeatureFromDataFeature(
  feature: google.maps.Data.Feature,
  excludeProperty?: (name: string) => boolean,
): Feature<Polygon | MultiPolygon> | undefined {
  const parts = polygonsFromDataFeature(feature)
  if (parts.length === 0) {
    return undefined
  }

  const geometry: Polygon | MultiPolygon =
    feature.getGeometry()?.getType() === 'MultiPolygon'
      ? { type: 'MultiPolygon', coordinates: parts.map((p) => p.coordinates) }
      : parts[0]

  const properties: Record<string, any> = {}
  feature.forEachProperty((value, name) => {
    if (!excludeProperty?.(name)) {
      properties[name] = value
    }
  })

  const id = feature.getId()
  return {
    type: 'Feature',
    ...(id === undefined ? {} : { id }),
    geometry,
    properties,
  }
}
```

- [ ] **Step 4: Run to verify the tests pass**

Run: `npx jest --config projects/ui-common/jest.config.ts google-maps-feature-helpers`
Expected: PASS, 8 tests.

- [ ] **Step 5: Export the new helpers**

They are already covered — `public-api.ts` has `export * from './google-maps-feature-helpers'`. Verify with:

Run: `grep -n "google-maps-feature-helpers" projects/ui-common/google-maps/public-api.ts`
Expected: one line. No change needed.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/google-maps/google-maps-feature-helpers.ts projects/ui-common/google-maps/google-maps-feature-helpers.spec.ts
git commit -m "feat(google-maps): read and write MultiPolygon feature geometry"
```

---

### Task 3: Prove the MultiPolygon round trip in a real map

**This is a gate.** The spec says to prove before building on it: if `Data.addGeoJson()`/`toGeoJson()` degrades `MultiPolygon` to a `GeometryCollection`, the value fails the consuming app's `isOnlyGeometryTypesValidator(['Polygon', 'MultiPolygon'])` and the design changes. The fake in Task 1 deliberately throws from `addGeoJson`, so only the real API can answer this.

**Files:**

- Create: `.storybook/test-runner.js`
- Modify: `projects/ui-common/google-maps/google-maps.stories.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: the `MultiPolygonRoundTrip` story, and the `localStorage` key `seam.googleMapsApiKey` that all later stories read.

- [ ] **Step 1: Add the API key plumbing**

The map renders without a key (with a watermark and a dismissible dialog), so this is a convenience, not a prerequisite. Never commit a key — this repo has a **public** remote.

Create `.storybook/test-runner.js`:

```js
/**
 * Seeds the Google Maps API key into the preview's localStorage.
 *
 * The key is read here, in Node, where `process.env` is unambiguous. Reading it
 * from a story file would depend on Storybook's DefinePlugin substitution
 * surviving `framework-preset-angular-cli`, which builds its own webpack config
 * — unverified, and not worth depending on.
 *
 * Without a key the map still renders, with a "For development purposes only"
 * watermark and a dismissible dialog.
 */
module.exports = {
  async preVisit(page) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (apiKey) {
      await page.addInitScript((key) => {
        window.localStorage.setItem('seam.googleMapsApiKey', key)
      }, apiKey)
    }
  },
}
```

- [ ] **Step 2: Read the key in the stories file**

In `projects/ui-common/google-maps/google-maps.stories.ts`, replace the commented-out `apiKey` line inside `THESEAM_LAZY_MAPS_API_CONFIG`:

```ts
        {
          provide: THESEAM_LAZY_MAPS_API_CONFIG,
          useValue: {
            // Optional. Set once in devtools for local work:
            //   localStorage.setItem('seam.googleMapsApiKey', '<key>')
            // The test runner seeds it from GOOGLE_MAPS_API_KEY (see
            // .storybook/test-runner.js). Without one the map still renders,
            // with a watermark and a dismissible dialog.
            apiKey:
              globalThis.localStorage?.getItem('seam.googleMapsApiKey') ??
              undefined,
            libraries: ['places'],
          },
        },
```

- [ ] **Step 3: Write the round-trip story**

Append to `projects/ui-common/google-maps/google-maps.stories.ts`:

```ts
const MULTI_POLYGON_VALUE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { FIELD_NAME: 'Simple' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-98.58, 37.63],
            [-98.58, 37.64],
            [-98.57, 37.64],
            [-98.57, 37.63],
            [-98.58, 37.63],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { FIELD_NAME: 'Split' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-98.56, 37.63],
              [-98.56, 37.64],
              [-98.55, 37.64],
              [-98.55, 37.63],
              [-98.56, 37.63],
            ],
          ],
          [
            [
              [-98.54, 37.63],
              [-98.54, 37.64],
              [-98.53, 37.64],
              [-98.53, 37.63],
              [-98.54, 37.63],
            ],
          ],
        ],
      },
    },
  ],
}

/**
 * Gate story: proves google.maps.Data round-trips MultiPolygon rather than
 * degrading it to a GeometryCollection. Consuming apps validate the map value
 * with isOnlyGeometryTypesValidator(['Polygon', 'MultiPolygon']), so a
 * GeometryCollection here would fail validation in the app.
 */
export const MultiPolygonRoundTrip = {
  render: () => ({
    template: `<seam-google-maps #map [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: MULTI_POLYGON_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
    const host = canvasElement.querySelector('seam-google-maps')
    // Wait for the map to load the value into its data layer.
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const component = (window as any).ng.getComponent(host)
    const geoJson = await component.getGeoJson()
    const types = geoJson.features.map((f: any) => f.geometry.type).sort()
    expect(types).toEqual(['MultiPolygon', 'Polygon'])
  },
}
```

Add `expect` to the imports at the top of the file:

```ts
import { expect } from 'storybook/test'
```

- [ ] **Step 4: Run the story and read the result**

Assume Storybook is already running; the developer usually has it open and starting it takes minutes. If the runner cannot connect, ask before starting a new instance.

Run: `npm run test-storybook -- google-maps`

Note the trap: `test-storybook` path arguments are **regexes**, so pass a filename fragment, never a path containing `+`.

- [ ] **Step 5: Record the outcome**

**If PASS:** MultiPolygon round-trips. Continue to Task 4 unchanged.

**If FAIL** because the types come back as `GeometryCollection`: **stop and report.** The spec's MultiPolygon section and the app's validator both assume otherwise, and the design needs revisiting before Task 4. Do not work around it.

- [ ] **Step 6: Commit**

```bash
git add .storybook/test-runner.js projects/ui-common/google-maps/google-maps.stories.ts
git commit -m "test(google-maps): verify MultiPolygon survives the data layer round trip"
```

---

### Task 4: Feature group registry

Resolves which field each feature belongs to, and assigns keys to features the map creates.

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps-feature-helpers.ts` (add the app property)
- Create: `projects/ui-common/google-maps/feature-groups/feature-group.ts`
- Create: `projects/ui-common/google-maps/feature-groups/feature-group-registry.ts`
- Test: `projects/ui-common/google-maps/feature-groups/feature-group-registry.spec.ts`
- Modify: `projects/ui-common/google-maps/public-api.ts`

**Interfaces:**

- Consumes: `geoJsonFeatureFromDataFeature`, `isAppFeatureProperty` (Task 2 and existing).
- Produces:
  - `TheSeamMapFeatureGroup { key: string; features: Feature<Polygon | MultiPolygon>[] }`
  - `TheSeamMapGroupTarget { group: TheSeamMapFeatureGroup; feature: Feature<Polygon | MultiPolygon> | null }`
  - `class FeatureGroupRegistry` with `keyOf(feature): string`, `featuresIn(key): google.maps.Data.Feature[]`, `groupOf(feature): TheSeamMapFeatureGroup | undefined`, `groups(): TheSeamMapFeatureGroup[]`, `assignNewKey(feature): string`, `assignKey(feature, key): void`, `setOptions(options): void`

- [ ] **Step 1: Add the group-key app property**

In `projects/ui-common/google-maps/google-maps-feature-helpers.ts`, extend the enum:

```ts
export enum AppFeaturePropertyName {
  IsSelected = `__app__isSelected`,
  GroupKey = `__app__groupKey`,
}
```

`isAppFeatureProperty`, `stripAppFeaturePropertiesFromJson`, and the `setproperty`/`removeproperty` filters in `createFeatureChangeObservable` all read from this enum, so the new property is automatically stripped from serialized output and excluded from value-change events. No other change is needed there.

- [ ] **Step 2: Write the failing tests**

Create `projects/ui-common/google-maps/feature-groups/feature-group-registry.spec.ts`:

```ts
import { Polygon } from 'geojson'

import { dataPolygonFromGeoJson } from '../google-maps-feature-helpers'
import {
  FakeData,
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import { FeatureGroupRegistry } from './feature-group-registry'

const square: Polygon = {
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

function makeFeature(properties: Record<string, any> = {}) {
  return new google.maps.Data.Feature({
    geometry: dataPolygonFromGeoJson(square),
    properties,
  })
}

describe('FeatureGroupRegistry', () => {
  let data: any

  beforeEach(() => {
    installFakeGoogleMaps()
    data = new FakeData()
  })
  afterEach(() => uninstallFakeGoogleMaps())

  it('groups features sharing the configured property value', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    const a1 = data.add(makeFeature({ fieldId: 'A' }))
    const a2 = data.add(makeFeature({ fieldId: 'A' }))
    const b1 = data.add(makeFeature({ fieldId: 'B' }))

    expect(registry.keyOf(a1)).toBe('A')
    expect(registry.keyOf(a2)).toBe('A')
    expect(registry.featuresIn('A')).toEqual([a1, a2])
    expect(registry.featuresIn('B')).toEqual([b1])
    expect(registry.groups().map((g) => g.key).sort()).toEqual(['A', 'B'])
  })

  it('gives each feature its own key when no group property is configured', () => {
    const registry = new FeatureGroupRegistry(data, {})
    const f1 = data.add(makeFeature())
    const f2 = data.add(makeFeature())

    expect(registry.keyOf(f1)).not.toBe(registry.keyOf(f2))
    expect(registry.groups()).toHaveLength(2)
  })

  it('keeps an assigned key stable across repeated reads', () => {
    const registry = new FeatureGroupRegistry(data, {})
    const feature = data.add(makeFeature())
    expect(registry.keyOf(feature)).toBe(registry.keyOf(feature))
  })

  it('falls back to an assigned key when the group property is absent', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    const grouped = data.add(makeFeature({ fieldId: 'A' }))
    const ungrouped = data.add(makeFeature())

    expect(registry.keyOf(grouped)).toBe('A')
    expect(registry.keyOf(ungrouped)).not.toBe('A')
    expect(ungrouped.getProperty('fieldId')).toBeUndefined()
  })

  it('writes the group property when assigning a new key', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
      newGroupKeyFactory: () => 'pending-1',
    })
    const feature = data.add(makeFeature())
    expect(registry.assignNewKey(feature)).toBe('pending-1')
    expect(feature.getProperty('fieldId')).toBe('pending-1')
  })

  it('writes only the app property when no group property is configured', () => {
    const registry = new FeatureGroupRegistry(data, {
      newGroupKeyFactory: () => 'pending-1',
    })
    const feature = data.add(makeFeature())
    registry.assignNewKey(feature)
    expect(feature.getProperty('__app__groupKey')).toBeDefined()
  })

  it('joins a feature to an existing group by writing that key', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    data.add(makeFeature({ fieldId: 'A' }))
    const drawn = data.add(makeFeature())

    registry.assignKey(drawn, 'A')

    expect(drawn.getProperty('fieldId')).toBe('A')
    expect(registry.featuresIn('A')).toHaveLength(2)
  })

  it('emits a group as GeoJSON without internal properties', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    const feature = data.add(makeFeature({ fieldId: 'A' }))
    feature.setProperty('__app__isSelected', true)

    const group = registry.groupOf(feature)

    expect(group?.key).toBe('A')
    expect(group?.features).toHaveLength(1)
    expect(group?.features[0].properties).toEqual({ fieldId: 'A' })
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts feature-group-registry`
Expected: FAIL — `Cannot find module './feature-group-registry'`.

- [ ] **Step 4: Write the group types**

Create `projects/ui-common/google-maps/feature-groups/feature-group.ts`:

```ts
import { Feature, MultiPolygon, Polygon } from 'geojson'

/** A set of features that belong to the same logical thing, such as one field. */
export interface TheSeamMapFeatureGroup {
  /**
   * `properties[featureGroupProperty]`.
   *
   * Falls back to a map-assigned key for features that carry no group value —
   * always the case when no group property is configured, and for imported
   * features the consumer did not assign one to. An assigned key is
   * session-scoped: it does not survive an external value write, so it must not
   * be persisted or held across a write and passed back to `selectGroup()`.
   */
  key: string
  features: Feature<Polygon | MultiPolygon>[]
}

/** A group, plus the individual feature an interaction landed on. */
export interface TheSeamMapGroupTarget {
  group: TheSeamMapFeatureGroup
  /**
   * The polygon the interaction landed on. For a selection this is the one
   * `Delete` acts on; for a hover, the one under the cursor.
   *
   * A reference into `group.features`, not a copy.
   */
  feature: Feature<Polygon | MultiPolygon> | null
}
```

- [ ] **Step 5: Write the registry**

Create `projects/ui-common/google-maps/feature-groups/feature-group-registry.ts`:

```ts
import {
  AppFeaturePropertyName,
  geoJsonFeatureFromDataFeature,
  isAppFeatureProperty,
} from '../google-maps-feature-helpers'
import { TheSeamMapFeatureGroup } from './feature-group'

declare const ngDevMode: boolean | undefined

export interface FeatureGroupRegistryOptions {
  /**
   * Name of the GeoJSON property that groups features. When unset, every
   * feature is its own group.
   */
  groupProperty?: string | null
  /** Generates the key written for a newly created group. */
  newGroupKeyFactory?: () => string
}

const isDevMode = () => typeof ngDevMode === 'undefined' || !!ngDevMode

/**
 * Resolves which group each feature on the data layer belongs to, and assigns
 * keys to features the map itself creates.
 *
 * Keys resolve from `properties[groupProperty]` when present, and otherwise
 * from an internal `__app__groupKey`, which is stripped from serialized output
 * and does not trigger value changes.
 */
export class FeatureGroupRegistry {
  private _assignedSeq = 0
  private _warnedAboutMissingGroupValues = false
  private _warnedAboutUnsupportedGeometry = false

  constructor(
    private readonly _data: google.maps.Data,
    private _options: FeatureGroupRegistryOptions = {},
  ) {}

  setOptions(options: FeatureGroupRegistryOptions): void {
    this._options = options
  }

  /**
   * The group key for a feature, assigning an internal one if it has neither a
   * group property value nor a previously assigned key.
   *
   * Assigning here mutates the feature, but only via an `__app__` property,
   * which neither serializes nor raises a value change.
   */
  keyOf(feature: google.maps.Data.Feature): string {
    const declared = this._declaredKey(feature)
    if (declared !== undefined) {
      return declared
    }

    const assigned = feature.getProperty(AppFeaturePropertyName.GroupKey)
    if (typeof assigned === 'string' && assigned.length > 0) {
      return assigned
    }

    this._warnAboutMissingGroupValue()
    const key = `__assigned__${this._assignedSeq++}`
    feature.setProperty(AppFeaturePropertyName.GroupKey, key)
    return key
  }

  /** Every feature on the data layer belonging to `key`. */
  featuresIn(key: string): google.maps.Data.Feature[] {
    const features: google.maps.Data.Feature[] = []
    this._data.forEach((feature) => {
      if (this.keyOf(feature) === key) {
        features.push(feature)
      }
    })
    return features
  }

  /** The group a feature belongs to, as emittable GeoJSON. */
  groupOf(
    feature: google.maps.Data.Feature,
  ): TheSeamMapFeatureGroup | undefined {
    return this.group(this.keyOf(feature))
  }

  /** The group for a key, or undefined when no feature carries it. */
  group(key: string): TheSeamMapFeatureGroup | undefined {
    return this.groupWithSources(key)?.group
  }

  /**
   * A group alongside the `Data.Feature` each emitted GeoJSON feature came
   * from, index-aligned.
   *
   * Callers that need to map a `Data.Feature` back to its emitted counterpart
   * must use this rather than indexing `group.features` against
   * `featuresIn(key)` — a feature with unsupported geometry is dropped from
   * the emitted list, which would shift every index after it.
   */
  groupWithSources(key: string):
    | { group: TheSeamMapFeatureGroup; sources: google.maps.Data.Feature[] }
    | undefined {
    const candidates = this.featuresIn(key)
    if (candidates.length === 0) {
      return undefined
    }

    const sources: google.maps.Data.Feature[] = []
    const features: TheSeamMapFeatureGroup['features'] = []
    for (const candidate of candidates) {
      const geoJson = geoJsonFeatureFromDataFeature(
        candidate,
        isAppFeatureProperty,
      )
      if (geoJson === undefined) {
        this._warnAboutUnsupportedGeometry()
        continue
      }
      sources.push(candidate)
      features.push(geoJson)
    }

    return { group: { key, features }, sources }
  }

  /** Every group currently on the data layer. */
  groups(): TheSeamMapFeatureGroup[] {
    const keys = new Set<string>()
    this._data.forEach((feature) => keys.add(this.keyOf(feature)))
    return [...keys]
      .map((key) => this.group(key))
      .filter((g): g is TheSeamMapFeatureGroup => g !== undefined)
  }

  /**
   * Start a new group on a feature the map created, writing a real group
   * property when one is configured so the grouping survives serialization.
   */
  assignNewKey(feature: google.maps.Data.Feature): string {
    const key = this._options.newGroupKeyFactory?.() ?? defaultGroupKey()
    if (isDevMode() && this.featuresIn(key).length > 0) {
      console.warn(
        `[seam-google-maps] newGroupKeyFactory produced the key "${key}", ` +
          `which is already in use. The drawn feature joins that group. ` +
          `The factory is responsible for producing unique keys.`,
      )
    }
    this.assignKey(feature, key)
    return key
  }

  /** Put a feature into an existing group. */
  assignKey(feature: google.maps.Data.Feature, key: string): void {
    const groupProperty = this._options.groupProperty
    if (groupProperty) {
      feature.setProperty(groupProperty, key)
      feature.removeProperty(AppFeaturePropertyName.GroupKey)
      return
    }
    feature.setProperty(AppFeaturePropertyName.GroupKey, key)
  }

  private _declaredKey(
    feature: google.maps.Data.Feature,
  ): string | undefined {
    const groupProperty = this._options.groupProperty
    if (!groupProperty) {
      return undefined
    }
    const value = feature.getProperty(groupProperty)
    if (value === null || value === undefined || value === '') {
      return undefined
    }
    return String(value)
  }

  private _warnAboutUnsupportedGeometry(): void {
    if (!isDevMode() || this._warnedAboutUnsupportedGeometry) {
      return
    }
    this._warnedAboutUnsupportedGeometry = true
    console.warn(
      `[seam-google-maps] a feature's geometry is neither Polygon nor ` +
        `MultiPolygon. It still renders, but is excluded from groups, ` +
        `outputs, and labels.`,
    )
  }

  private _warnAboutMissingGroupValue(): void {
    if (
      !isDevMode() ||
      !this._options.groupProperty ||
      this._warnedAboutMissingGroupValues
    ) {
      return
    }
    this._warnedAboutMissingGroupValues = true
    console.warn(
      `[seam-google-maps] featureGroupProperty is ` +
        `"${this._options.groupProperty}", but at least one feature has no ` +
        `value for it. Each becomes its own group under a session-scoped key ` +
        `that is not serialized. Assign the property during import.`,
    )
  }
}

function defaultGroupKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `group-${Date.now()}-${Math.random()}`
}
```

- [ ] **Step 6: Run to verify the tests pass**

Run: `npx jest --config projects/ui-common/jest.config.ts feature-group-registry`
Expected: PASS, 8 tests.

- [ ] **Step 7: Export the public types**

In `projects/ui-common/google-maps/public-api.ts`, add after the `google-maps-feature-helpers` line:

```ts
export * from './feature-groups/feature-group'
export * from './feature-groups/feature-group-registry'
```

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/google-maps/feature-groups projects/ui-common/google-maps/google-maps-feature-helpers.ts projects/ui-common/google-maps/public-api.ts
git commit -m "feat(google-maps): resolve features into groups by a consumer-named property"
```

---

### Task 5: Feature style precedence and the editability clamp

Moves style computation out of the `setStyle` closure into a pure function. Fixes the reported bug (`getSelectedStyleOptionsDefinedByFeature` is exported but never called, so `styleOptionsSelected` does nothing and hovered styling leaks into selected), and admits `editable`/`draggable` to the supported property list behind a one-directional clamp.

**Files:**

- Create: `projects/ui-common/google-maps/feature-style/compute-feature-style.ts`
- Test: `projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts`
- Modify: `projects/ui-common/google-maps/public-api.ts`

**Interfaces:**

- Consumes: `getStyleOptionsDefinedByFeature`, `getSelectedStyleOptionsDefinedByFeature`, `isFeatureSelected` (existing helpers).
- Produces:
  - `TheSeamMapFeatureStyleContext { editingEnabled: boolean; geometryEditingArmed: boolean; clicksAllowed: boolean }`
  - `computeFeatureStyle(feature, context): google.maps.Data.StyleOptions`
  - `FEATURE_STYLE_OPTIONS_DEFAULT`, `FEATURE_STYLE_OPTIONS_SELECTED`, `FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED`, `SUPPORTED_PROPERTY_STYLE_OPTIONS` — moved here from `google-maps.service.ts`.

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts`:

```ts
import { setFeatureSelected } from '../google-maps-feature-helpers'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import {
  computeFeatureStyle,
  TheSeamMapFeatureStyleContext,
} from './compute-feature-style'

const armed: TheSeamMapFeatureStyleContext = {
  editingEnabled: true,
  geometryEditingArmed: true,
  clicksAllowed: true,
}

function makeFeature(properties: Record<string, any> = {}) {
  return new google.maps.Data.Feature({ geometry: null, properties })
}

describe('computeFeatureStyle', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('is not editable or draggable when unselected', () => {
    const style = computeFeatureStyle(makeFeature(), armed)
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(false)
  })

  it('arms editing when selected and everything allows it', () => {
    const feature = makeFeature()
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(true)
    expect(style.draggable).toBe(true)
  })

  it('applies styleOptions from the feature', () => {
    const feature = makeFeature({ styleOptions: { fillColor: 'gray' } })
    expect(computeFeatureStyle(feature, armed).fillColor).toBe('gray')
  })

  it('keeps styleOptions when the feature is selected', () => {
    const feature = makeFeature({ styleOptions: { visible: false } })
    setFeatureSelected(feature, true)
    // Regression: the selected branch used to replace the options wholesale,
    // discarding the consumer's styleOptions merge entirely.
    expect(computeFeatureStyle(feature, armed).visible).toBe(false)
  })

  it('applies styleOptionsSelected, not styleOptionsHovered, when selected', () => {
    const feature = makeFeature({
      styleOptionsSelected: { fillColor: 'gold' },
      styleOptionsHovered: { fillColor: 'red' },
    })
    setFeatureSelected(feature, true)
    // Regression: the selected branch used to merge the hovered options.
    expect(computeFeatureStyle(feature, armed).fillColor).toBe('gold')
  })

  it('lets a feature opt out of editing while selected', () => {
    const feature = makeFeature({ styleOptions: { editable: false } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(true)
  })

  it('never lets a feature opt IN beyond what the context allows', () => {
    const feature = makeFeature({ styleOptions: { editable: true } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, {
      ...armed,
      editingEnabled: false,
    })
    expect(style.editable).toBe(false)
  })

  it('disarms editing when the model has not armed geometry editing', () => {
    const feature = makeFeature()
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, {
      ...armed,
      geometryEditingArmed: false,
    })
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(false)
  })

  it('lets the model force a feature to ignore clicks', () => {
    const feature = makeFeature({ styleOptions: { clickable: true } })
    const style = computeFeatureStyle(feature, {
      ...armed,
      clicksAllowed: false,
    })
    expect(style.clickable).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts compute-feature-style`
Expected: FAIL — `Cannot find module './compute-feature-style'`.

- [ ] **Step 3: Write the implementation**

Create `projects/ui-common/google-maps/feature-style/compute-feature-style.ts`:

```ts
import {
  getHoveredStyleOptionsDefinedByFeature,
  getSelectedStyleOptionsDefinedByFeature,
  getStyleOptionsDefinedByFeature,
  isFeatureSelected,
} from '../google-maps-feature-helpers'

export const FEATURE_STYLE_OPTIONS_DEFAULT =
  (): google.maps.Data.StyleOptions => ({
    clickable: true,
    visible: true,
    draggable: false,
    editable: false,
    fillColor: 'teal',
    fillOpacity: 0.3,
    strokeColor: 'blue',
    strokeOpacity: 1,
    strokeWeight: 2,
  })

export const FEATURE_STYLE_OPTIONS_SELECTED =
  (): google.maps.Data.StyleOptions => ({
    fillColor: 'green',
    fillOpacity: 0.7,
    strokeColor: 'limegreen',
    strokeOpacity: 1,
    strokeWeight: 2,
  })

export const FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED =
  (): google.maps.Data.StyleOptions => ({
    strokeColor: 'black',
    strokeOpacity: 1,
    strokeWeight: 4,
  })

/**
 * Style options a feature may set through its GeoJSON properties.
 *
 * `editable`, `draggable`, and `clickable` are here so a feature can opt OUT —
 * a retired field stays unreshapeable while its neighbours do not. They cannot
 * opt in: the clamp in `computeFeatureStyle` runs last and only ever narrows.
 */
export const SUPPORTED_PROPERTY_STYLE_OPTIONS: (keyof google.maps.Data.StyleOptions)[] =
  [
    'fillColor',
    'fillOpacity',
    'strokeColor',
    'strokeOpacity',
    'strokeWeight',
    'label',
    'opacity',
    'icon',
    'clickable',
    'visible',
    'editable',
    'draggable',
  ]

/** What the interaction model and the global gate permit for a feature. */
export interface TheSeamMapFeatureStyleContext {
  /** The `editingEnabled` input. */
  editingEnabled: boolean
  /** Whether the model currently arms geometry editing at all. */
  geometryEditingArmed: boolean
  /** Whether the model lets this feature receive clicks. */
  clicksAllowed: boolean
}

/** Merge only the supported subset of one options object into another. */
export function mergeStyleOptions(
  target: google.maps.Data.StyleOptions,
  source: google.maps.Data.StyleOptions | undefined,
): google.maps.Data.StyleOptions {
  if (!source || Object.keys(source).length === 0) {
    return target
  }
  for (const option of SUPPORTED_PROPERTY_STYLE_OPTIONS) {
    if (Object.prototype.hasOwnProperty.call(source, option)) {
      target[option] = source[option] as any
    }
  }
  return target
}

/**
 * The style for a feature, in a fixed precedence order:
 *
 *   defaults
 *     -> properties.styleOptions
 *     -> selected defaults          (when selected)
 *     -> properties.styleOptionsSelected  (when selected)
 *     -> interaction clamp          (always last)
 *
 * The clamp is one-directional. A feature can only narrow what the context
 * permits, never widen it, so no property in an uploaded file can arm editing
 * when the mode says no.
 */
export function computeFeatureStyle(
  feature: google.maps.Data.Feature,
  context: TheSeamMapFeatureStyleContext,
): google.maps.Data.StyleOptions {
  const selected = isFeatureSelected(feature)
  const declared = selected
    ? (getSelectedStyleOptionsDefinedByFeature(feature) ??
      getStyleOptionsDefinedByFeature(feature))
    : getStyleOptionsDefinedByFeature(feature)

  const options = FEATURE_STYLE_OPTIONS_DEFAULT()
  mergeStyleOptions(options, getStyleOptionsDefinedByFeature(feature))

  if (selected) {
    mergeStyleOptions(options, FEATURE_STYLE_OPTIONS_SELECTED())
    mergeStyleOptions(options, getSelectedStyleOptionsDefinedByFeature(feature))
  }

  const wants = (option: 'editable' | 'draggable' | 'clickable') =>
    declared?.[option] !== false

  const geometryEditable =
    wants('editable') &&
    context.editingEnabled &&
    context.geometryEditingArmed &&
    selected

  options.editable = geometryEditable
  options.draggable =
    wants('draggable') &&
    context.editingEnabled &&
    context.geometryEditingArmed &&
    selected
  options.clickable = wants('clickable') && context.clicksAllowed

  return options
}

/** The hover override, merged with anything the feature declares for hover. */
export function computeFeatureHoverStyle(
  feature: google.maps.Data.Feature,
): google.maps.Data.StyleOptions {
  return mergeStyleOptions(
    FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED(),
    getHoveredStyleOptionsDefinedByFeature(feature),
  )
}
```

- [ ] **Step 4: Run to verify the tests pass**

Run: `npx jest --config projects/ui-common/jest.config.ts compute-feature-style`
Expected: PASS, 9 tests.

- [ ] **Step 5: Export it**

In `projects/ui-common/google-maps/public-api.ts`, add:

```ts
export * from './feature-style/compute-feature-style'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/google-maps/feature-style projects/ui-common/google-maps/public-api.ts
git commit -m "fix(google-maps): apply styleOptionsSelected and clamp per-feature editability"
```

---

### Task 6: Interaction model interface and the legacy model

A behaviour-preserving extraction. The legacy model must reproduce today's behaviour exactly, because two apps depend on it and will not be updated.

**Files:**

- Create: `projects/ui-common/google-maps/interaction/map-interaction-model.ts`
- Create: `projects/ui-common/google-maps/interaction/legacy-interaction-model.ts`
- Test: `projects/ui-common/google-maps/interaction/legacy-interaction-model.spec.ts`
- Create: `projects/ui-common/google-maps/testing/fake-interaction-context.ts`
- Modify: `projects/ui-common/google-maps/testing/public-api.ts`
- Modify: `projects/ui-common/google-maps/public-api.ts`

**Interfaces:**

- Consumes: `FeatureGroupRegistry` (Task 4), `polygonsFromDataFeature` (Task 2).
- Produces:
  - `TheSeamMapInteractionMode = 'legacy' | 'grouped'`
  - `MapInteractionContext` (see Step 2)
  - `MapDrawOutcome = { kind: 'newFeature'; groupKey: string | null } | { kind: 'hole'; target: google.maps.Data.Feature }`
  - `MapFeatureInteractionFlags = { geometryEditingArmed: boolean; clicksAllowed: boolean }`
  - `MapInteractionModel` interface with `id`, `onFeatureClick`, `onMapClick`, `onDrawFinished`, `featureFlags`, `allowsContextMenu`
  - `class LegacyInteractionModel implements MapInteractionModel`
  - `createFakeInteractionContext(overrides?)` test helper

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/google-maps/interaction/legacy-interaction-model.spec.ts`:

```ts
import { Polygon } from 'geojson'

import {
  isFeatureSelected,
  setFeatureSelected,
} from '../google-maps-feature-helpers'
import { createFakeInteractionContext } from '../testing/fake-interaction-context'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import { LegacyInteractionModel } from './legacy-interaction-model'

const drawn: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
      [1, 1],
    ],
  ],
}

describe('LegacyInteractionModel', () => {
  let model: LegacyInteractionModel

  beforeEach(() => {
    installFakeGoogleMaps()
    model = new LegacyInteractionModel()
  })
  afterEach(() => uninstallFakeGoogleMaps())

  it('selects the clicked feature', () => {
    const ctx = createFakeInteractionContext()
    const feature = ctx.addFeatureWithPolygon(drawn)
    model.onFeatureClick(feature, ctx)
    expect(ctx.selectGroup).toHaveBeenCalledWith(ctx.groups.keyOf(feature), feature)
  })

  it('clears selection on a map click', () => {
    const ctx = createFakeInteractionContext()
    model.onMapClick(ctx)
    expect(ctx.selectGroup).toHaveBeenCalledWith(null, null)
  })

  it('always arms geometry editing and always allows clicks', () => {
    const ctx = createFakeInteractionContext()
    const feature = ctx.addFeatureWithPolygon(drawn)
    expect(model.featureFlags(feature, ctx)).toEqual({
      geometryEditingArmed: true,
      clicksAllowed: true,
    })
  })

  it('creates a new ungrouped feature when a draw finishes', () => {
    const ctx = createFakeInteractionContext()
    expect(model.onDrawFinished(drawn, ctx)).toEqual({
      kind: 'newFeature',
      groupKey: null,
    })
  })

  it('cuts a hole when holes are allowed and a container exists', () => {
    const ctx = createFakeInteractionContext({ allowHoles: true })
    const container = ctx.addFeatureWithPolygon({
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
    })
    expect(model.onDrawFinished(drawn, ctx)).toEqual({
      kind: 'hole',
      target: container,
    })
  })

  it('does not cut a hole when holes are not allowed', () => {
    const ctx = createFakeInteractionContext({ allowHoles: false })
    ctx.addFeatureWithPolygon({
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
    })
    expect(model.onDrawFinished(drawn, ctx).kind).toBe('newFeature')
  })

  it('opens a context menu only for a selected feature', () => {
    const ctx = createFakeInteractionContext()
    const feature = ctx.addFeatureWithPolygon(drawn)
    expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    setFeatureSelected(feature, true)
    expect(model.allowsContextMenu(feature, ctx)).toBe(true)
    expect(isFeatureSelected(feature)).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts legacy-interaction-model`
Expected: FAIL — `Cannot find module './legacy-interaction-model'`.

- [ ] **Step 3: Write the interface**

Create `projects/ui-common/google-maps/interaction/map-interaction-model.ts`:

```ts
import { Polygon } from 'geojson'

import { FeatureGroupRegistry } from '../feature-groups/feature-group-registry'
import { TheSeamMapFeatureStyleContext } from '../feature-style/compute-feature-style'

/** Which interaction model a map uses. */
export type TheSeamMapInteractionMode = 'legacy' | 'grouped'

/** What an interaction model decides for a single feature's style. */
export type MapFeatureInteractionFlags = Pick<
  TheSeamMapFeatureStyleContext,
  'geometryEditingArmed' | 'clicksAllowed'
>

/** What the service should do with a finished drawing. */
export type MapDrawOutcome =
  | {
      kind: 'newFeature'
      /** The group to join, or null to start a new group. */
      groupKey: string | null
    }
  | { kind: 'hole'; target: google.maps.Data.Feature }

/**
 * What a model may ask of the map. Deliberately narrow: everything here is
 * trivially fakeable, which is what makes the models unit-testable.
 */
export interface MapInteractionContext {
  readonly groups: FeatureGroupRegistry
  readonly editingEnabled: boolean
  readonly allowHoles: boolean
  /** Whether the map is currently in edit mode. Always false in legacy. */
  readonly editMode: boolean
  /** The selected group key, or null. */
  getSelectedKey(): string | null
  /**
   * Select a group and note which feature the interaction landed on. Passing
   * null for the key clears the selection.
   */
  selectGroup(
    key: string | null,
    feature: google.maps.Data.Feature | null,
  ): void
  /** Begin polygon drawing. */
  startDrawing(): void
  /**
   * An existing feature that fully contains `polygon`, restricted to a group
   * when `groupKey` is given. Matches any part of a MultiPolygon.
   */
  findContainingFeature(
    polygon: Polygon,
    groupKey?: string,
  ): google.maps.Data.Feature | undefined
}

/**
 * The behaviour that differs between the single-boundary map this module was
 * built for and the multi-field map it now also has to be.
 *
 * Implementations answer five questions and hold no Maps API state of their
 * own; `GoogleMapsService` keeps owning the plumbing.
 */
export interface MapInteractionModel {
  readonly id: TheSeamMapInteractionMode

  /** A click landed on a feature. */
  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void

  /** A click landed on the map, not on a feature. */
  onMapClick(context: MapInteractionContext): void

  /** A drawing was completed. */
  onDrawFinished(
    polygon: Polygon,
    context: MapInteractionContext,
  ): MapDrawOutcome

  /** Interaction flags for one feature, fed into `computeFeatureStyle`. */
  featureFlags(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): MapFeatureInteractionFlags

  /** Whether a right-click on this feature opens the context menu. */
  allowsContextMenu(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): boolean
}
```

- [ ] **Step 4: Write the legacy model**

Create `projects/ui-common/google-maps/interaction/legacy-interaction-model.ts`:

```ts
import { Polygon } from 'geojson'

import { isFeatureSelected } from '../google-maps-feature-helpers'
import {
  MapDrawOutcome,
  MapFeatureInteractionFlags,
  MapInteractionContext,
  MapInteractionModel,
} from './map-interaction-model'

/**
 * The behaviour this module has always had: one boundary, clicking a feature
 * selects it and arms its handles, and the draw button toggles drawing.
 *
 * Two applications depend on this and are not being updated, so it must not
 * drift. Every decision here mirrors the pre-strategy service exactly.
 */
export class LegacyInteractionModel implements MapInteractionModel {
  readonly id = 'legacy' as const

  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void {
    context.selectGroup(context.groups.keyOf(feature), feature)
  }

  onMapClick(context: MapInteractionContext): void {
    context.selectGroup(null, null)
  }

  onDrawFinished(
    polygon: Polygon,
    context: MapInteractionContext,
  ): MapDrawOutcome {
    const target = context.allowHoles
      ? context.findContainingFeature(polygon)
      : undefined
    return target ? { kind: 'hole', target } : { kind: 'newFeature', groupKey: null }
  }

  featureFlags(): MapFeatureInteractionFlags {
    // Selection alone arms handles here; `editingEnabled` is the only gate,
    // and `computeFeatureStyle` applies it.
    return { geometryEditingArmed: true, clicksAllowed: true }
  }

  allowsContextMenu(feature: google.maps.Data.Feature): boolean {
    return isFeatureSelected(feature)
  }
}
```

- [ ] **Step 5: Write the fake context**

Create `projects/ui-common/google-maps/testing/fake-interaction-context.ts`:

```ts
import { Polygon } from 'geojson'

import { FeatureGroupRegistry } from '../feature-groups/feature-group-registry'
import {
  dataPolygonFromGeoJson,
  polygonsFromDataFeature,
} from '../google-maps-feature-helpers'
import { MapInteractionContext } from '../interaction/map-interaction-model'
import { FakeData } from './fake-google-maps'

import { polygonContains } from '@theseam/ui-common/utils'

export interface FakeInteractionContext extends MapInteractionContext {
  data: FakeData
  selectGroup: jest.Mock
  startDrawing: jest.Mock
  /** Add a feature with the given geometry to the fake data layer. */
  addFeatureWithPolygon(
    polygon: Polygon,
    properties?: Record<string, any>,
  ): google.maps.Data.Feature
  /** Set what `getSelectedKey()` returns. */
  setSelectedKey(key: string | null): void
}

/**
 * A `MapInteractionContext` backed by the fake data layer, with the two
 * side-effecting methods as jest mocks so specs can assert on them.
 */
export function createFakeInteractionContext(
  overrides: Partial<{
    editingEnabled: boolean
    allowHoles: boolean
    editMode: boolean
    groupProperty: string
  }> = {},
): FakeInteractionContext {
  const data = new FakeData()
  const groups = new FeatureGroupRegistry(data as any, {
    groupProperty: overrides.groupProperty,
    newGroupKeyFactory: (() => {
      let seq = 0
      return () => `new-${seq++}`
    })(),
  })

  let selectedKey: string | null = null

  const context: FakeInteractionContext = {
    data,
    groups,
    editingEnabled: overrides.editingEnabled ?? true,
    allowHoles: overrides.allowHoles ?? false,
    editMode: overrides.editMode ?? false,
    getSelectedKey: () => selectedKey,
    setSelectedKey: (key) => {
      selectedKey = key
    },
    selectGroup: jest.fn((key: string | null) => {
      selectedKey = key
    }),
    startDrawing: jest.fn(),
    findContainingFeature: (polygon, groupKey) => {
      let match: google.maps.Data.Feature | undefined
      data.forEach((feature: any) => {
        if (match) {
          return
        }
        if (groupKey !== undefined && groups.keyOf(feature) !== groupKey) {
          return
        }
        const contains = polygonsFromDataFeature(feature).some((part) =>
          polygonContains(part, polygon),
        )
        if (contains) {
          match = feature
        }
      })
      return match
    },
    addFeatureWithPolygon: (polygon, properties = {}) =>
      data.add(
        new google.maps.Data.Feature({
          geometry: dataPolygonFromGeoJson(polygon),
          properties,
        }),
      ),
  }

  return context
}
```

- [ ] **Step 6: Export the test helper**

In `projects/ui-common/google-maps/testing/public-api.ts`:

```ts
export * from './fake-google-maps'
export * from './fake-interaction-context'
```

- [ ] **Step 7: Run to verify the tests pass**

Run: `npx jest --config projects/ui-common/jest.config.ts legacy-interaction-model`
Expected: PASS, 7 tests.

- [ ] **Step 8: Export the interaction types**

In `projects/ui-common/google-maps/public-api.ts`, add:

```ts
export * from './interaction/map-interaction-model'
export * from './interaction/legacy-interaction-model'
```

- [ ] **Step 9: Commit**

```bash
git add projects/ui-common/google-maps/interaction projects/ui-common/google-maps/testing projects/ui-common/google-maps/public-api.ts
git commit -m "refactor(google-maps): extract the interaction model behind a strategy"
```

---

### Task 7: The grouped interaction model

**Files:**

- Create: `projects/ui-common/google-maps/interaction/grouped-interaction-model.ts`
- Test: `projects/ui-common/google-maps/interaction/grouped-interaction-model.spec.ts`
- Modify: `projects/ui-common/google-maps/public-api.ts`

**Interfaces:**

- Consumes: `MapInteractionModel`, `MapInteractionContext`, `createFakeInteractionContext` (Task 6).
- Produces: `class GroupedInteractionModel implements MapInteractionModel`.

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/google-maps/interaction/grouped-interaction-model.spec.ts`:

```ts
import { Polygon } from 'geojson'

import { createFakeInteractionContext } from '../testing/fake-interaction-context'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import { GroupedInteractionModel } from './grouped-interaction-model'

const big: Polygon = {
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

const small: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
      [1, 1],
    ],
  ],
}

const far: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [50, 50],
      [50, 51],
      [51, 51],
      [51, 50],
      [50, 50],
    ],
  ],
}

describe('GroupedInteractionModel', () => {
  let model: GroupedInteractionModel

  beforeEach(() => {
    installFakeGoogleMaps()
    model = new GroupedInteractionModel()
  })
  afterEach(() => uninstallFakeGoogleMaps())

  describe('edit mode off', () => {
    it('selects the clicked feature group', () => {
      const ctx = createFakeInteractionContext({ groupProperty: 'fieldId' })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      model.onFeatureClick(feature, ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith('A', feature)
    })

    it('clears selection on a map click', () => {
      const ctx = createFakeInteractionContext()
      model.onMapClick(ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith(null, null)
      expect(ctx.startDrawing).not.toHaveBeenCalled()
    })

    it('allows clicks and does not arm geometry editing', () => {
      const ctx = createFakeInteractionContext({ groupProperty: 'fieldId' })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.featureFlags(feature, ctx)).toEqual({
        geometryEditingArmed: false,
        clicksAllowed: true,
      })
    })
  })

  describe('edit mode on, nothing selected', () => {
    it('starts a draw on a map click', () => {
      const ctx = createFakeInteractionContext({ editMode: true })
      model.onMapClick(ctx)
      expect(ctx.startDrawing).toHaveBeenCalled()
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })

    it('makes every feature ignore clicks', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.featureFlags(feature, ctx).clicksAllowed).toBe(false)
    })

    it('creates a new group when a draw finishes', () => {
      const ctx = createFakeInteractionContext({ editMode: true })
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'newFeature',
        groupKey: null,
      })
    })

    it('does not cut a hole in an unrelated field', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        allowHoles: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      // `small` is inside `big`, but nothing is selected, so the containment
      // search must not run at all.
      expect(model.onDrawFinished(small, ctx).kind).toBe('newFeature')
    })
  })

  describe('edit mode on, a group selected', () => {
    it('arms geometry editing for the selected group only', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const selected = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      const other = ctx.addFeatureWithPolygon(far, { fieldId: 'B' })
      ctx.setSelectedKey('A')

      expect(model.featureFlags(selected, ctx)).toEqual({
        geometryEditingArmed: true,
        clicksAllowed: true,
      })
      expect(model.featureFlags(other, ctx).clicksAllowed).toBe(false)
    })

    it('joins a drawn polygon to the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(far, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'newFeature',
        groupKey: 'A',
      })
    })

    it('cuts a hole when the drawing is inside the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        allowHoles: true,
        groupProperty: 'fieldId',
      })
      const container = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'hole',
        target: container,
      })
    })

    it('does not cut a hole into a different group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        allowHoles: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'B' })
      ctx.addFeatureWithPolygon(far, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'newFeature',
        groupKey: 'A',
      })
    })

    it('updates the focused feature when clicking within the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      model.onFeatureClick(feature, ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith('A', feature)
    })

    it('ignores clicks on features outside the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      const other = ctx.addFeatureWithPolygon(far, { fieldId: 'B' })
      ctx.setSelectedKey('A')
      model.onFeatureClick(other, ctx)
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })
  })

  it('always allows the context menu', () => {
    const ctx = createFakeInteractionContext({ groupProperty: 'fieldId' })
    const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
    expect(model.allowsContextMenu(feature, ctx)).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts grouped-interaction-model`
Expected: FAIL — `Cannot find module './grouped-interaction-model'`.

- [ ] **Step 3: Write the model**

Create `projects/ui-common/google-maps/interaction/grouped-interaction-model.ts`:

```ts
import { Polygon } from 'geojson'

import {
  MapDrawOutcome,
  MapFeatureInteractionFlags,
  MapInteractionContext,
  MapInteractionModel,
} from './map-interaction-model'

/**
 * Multi-field behaviour, where selection and geometry editing are separate
 * concerns.
 *
 * With edit mode off, clicking a polygon selects its whole group and mutates
 * nothing — the point being that a stray click can never nudge a vertex on an
 * imported boundary, which is close to unrecoverable without an undo feature.
 *
 * With edit mode on, the selected group is editable and a click on open map
 * starts a new drawing. Existing polygons stop taking clicks so that a click
 * never means both "select this" and "place a vertex". The cost is that
 * switching fields requires leaving edit mode, which is deliberate.
 */
export class GroupedInteractionModel implements MapInteractionModel {
  readonly id = 'grouped' as const

  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void {
    const key = context.groups.keyOf(feature)

    if (!context.editMode) {
      context.selectGroup(key, feature)
      return
    }

    // In edit mode, other groups are non-clickable, so this can only be the
    // selected group. Note which polygon was touched, since `Delete` acts on
    // that one alone. Google's vertex editor still receives the click.
    if (key === context.getSelectedKey()) {
      context.selectGroup(key, feature)
    }
  }

  onMapClick(context: MapInteractionContext): void {
    if (context.editMode) {
      context.startDrawing()
      return
    }
    context.selectGroup(null, null)
  }

  onDrawFinished(
    polygon: Polygon,
    context: MapInteractionContext,
  ): MapDrawOutcome {
    const selectedKey = context.getSelectedKey()

    if (selectedKey === null) {
      // No selection means no field to cut into. Skipping the containment
      // search entirely is what stops a polygon drawn over an unrelated field
      // from punching a hole in it.
      return { kind: 'newFeature', groupKey: null }
    }

    if (context.allowHoles) {
      const target = context.findContainingFeature(polygon, selectedKey)
      if (target) {
        return { kind: 'hole', target }
      }
    }

    return { kind: 'newFeature', groupKey: selectedKey }
  }

  featureFlags(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): MapFeatureInteractionFlags {
    if (!context.editMode) {
      return { geometryEditingArmed: false, clicksAllowed: true }
    }

    const selectedKey = context.getSelectedKey()
    const isSelectedGroup =
      selectedKey !== null && context.groups.keyOf(feature) === selectedKey

    return {
      geometryEditingArmed: isSelectedGroup,
      clicksAllowed: isSelectedGroup,
    }
  }

  allowsContextMenu(): boolean {
    return true
  }
}
```

- [ ] **Step 4: Run to verify the tests pass**

Run: `npx jest --config projects/ui-common/jest.config.ts grouped-interaction-model`
Expected: PASS, 13 tests.

- [ ] **Step 5: Export it**

In `projects/ui-common/google-maps/public-api.ts`, add:

```ts
export * from './interaction/grouped-interaction-model'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/google-maps/interaction projects/ui-common/google-maps/public-api.ts
git commit -m "feat(google-maps): add the grouped interaction model"
```

---

### Task 8: Wire the models into GoogleMapsService

Replaces the inline listener bodies with delegation to a model, and adds selection state at group granularity.

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps.service.ts`

**Interfaces:**

- Consumes: everything from Tasks 4-7.
- Produces, on `GoogleMapsService`:
  - `setInteractionMode(mode: TheSeamMapInteractionMode): void`
  - `setGroupOptions(options: FeatureGroupRegistryOptions): void`
  - `readonly selection$: Observable<TheSeamMapGroupTarget | null>`
  - `readonly hover$: Observable<TheSeamMapGroupTarget | null>`
  - `readonly editMode$: Observable<boolean>`
  - `setEditMode(enabled: boolean): void`, `isEditMode(): boolean`
  - `selectGroup(key: string | null): boolean`, `clearSelection(): void`
  - `getGroups(): TheSeamMapFeatureGroup[]`
  - `fitGroup(key, padding?): boolean`, `panToGroup(key): boolean`
  - `deleteFocusedFeature(): void`
  - `handleEscape(): void`

- [ ] **Step 1: Replace the style and click listeners with model delegation**

In `projects/ui-common/google-maps/google-maps.service.ts`:

Remove the local `FEATURE_STYLE_OPTIONS_DEFAULT`, `FEATURE_STYLE_OPTIONS_SELECTED`, `FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED`, `SUPPORTED_PROPERTY_STYLE_OPTIONS` constants and the private `_mergeStyleOptions` method — they now live in `feature-style/compute-feature-style.ts` (Task 5).

Add these imports:

```ts
import {
  computeFeatureHoverStyle,
  computeFeatureStyle,
} from './feature-style/compute-feature-style'
import {
  FeatureGroupRegistry,
  FeatureGroupRegistryOptions,
} from './feature-groups/feature-group-registry'
import {
  TheSeamMapFeatureGroup,
  TheSeamMapGroupTarget,
} from './feature-groups/feature-group'
import { GroupedInteractionModel } from './interaction/grouped-interaction-model'
import { LegacyInteractionModel } from './interaction/legacy-interaction-model'
import {
  MapInteractionContext,
  MapInteractionModel,
  TheSeamMapInteractionMode,
} from './interaction/map-interaction-model'
import {
  polygonsFromDataFeature,
} from './google-maps-feature-helpers'
```

Add fields near the other private state:

```ts
  private _model: MapInteractionModel = new LegacyInteractionModel()
  private _groups?: FeatureGroupRegistry
  private _groupOptions: FeatureGroupRegistryOptions = {}
  private _focusedFeature: google.maps.Data.Feature | null = null

  private readonly _selectionSubject =
    new BehaviorSubject<TheSeamMapGroupTarget | null>(null)
  public readonly selection$ = this._selectionSubject.asObservable()

  private readonly _hoverSubject =
    new BehaviorSubject<TheSeamMapGroupTarget | null>(null)
  public readonly hover$ = this._hoverSubject.asObservable()

  private readonly _editModeSubject = new BehaviorSubject<boolean>(false)
  public readonly editMode$ = this._editModeSubject.asObservable()
```

- [ ] **Step 2: Add the mode and group configuration methods**

```ts
  public setInteractionMode(mode: TheSeamMapInteractionMode): void {
    this._model =
      mode === 'grouped'
        ? new GroupedInteractionModel()
        : new LegacyInteractionModel()
    if (mode !== 'grouped') {
      this._editModeSubject.next(false)
    }
    this._refreshStyles()
  }

  public setGroupOptions(options: FeatureGroupRegistryOptions): void {
    this._groupOptions = options
    this._groups?.setOptions(options)
    this._refreshStyles()
  }

  public isEditMode(): boolean {
    return this._editModeSubject.value
  }

  public setEditMode(enabled: boolean): void {
    if (this._model.id !== 'grouped' || enabled === this.isEditMode()) {
      return
    }
    if (!enabled) {
      this.stopDrawing()
    }
    this._editModeSubject.next(enabled)
    this._refreshStyles()
  }

  /**
   * Re-run the style callback for every feature.
   *
   * Google re-evaluates the callback whenever the style is set, so handing
   * back the same stored function is enough to repaint after a mode change.
   */
  private _refreshStyles(): void {
    if (!this.mapReady || !this._styleFn) {
      return
    }
    this._assertInitialized()
    this.googleMap.data.setStyle(this._styleFn)
  }
```

Add the field alongside the others declared in Step 1:

```ts
  private _styleFn?: google.maps.Data.StylingFunction
```

- [ ] **Step 3: Build the interaction context**

```ts
  private get _registry(): FeatureGroupRegistry {
    this._assertInitialized()
    if (!this._groups) {
      this._groups = new FeatureGroupRegistry(
        this.googleMap.data,
        this._groupOptions,
      )
    }
    return this._groups
  }

  private _interactionContext(): MapInteractionContext {
    return {
      groups: this._registry,
      editingEnabled: this.isEditingEnabled(),
      allowHoles: this._allowDrawingHoleInPolygon,
      editMode: this.isEditMode(),
      getSelectedKey: () => this._selectionSubject.value?.group.key ?? null,
      selectGroup: (key, feature) => this._applySelection(key, feature),
      startDrawing: () => this.startDrawing(),
      findContainingFeature: (polygon, groupKey) =>
        this._findContainingFeature(polygon, groupKey),
    }
  }

  private _findContainingFeature(
    polygon: Polygon,
    groupKey?: string,
  ): google.maps.Data.Feature | undefined {
    this._assertInitialized()
    let match: google.maps.Data.Feature | undefined
    this.googleMap.data.forEach((feature) => {
      if (match) {
        return
      }
      if (
        groupKey !== undefined &&
        this._registry.keyOf(feature) !== groupKey
      ) {
        return
      }
      const contains = polygonsFromDataFeature(feature).some((part) =>
        polygonContains(part, polygon),
      )
      if (contains) {
        match = feature
      }
    })
    return match
  }
```

- [ ] **Step 4: Implement selection at group granularity**

```ts
  private _applySelection(
    key: string | null,
    feature: google.maps.Data.Feature | null,
  ): void {
    this._assertInitialized()

    this._focusedFeature = feature
    const selectedFeatures =
      key === null ? [] : this._registry.featuresIn(key)

    this.googleMap.data.forEach((f) => {
      const shouldSelect = selectedFeatures.indexOf(f) !== -1
      if (isFeatureSelected(f) !== shouldSelect) {
        setFeatureSelected(f, shouldSelect)
      }
    })

    if (key === null) {
      this._selectionSubject.next(null)
      return
    }

    const resolved = this._registry.groupWithSources(key)
    if (!resolved) {
      this._selectionSubject.next(null)
      return
    }
    this._selectionSubject.next(this._targetFor(resolved, feature))
  }

  /**
   * Pair a group with the emitted GeoJSON for one of its `Data.Feature`s.
   *
   * Indexes into the returned source array rather than `featuresIn()`, because
   * a feature with unsupported geometry is dropped from the emitted list and
   * would shift every index after it.
   */
  private _targetFor(
    resolved: {
      group: TheSeamMapFeatureGroup
      sources: google.maps.Data.Feature[]
    },
    feature: google.maps.Data.Feature | null,
  ): TheSeamMapGroupTarget {
    const index = feature ? resolved.sources.indexOf(feature) : -1
    return {
      group: resolved.group,
      feature: index === -1 ? null : resolved.group.features[index],
    }
  }

  public selectGroup(key: string | null): boolean {
    this._assertInitialized()
    if (key === null) {
      this._applySelection(null, null)
      return true
    }
    const features = this._registry.featuresIn(key)
    if (features.length === 0) {
      return false
    }
    this._applySelection(key, features[0])
    return true
  }

  public clearSelection(): void {
    this._applySelection(null, null)
  }

  public getGroups(): TheSeamMapFeatureGroup[] {
    return this._registry.groups()
  }

  private _boundsForGroup(key: string): google.maps.LatLngBounds | undefined {
    const features = this._registry.featuresIn(key)
    if (features.length === 0) {
      return undefined
    }
    const bounds = new google.maps.LatLngBounds()
    features.forEach((f) =>
      f.getGeometry()?.forEachLatLng((latLng) => bounds.extend(latLng)),
    )
    return bounds
  }

  public fitGroup(
    key: string,
    padding?: number | google.maps.Padding,
  ): boolean {
    this._assertInitialized()
    const bounds = this._boundsForGroup(key)
    if (!bounds) {
      return false
    }
    this.googleMap.fitBounds(bounds, padding ?? this._padding)
    return true
  }

  public panToGroup(key: string): boolean {
    this._assertInitialized()
    const bounds = this._boundsForGroup(key)
    if (!bounds) {
      return false
    }
    this.googleMap.panTo(bounds.getCenter())
    return true
  }

  /** Delete only the polygon the last interaction landed on. */
  public deleteFocusedFeature(): void {
    this._assertInitialized()
    if (!this._focusedFeature) {
      this.deleteSelection()
      return
    }
    this.googleMap.data.remove(this._focusedFeature)
    this._focusedFeature = null
  }

  /** Escape cascades: cancel a draw, then clear selection, then leave edit mode. */
  public handleEscape(): void {
    if (this.isDrawing()) {
      this.stopDrawing()
      return
    }
    if (this._selectionSubject.value !== null) {
      this.clearSelection()
      return
    }
    if (this.isEditMode()) {
      this.setEditMode(false)
    }
  }
```

- [ ] **Step 5: Rewrite `_initFeatureStyling` to delegate**

Replace the body of `_initFeatureStyling` with:

```ts
  private _initFeatureStyling(): void {
    this._assertInitialized()

    this.googleMap.addListener('click', () => {
      this._model.onMapClick(this._interactionContext())
    })

    this._styleFn = (feature) =>
      computeFeatureStyle(feature, {
        editingEnabled: this.isEditingEnabled(),
        ...this._model.featureFlags(feature, this._interactionContext()),
      })
    this.googleMap.data.setStyle(this._styleFn)

    this.googleMap.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        // While drawing, a click on a polygon is placing a vertex.
        if (this.isDrawing()) {
          return
        }
        this._model.onFeatureClick(event.feature, this._interactionContext())
      },
    )

    this.googleMap.data.addListener(
      'mouseover',
      (event: google.maps.Data.MouseEvent) => {
        this._assertInitialized()
        this.googleMap.data.revertStyle()

        if (!this.isDrawing() && !isFeatureSelected(event.feature)) {
          this.setFeatureHoveredStyleOverride(event.feature)
        }

        const resolved = this._registry.groupWithSources(
          this._registry.keyOf(event.feature),
        )
        this._hoverSubject.next(
          resolved ? this._targetFor(resolved, event.feature) : null,
        )
      },
    )

    this.googleMap.data.addListener('mouseout', () => {
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      this._hoverSubject.next(null)
    })
  }

  public setFeatureHoveredStyleOverride(feature: google.maps.Data.Feature) {
    this._assertInitialized()
    this.googleMap.data.overrideStyle(feature, computeFeatureHoverStyle(feature))
  }
```

- [ ] **Step 6: Delegate the context menu gate**

In `_initFeatureChangeListeners`, replace the `contextmenu` listener body:

```ts
    this.googleMap.data.addListener(
      'contextmenu',
      (event: google.maps.Data.MouseEvent) => {
        if (!this._model.allowsContextMenu(event.feature, this._interactionContext())) {
          return
        }
        this._focusedFeature = event.feature
        this._openContextMenuForFeature(event.feature, event.latLng ?? undefined)
      },
    )
```

- [ ] **Step 7: Delegate draw completion**

Replace the body of `_onDrawFinished` after the `polygonHasMinDistinctVertices` guard:

```ts
    this._assertInitialized()

    const context = this._interactionContext()
    const outcome = this._model.onDrawFinished(drawn, context)

    if (outcome.kind === 'hole') {
      const parts = polygonsFromDataFeature(outcome.target)
      const containingIndex = parts.findIndex((part) =>
        polygonContains(part, drawn),
      )
      if (containingIndex !== -1) {
        parts[containingIndex] = addHoleToPolygon(parts[containingIndex], drawn)
        // Mutate the EXISTING feature to preserve its identity and properties.
        outcome.target.setGeometry(
          parts.length === 1
            ? dataPolygonFromGeoJson(parts[0])
            : dataMultiPolygonFromGeoJson({
                type: 'MultiPolygon',
                coordinates: parts.map((p) => p.coordinates),
              }),
        )
        this._applySelection(
          this._registry.keyOf(outcome.target),
          outcome.target,
        )
        return
      }
    }

    const newFeature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(drawn),
    })
    this.googleMap.data.add(newFeature)

    const key =
      outcome.kind === 'newFeature' && outcome.groupKey !== null
        ? (this._registry.assignKey(newFeature, outcome.groupKey),
          outcome.groupKey)
        : this._registry.assignNewKey(newFeature)

    this._applySelection(key, newFeature)
```

Add the imports this needs:

```ts
import {
  dataMultiPolygonFromGeoJson,
  dataPolygonFromGeoJson,
} from './google-maps-feature-helpers'
```

`addHoleToPolygon` and `polygonContains` are already imported from `@theseam/ui-common/utils`. Remove the now-unused `geoJsonPolygonFromDataFeature` and `_getPossibleExteriorFeature` — the containment search lives in `_findContainingFeature` and handles MultiPolygon.

- [ ] **Step 8: Keep `setEditingEnabled` consistent**

In `setEditingEnabled`, replace the deselect loop with the group-aware equivalent:

```ts
      if (!enabled) {
        this.stopDrawing()
        this.setEditMode(false)
        this.clearSelection()
      }
```

- [ ] **Step 9: Type-check and run the full suite**

Run: `npm run build:ui-common`
Expected: build succeeds. Fix any type errors before continuing.

Run: `npm run test:ci`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.service.ts
git commit -m "feat(google-maps): delegate interaction decisions to the model and track group selection"
```

---

### Task 9: Component inputs, outputs, and programmatic API

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.ts`

**Interfaces:**

- Consumes: Task 8's service API.
- Produces, on `TheSeamGoogleMapsComponent`: the inputs `interactionMode`, `featureGroupProperty`, `featureLabelProperty`, `newGroupKeyFactory`, `selectedGroupKey`; the outputs `selectionChange`, `featureHoverChange`; and the methods `selectGroup`, `clearSelection`, `fitGroup`, `panToGroup`, `getGroups`, `setEditMode`, `isEditMode`.

- [ ] **Step 1: Add the inputs**

Add near the existing inputs:

```ts
  /**
   * Which interaction model the map uses.
   *
   * `'legacy'` is the single-boundary behaviour this component has always had
   * and is the default, so existing consumers are unaffected. `'grouped'`
   * separates selection from geometry editing; see the design doc.
   */
  @Input() interactionMode: TheSeamMapInteractionMode = 'legacy'

  /**
   * Name of the GeoJSON property that groups features into one logical thing,
   * such as a field. Features sharing a value select, style, and edit together.
   * Unset means every feature is its own group.
   */
  @Input() featureGroupProperty: string | undefined

  /** Name of the GeoJSON property holding a group's label text. */
  @Input() featureLabelProperty: string | undefined

  /**
   * Generates the key written to `featureGroupProperty` for a newly drawn
   * group. Consumer-supplied so the format is one the app recognises.
   */
  @Input() newGroupKeyFactory: (() => string) | undefined

  /** Preselect a group. Applied on map-ready and after each external value write. */
  @Input() selectedGroupKey: string | null = null
```

Add the import:

```ts
import { TheSeamMapInteractionMode } from '../interaction/map-interaction-model'
import { TheSeamMapFeatureGroup, TheSeamMapGroupTarget } from '../feature-groups/feature-group'
```

- [ ] **Step 2: Add the outputs**

```ts
  @Output() selectionChange = new EventEmitter<TheSeamMapGroupTarget | null>()
  @Output() featureHoverChange = new EventEmitter<TheSeamMapGroupTarget | null>()
```

Wire them in the constructor, after the existing subscriptions:

```ts
    this._googleMaps.selection$
      .pipe(
        tap((selection) => this.selectionChange.emit(selection)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    this._googleMaps.hover$
      .pipe(
        tap((hover) => this.featureHoverChange.emit(hover)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()
```

- [ ] **Step 3: Apply the inputs in `ngOnChanges`**

Add to `ngOnChanges`:

```ts
    if (Object.prototype.hasOwnProperty.call(changes, 'interactionMode')) {
      this._googleMaps.setInteractionMode(this.interactionMode)
    }

    if (
      Object.prototype.hasOwnProperty.call(changes, 'featureGroupProperty') ||
      Object.prototype.hasOwnProperty.call(changes, 'newGroupKeyFactory')
    ) {
      this._googleMaps.setGroupOptions({
        groupProperty: this.featureGroupProperty,
        newGroupKeyFactory: this.newGroupKeyFactory,
      })
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'selectedGroupKey')) {
      this._applySelectedGroupKey()
    }
```

And the helper, which is also called on map-ready and after external value writes — never on every change-detection pass, so it cannot fight a user's click:

```ts
  private _applySelectedGroupKey(): void {
    if (!this._googleMaps.mapReady) {
      return
    }
    if (this.selectedGroupKey === null) {
      this._googleMaps.clearSelection()
      return
    }
    if (!this._googleMaps.selectGroup(this.selectedGroupKey)) {
      // The named group is not in the current value. Clearing keeps the map
      // and the consumer's expectation from silently diverging.
      this._googleMaps.clearSelection()
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[seam-google-maps] selectedGroupKey "${this.selectedGroupKey}" ` +
            `matches no group in the current value.`,
        )
      }
    }
  }
```

Add at the top of the file, below the imports:

```ts
declare const ngDevMode: boolean | undefined
```

- [ ] **Step 4: Re-apply preselection after external value writes**

In the constructor's `_mapValueManager.valueChanged` subscription, extend the second `tap`:

```ts
        tap((changed) => {
          if (
            this._googleMaps.mapReady &&
            changed.source !== MapValueSource.FeatureChange
          ) {
            this._googleMaps.setData(changed.value)
            this._applySelectedGroupKey()
          }
        }),
```

- [ ] **Step 5: Apply on map-ready**

In `_onMapReady`, inside the `idle` listener, after `reCenterOnFeatures()`:

```ts
      this._googleMaps.setInteractionMode(this.interactionMode)
      this._googleMaps.setGroupOptions({
        groupProperty: this.featureGroupProperty,
        newGroupKeyFactory: this.newGroupKeyFactory,
      })
      this._applySelectedGroupKey()
```

- [ ] **Step 6: Add the programmatic methods**

```ts
  /** Select a group by key. Returns false when no such group exists. */
  public selectGroup(key: string): boolean {
    return this._googleMaps.selectGroup(key)
  }

  public clearSelection(): void {
    this._googleMaps.clearSelection()
  }

  /** Fit the viewport to a group. Returns false when no such group exists. */
  public fitGroup(
    key: string,
    padding?: number | google.maps.Padding,
  ): boolean {
    return this._googleMaps.fitGroup(key, padding)
  }

  /** Pan to a group's centre. Returns false when no such group exists. */
  public panToGroup(key: string): boolean {
    return this._googleMaps.panToGroup(key)
  }

  public getGroups(): TheSeamMapFeatureGroup[] {
    return this._googleMaps.getGroups()
  }

  public setEditMode(enabled: boolean): void {
    this._googleMaps.setEditMode(enabled)
  }

  public isEditMode(): boolean {
    return this._googleMaps.isEditMode()
  }
```

- [ ] **Step 7: Update the keyboard handler**

In `ngOnInit`, replace the `Delete` and `Escape` cases:

```ts
            case 'Delete':
              if (this._googleMaps.isEditingEnabled()) {
                if (this.interactionMode === 'grouped') {
                  this._googleMaps.deleteFocusedFeature()
                } else {
                  this._googleMaps.deleteSelection()
                }
                event.preventDefault()
                event.stopPropagation()
              }
              break
            case 'Escape':
              this._googleMaps.handleEscape()
              event.preventDefault()
              event.stopPropagation()
              break
```

- [ ] **Step 8: Add the static input coercion declarations**

```ts
  static ngAcceptInputType_selectedGroupKey: string | null
```

- [ ] **Step 9: Build and test**

Run: `npm run build:ui-common`
Expected: build succeeds.

Run: `npm run test:ci`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add projects/ui-common/google-maps/google-maps/google-maps.component.ts
git commit -m "feat(google-maps): expose grouped interaction inputs, outputs, and programmatic selection"
```

---

### Task 10: Edit-mode button and context menu items

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps-draw-button-control/google-maps-draw-button-control.component.ts`
- Modify: `projects/ui-common/google-maps/google-maps.service.ts` (expose `interactionMode$`)
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.ts` (context menu items)

**Interfaces:**

- Consumes: `setEditMode`/`isEditMode`/`editMode$` (Task 8).
- Produces: `GoogleMapsService.interactionMode$: Observable<TheSeamMapInteractionMode>`.

- [ ] **Step 1: Expose the mode as an observable**

In `google-maps.service.ts`, keep the `_model` field and add a subject beside it so controls can react to the mode:

```ts
  private readonly _interactionModeSubject =
    new BehaviorSubject<TheSeamMapInteractionMode>('legacy')
  public readonly interactionMode$ = this._interactionModeSubject.asObservable()
```

and set it inside `setInteractionMode`:

```ts
    this._interactionModeSubject.next(mode)
```

- [ ] **Step 2: Make the button follow the model**

Replace the body of `TheSeamGoogleMapsDrawButtonControlComponent`:

```ts
export class TheSeamGoogleMapsDrawButtonControlComponent {
  private readonly _googleMaps = inject(GoogleMapsService)
  private readonly _data = inject<GoogleMapsDrawButtonControlData>(
    MAP_CONTROL_DATA,
    { optional: true },
  )

  private readonly _mode = toSignal(this._googleMaps.interactionMode$, {
    initialValue: 'legacy' as const,
  })

  private readonly _drawing = toSignal(this._googleMaps.drawing$, {
    initialValue: false,
  })

  private readonly _editMode = toSignal(this._googleMaps.editMode$, {
    initialValue: false,
  })

  /**
   * In 'legacy' the button toggles drawing directly. In 'grouped' it toggles
   * edit mode, which is what makes a click on open map begin a drawing.
   */
  protected readonly _active = computed(() =>
    this._mode() === 'grouped' ? this._editMode() : this._drawing(),
  )

  protected readonly _label = computed(
    () =>
      this._data?.label ??
      (this._mode() === 'grouped' ? 'Edit Fields' : 'Draw Field'),
  )

  get label(): string {
    return this._label()
  }

  icon: SeamIcon = this._data?.icon ?? faDrawPolygon

  _onClick() {
    if (this._mode() === 'grouped') {
      this._googleMaps.setEditMode(!this._googleMaps.isEditMode())
      return
    }
    if (this._googleMaps.isDrawing()) {
      this._googleMaps.stopDrawing()
    } else {
      this._googleMaps.startDrawing()
    }
  }
}
```

Add `computed` to the `@angular/core` import.

- [ ] **Step 3: Update the context menu items**

In `google-maps.component.ts`, replace the `_contextMenuItems$` construction:

```ts
    this._contextMenuItems$ = combineLatest([
      this._googleMaps.editingEnabled$,
      this._googleMaps.selection$,
    ]).pipe(
      map(([enabled, selection]) => {
        const items: TheSeamMapContextMenuItem[] = []
        if (!enabled) {
          return items
        }
        if (this.interactionMode === 'grouped') {
          items.push({
            label: 'Delete Polygon',
            action: () => this._googleMaps.deleteFocusedFeature(),
          })
          if ((selection?.group.features.length ?? 0) > 1) {
            items.push({
              label: 'Delete Field',
              action: () => this._googleMaps.deleteSelection(),
            })
          }
          return items
        }
        items.push({
          label: 'Delete',
          action: () => this._onClickDeleteFeature(),
        })
        return items
      }),
      tap((items) => {
        if (items.length === 0) {
          this._googleMaps.setFeatureContextMenu(null)
        } else {
          this._googleMaps.setFeatureContextMenu(this.featureContextMenu)
        }
      }),
    )
```

Add `combineLatest` to the rxjs import.

- [ ] **Step 4: Build and test**

Run: `npm run build:ui-common && npm run test:ci`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/google-maps-draw-button-control projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/google-maps/google-maps.component.ts
git commit -m "feat(google-maps): toggle edit mode from the draw control and split the delete menu items"
```

---

### Task 11: Polygon labels

`label` in `SUPPORTED_PROPERTY_STYLE_OPTIONS` is silently inert on polygons — Google's Data layer honours it only on Points.

**Files:**

- Create: `projects/ui-common/google-maps/labels/label-visibility.ts`
- Create: `projects/ui-common/google-maps/labels/map-feature-labels-overlay.ts`
- Test: `projects/ui-common/google-maps/labels/label-visibility.spec.ts`
- Modify: `projects/ui-common/google-maps/google-maps.service.ts`
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.scss`
- Modify: `projects/ui-common/google-maps/public-api.ts`

**Interfaces:**

- Consumes: `FeatureGroupRegistry` (Task 4).
- Produces:
  - `isLabelVisibleAtSize(widthPx, heightPx, minDiagonalPx?): boolean`
  - `class MapFeatureLabelsOverlay` with `refresh(): void` and `destroy(): void`
  - `GoogleMapsService.setLabelProperty(property: string | undefined): void`

- [ ] **Step 1: Write the failing visibility test**

Create `projects/ui-common/google-maps/labels/label-visibility.spec.ts`:

```ts
import { isLabelVisibleAtSize } from './label-visibility'

describe('isLabelVisibleAtSize', () => {
  it('hides a shape too small to read a label over', () => {
    expect(isLabelVisibleAtSize(10, 10)).toBe(false)
  })

  it('shows a comfortably sized shape', () => {
    expect(isLabelVisibleAtSize(200, 150)).toBe(true)
  })

  it('shows a long thin shape, which has room even though it is narrow', () => {
    // A field 200px long and 5px tall has plenty of room for a label. A rule
    // based on width AND height would wrongly hide it; the diagonal does not.
    expect(isLabelVisibleAtSize(200, 5)).toBe(true)
  })

  it('honours a custom threshold', () => {
    expect(isLabelVisibleAtSize(60, 60, 200)).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts label-visibility`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement it**

Create `projects/ui-common/google-maps/labels/label-visibility.ts`:

```ts
/** Below this projected diagonal, a shape is too small to label. */
export const DEFAULT_LABEL_MIN_DIAGONAL_PX = 48

/**
 * Whether a group is large enough on screen to carry a label.
 *
 * Uses the diagonal rather than width and height separately, so a long thin
 * field — which has plenty of room for a label — is not hidden for being
 * narrow. This self-tunes as the map zooms out, which is why there is no
 * `minZoom` input.
 */
export function isLabelVisibleAtSize(
  widthPx: number,
  heightPx: number,
  minDiagonalPx: number = DEFAULT_LABEL_MIN_DIAGONAL_PX,
): boolean {
  return Math.hypot(widthPx, heightPx) >= minDiagonalPx
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts label-visibility`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the overlay**

Create `projects/ui-common/google-maps/labels/map-feature-labels-overlay.ts`:

```ts
import { isLabelVisibleAtSize } from './label-visibility'

export interface MapFeatureLabel {
  key: string
  text: string
  bounds: google.maps.LatLngBounds
}

export const MAP_FEATURE_LABEL_CLASS = 'seam-map-feature-label'

/**
 * Renders one label per feature group.
 *
 * A single OverlayView holding one child div per group, rather than one overlay
 * each: with many fields that is one `draw()` per frame updating N child
 * positions instead of N overlays each doing projection work.
 *
 * Labels live in the `overlayLayer` pane with `pointer-events: none`, so they
 * never take part in hit testing and cannot interfere with clicks, drawing, or
 * the context-menu overlay.
 *
 * Known limitation: no collision de-confliction. Labels of nearby groups will
 * overlap at low zoom. The size threshold reduces but does not eliminate this.
 */
export class MapFeatureLabelsOverlay extends google.maps.OverlayView {
  private readonly _container: HTMLDivElement
  private readonly _elements = new Map<string, HTMLDivElement>()
  private _labels: MapFeatureLabel[] = []

  constructor(private readonly _getLabels: () => MapFeatureLabel[]) {
    super()
    this._container = document.createElement('div')
    this._container.style.position = 'absolute'
    this._container.style.left = '0'
    this._container.style.top = '0'
    this._container.style.pointerEvents = 'none'
  }

  onAdd(): void {
    this.getPanes()?.overlayLayer.appendChild(this._container)
  }

  onRemove(): void {
    this._container.parentElement?.removeChild(this._container)
    this._elements.clear()
  }

  /** Re-read the labels and repaint. Call when the value or grouping changes. */
  refresh(): void {
    this._labels = this._getLabels()
    this.draw()
  }

  destroy(): void {
    this.setMap(null)
  }

  draw(): void {
    const projection = this.getProjection()
    if (!projection) {
      return
    }

    const seen = new Set<string>()

    for (const label of this._labels) {
      seen.add(label.key)
      const element = this._elementFor(label)

      const ne = projection.fromLatLngToDivPixel(label.bounds.getNorthEast())
      const sw = projection.fromLatLngToDivPixel(label.bounds.getSouthWest())
      const centre = projection.fromLatLngToDivPixel(label.bounds.getCenter())
      if (!ne || !sw || !centre) {
        element.hidden = true
        continue
      }

      const visible = isLabelVisibleAtSize(
        Math.abs(ne.x - sw.x),
        Math.abs(ne.y - sw.y),
      )
      element.hidden = !visible
      if (visible) {
        element.style.left = `${centre.x}px`
        element.style.top = `${centre.y}px`
      }
    }

    for (const [key, element] of this._elements) {
      if (!seen.has(key)) {
        element.parentElement?.removeChild(element)
        this._elements.delete(key)
      }
    }
  }

  private _elementFor(label: MapFeatureLabel): HTMLDivElement {
    let element = this._elements.get(label.key)
    if (!element) {
      element = document.createElement('div')
      element.className = MAP_FEATURE_LABEL_CLASS
      element.style.position = 'absolute'
      element.style.transform = 'translate(-50%, -50%)'
      element.style.pointerEvents = 'none'
      element.style.whiteSpace = 'nowrap'
      this._container.appendChild(element)
      this._elements.set(label.key, element)
    }
    if (element.textContent !== label.text) {
      element.textContent = label.text
    }
    return element
  }
}
```

- [ ] **Step 6: Drive it from the service**

In `google-maps.service.ts` add:

```ts
  private _labelProperty: string | undefined
  private _labelsOverlay?: MapFeatureLabelsOverlay
  private _warnedAboutLabelDisagreement = false

  public setLabelProperty(property: string | undefined): void {
    this._labelProperty = property
    if (!this.mapReady) {
      return
    }
    if (!property) {
      this._labelsOverlay?.destroy()
      this._labelsOverlay = undefined
      return
    }
    this._ensureLabelsOverlay()
    this._labelsOverlay?.refresh()
  }

  private _ensureLabelsOverlay(): void {
    this._assertInitialized()
    if (this._labelsOverlay) {
      return
    }
    this._labelsOverlay = new MapFeatureLabelsOverlay(() => this._buildLabels())
    this._labelsOverlay.setMap(this.googleMap)
  }

  private _buildLabels(): MapFeatureLabel[] {
    const property = this._labelProperty
    if (!property) {
      return []
    }
    this._assertInitialized()

    const byKey = new Map<
      string,
      { text: string; bounds: google.maps.LatLngBounds; others: Set<string> }
    >()

    this.googleMap.data.forEach((feature) => {
      const key = this._registry.keyOf(feature)
      const raw = feature.getProperty(property)
      const text =
        raw === null || raw === undefined || raw === '' ? '' : String(raw)

      const existing = byKey.get(key)
      const bounds = existing?.bounds ?? new google.maps.LatLngBounds()
      feature.getGeometry()?.forEachLatLng((latLng) => bounds.extend(latLng))

      if (!existing) {
        byKey.set(key, { text, bounds, others: new Set(text ? [text] : []) })
        return
      }
      if (text) {
        existing.others.add(text)
        if (!existing.text) {
          existing.text = text
        }
      }
    })

    const labels: MapFeatureLabel[] = []
    for (const [key, entry] of byKey) {
      if (entry.others.size > 1) {
        this._warnAboutLabelDisagreement(key)
      }
      if (entry.text) {
        labels.push({ key, text: entry.text, bounds: entry.bounds })
      }
    }
    return labels
  }

  private _warnAboutLabelDisagreement(key: string): void {
    if (
      this._warnedAboutLabelDisagreement ||
      (typeof ngDevMode !== 'undefined' && !ngDevMode)
    ) {
      return
    }
    this._warnedAboutLabelDisagreement = true
    console.warn(
      `[seam-google-maps] features in group "${key}" carry different ` +
        `"${this._labelProperty}" values. One is rendered; which is ` +
        `unspecified. Keeping them consistent is the consumer's business.`,
    )
  }
```

Import the overlay and label type:

```ts
import {
  MapFeatureLabel,
  MapFeatureLabelsOverlay,
} from './labels/map-feature-labels-overlay'
```

Labels must track the value, geometry edits, and drawing state. Add
`this._labelsOverlay?.refresh()` as the last statement of each of these four
methods: `setData()`, `startDrawing()`, `stopDrawing()`, and `_onDrawFinished()`.

In the `_initFeatureChangeListeners` subscription, extend the existing `tap` so
a geometry change repaints the labels:

```ts
            tap((geoJson) => {
              this._mapValueManager.setValue(
                geoJson,
                MapValueSource.FeatureChange,
              )
              this._labelsOverlay?.refresh()
            }),
```

And hide labels while drawing, by making `_buildLabels` return early — this is
the first statement in the method, before the `_labelProperty` check:

```ts
    if (this.isDrawing()) {
      return []
    }
```

Destroy the overlay in `ngOnDestroy`:

```ts
    this._labelsOverlay?.destroy()
    this._labelsOverlay = undefined
```

- [ ] **Step 7: Wire the component input**

In `google-maps.component.ts` `ngOnChanges`:

```ts
    if (Object.prototype.hasOwnProperty.call(changes, 'featureLabelProperty')) {
      this._googleMaps.setLabelProperty(this.featureLabelProperty)
    }
```

And in `_onMapReady`'s `idle` handler, after the group options:

```ts
      this._googleMaps.setLabelProperty(this.featureLabelProperty)
```

- [ ] **Step 8: Style the labels**

Append to `projects/ui-common/google-maps/google-maps/google-maps.component.scss`:

```scss
// The label divs are created outside Angular's view and appended to Google's
// overlay pane, so emulated encapsulation does not reach them. `::ng-deep`
// does, because the panes live inside this component's host element.
//
// If this turns out not to hold, move these rules to a stylesheet asset in a
// `google-maps/styles/` directory and register it in the `assets` array of
// `projects/ui-common/ng-package.json`, following `breadcrumbs/styles/`.
:host ::ng-deep .seam-map-feature-label {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  text-shadow:
    0 0 3px rgba(0, 0, 0, 0.9),
    0 0 6px rgba(0, 0, 0, 0.7);
  user-select: none;
}
```

- [ ] **Step 9: Export the label API**

In `projects/ui-common/google-maps/public-api.ts`:

```ts
export * from './labels/label-visibility'
export * from './labels/map-feature-labels-overlay'
```

- [ ] **Step 10: Build and test**

Run: `npm run build:ui-common && npm run test:ci`
Expected: both pass.

- [ ] **Step 11: Verify the styling reaches the labels**

This is the spec's second prove-first item and cannot be settled by Jest.

Run: `npm run storybook` (or use the running instance), open **GoogleMaps/Components → MultiPolygonRoundTrip**, and temporarily bind `featureLabelProperty="FIELD_NAME"` on the story's template. Confirm in devtools that a `.seam-map-feature-label` div exists in the overlay pane **and** that it is white with a text shadow rather than unstyled black.

If the rules do not apply, follow the fallback named in the SCSS comment: move them to `projects/ui-common/google-maps/styles/_labels.scss`, register the directory in the `assets` array of `projects/ui-common/ng-package.json`, and note in the component docs that consumers must import it.

- [ ] **Step 12: Commit**

```bash
git add projects/ui-common/google-maps/labels projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/google-maps/google-maps.component.ts projects/ui-common/google-maps/google-maps/google-maps.component.scss projects/ui-common/google-maps/public-api.ts
git commit -m "feat(google-maps): render per-group polygon labels"
```

---

### Task 12: Storybook coverage for the interaction state machine

Data-layer polygons render into a canvas overlay with no DOM element per feature, so there is nothing for a locator to address. Play functions drive the Maps event system directly, which tests the listeners and the model without depending on where anything is painted — and sidesteps the no-API-key dialog entirely.

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps.stories.ts`

**Interfaces:**

- Consumes: everything from Tasks 8-11.
- Produces: no code other tasks depend on.

- [ ] **Step 1: Add a grouped fixture and a helper**

Append to `projects/ui-common/google-maps/google-maps.stories.ts`:

```ts
const squareAt = (lng: number, lat: number, size = 0.01) => ({
  type: 'Polygon',
  coordinates: [
    [
      [lng, lat],
      [lng, lat + size],
      [lng + size, lat + size],
      [lng + size, lat],
      [lng, lat],
    ],
  ],
})

const GROUPED_VALUE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { fieldId: 'A', FIELD_NAME: 'North 40' },
      geometry: squareAt(-98.58, 37.63),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'A', FIELD_NAME: 'North 40' },
      geometry: squareAt(-98.56, 37.63),
    },
    {
      type: 'Feature',
      properties: {
        fieldId: 'B',
        FIELD_NAME: 'Retired South',
        styleOptions: { fillColor: 'gray', editable: false },
      },
      geometry: squareAt(-98.58, 37.61),
    },
  ],
}

/** Wait for the map to render and load its value. */
async function mapComponent(canvasElement: HTMLElement): Promise<any> {
  const host = canvasElement.querySelector('seam-google-maps')
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return (window as any).ng.getComponent(host)
}

/** The first Data.Feature whose group property matches. */
function featureWithGroup(component: any, key: string): any {
  let match: any
  component._googleMaps.googleMap.data.forEach((f: any) => {
    if (!match && f.getProperty('fieldId') === key) {
      match = f
    }
  })
  return match
}
```

- [ ] **Step 2: Add the grouped stories**

```ts
export const GroupedClickSelectsWholeField = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        featureLabelProperty="FIELD_NAME"
        [value]="value"
        (selectionChange)="onSelection($event)"
        style="height: 400px"></seam-google-maps>
    `,
    props: {
      value: GROUPED_VALUE,
      selections: [] as any[],
      onSelection(event: any) {
        ;(this as any).selections.push(event)
      },
    },
  }),
  play: async ({ canvasElement }: any) => {
    const component = await mapComponent(canvasElement)
    const feature = featureWithGroup(component, 'A')

    google.maps.event.trigger(component._googleMaps.googleMap.data, 'click', {
      feature,
    })

    const groups = component.getGroups()
    expect(groups.map((g: any) => g.key).sort()).toEqual(['A', 'B'])
    // Field A has two polygons; clicking one selects both.
    const selected = groups.find((g: any) => g.key === 'A')
    expect(selected.features).toHaveLength(2)
  },
}

export const GroupedEditModeIgnoresFeatureClicks = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)

    const feature = featureWithGroup(component, 'A')
    const style = component._googleMaps.googleMap.data.getStyle()(feature)

    // With edit mode armed and nothing selected, polygons must ignore clicks
    // so a click can only ever mean "start drawing".
    expect(style.clickable).toBe(false)
  },
}

export const GroupedRetiredFieldStaysUneditable = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    component.selectGroup('B')

    const retired = featureWithGroup(component, 'B')
    const style = component._googleMaps.googleMap.data.getStyle()(retired)

    // Selected and in edit mode, but the feature declares editable: false.
    expect(style.editable).toBe(false)
    expect(style.fillColor).toBe('gray')
  },
}

export const GroupedEscapeCascades = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    component.selectGroup('A')

    component._googleMaps.handleEscape()
    expect(component.getGroups().length).toBeGreaterThan(0)
    expect(component.isEditMode()).toBe(true)

    component._googleMaps.handleEscape()
    expect(component.isEditMode()).toBe(false)
  },
}

export const LegacyClickStillArmsEditing = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
    const component = await mapComponent(canvasElement)
    const feature = featureWithGroup(component, 'A')

    google.maps.event.trigger(component._googleMaps.googleMap.data, 'click', {
      feature,
    })

    const style = component._googleMaps.googleMap.data.getStyle()(feature)
    // Regression guard for the two apps that are not being updated: in legacy
    // mode a click alone still arms handles.
    expect(style.editable).toBe(true)
  },
}
```

- [ ] **Step 3: Run the stories**

Assume Storybook is already running. If the runner cannot connect, ask before starting a new instance — a cold start takes minutes.

Run: `npm run test-storybook -- google-maps`
Expected: PASS. Remember that path arguments are regexes; pass a filename fragment.

- [ ] **Step 4: Fix any failures and re-run**

If `LegacyClickStillArmsEditing` fails, the legacy extraction has drifted — that is the regression these stories exist to catch, and it must be fixed in `LegacyInteractionModel` or `computeFeatureStyle` rather than by adjusting the story.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.stories.ts
git commit -m "test(google-maps): cover the grouped interaction state machine in storybook"
```

---

### Task 13: Smoke-test the map control path and finish the branch

The `seam-map-control` / `MAP_CONTROLS_SERVICE` path dates from roughly 2022 and several Angular majors ago, and `modal-attributes-map` in `TheSeam.DataCommons.App` is its only exercise. The Cotton modal will depend on it.

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps.stories.ts`

- [ ] **Step 1: Add a control smoke story**

```ts
export const ConsumerSuppliedControl = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        style="height: 400px">
        <seam-map-control [def]="controlDef"></seam-map-control>
      </seam-google-maps>
    `,
    props: {
      value: GROUPED_VALUE,
      // Built here, not in `args` — args are serialized across the
      // manager/preview boundary and a class instance comes back with its
      // prototype stripped.
      controlDef: {
        component: TheSeamGoogleMapsRecenterButtonControlComponent,
        data: { label: 'Smoke Test' },
        position: 9,
      },
    },
  }),
  play: async ({ canvasElement }: any) => {
    await mapComponent(canvasElement)
    // The control mounts through addControl() against the Maps JS API, not
    // through the DOM — google-maps.component.html has no <ng-content> slot,
    // deliberately. So look for it in the map's rendered control container.
    const button = canvasElement.querySelector('[title="Smoke Test"]')
    expect(button).not.toBeNull()
  },
}
```

Add the import:

```ts
import { TheSeamGoogleMapsRecenterButtonControlComponent } from './google-maps-recenter-button-control/google-maps-recenter-button-control.component'
```

- [ ] **Step 2: Run it**

Run: `npm run test-storybook -- google-maps`
Expected: PASS. If the control does not mount, **stop and report** — the Cotton modal depends on this path and a break here is a finding, not something to work around.

- [ ] **Step 3: Run every check**

```bash
npm run lint
npm run test:ci
npm run build:ui-common
npm run test-storybook -- google-maps
```

Expected: all four pass. Do not claim completion without seeing each one succeed.

- [ ] **Step 4: Verify the legacy path by hand**

Open **GoogleMaps/Components → Basic** and **Control** in Storybook. Confirm, with no `interactionMode` set: the draw button still says "Draw Field" and toggles drawing; clicking a polygon selects it and shows vertex handles; right-clicking a selected polygon opens a menu with a single "Delete"; right-clicking an unselected polygon does nothing.

This is the acceptance test for the constraint that Peanut and DataCommons need no PR.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.stories.ts
git commit -m "test(google-maps): smoke-test the consumer-supplied control path"
```

---

## Follow-up, not part of this branch

Recorded so it is not lost, and deliberately excluded:

- **`modal-attributes-map` in `TheSeam.DataCommons.App`** needs looking at before this releases. Fixing the precedence chain means `properties.styleOptions` is no longer discarded when a feature is selected, and that component sets `fillColor` and `visible` through it. A selected feature will keep its consumer fill instead of reverting to the selected defaults, and a `visible: false` feature stays hidden when selected. Both are the intended behaviour; neither can throw. The handoff describes the component as a quickly-written proof of concept that may not be actively used — confirm which.
- **Deprecate `interactionMode: 'legacy'`** in this release, and when a major is next cut, flip the default to `'grouped'` and delete `LegacyInteractionModel`. The strategy boundary is what makes that a deletion rather than an untangling.
- **Label collision de-confliction** is a known limitation, documented in `MapFeatureLabelsOverlay`.
- **Tighten the `closePolygons` doc comment** in
  `projects/ui-common/utils/geo-json/close-polygons.ts`. It says "Google Maps
  requires closed polygon rings", which reads as contradicting
  `dataPolygonFromGeoJson`, which strips the closing point. Both are correct:
  `data.addGeoJson()` consumes GeoJSON, which requires closed rings, while
  `new google.maps.Data.Polygon()` takes implicitly-closed LinearRings that
  must not repeat the first point. A one-line clarification, in `utils` rather
  than `google-maps`, so it belongs in its own commit.
