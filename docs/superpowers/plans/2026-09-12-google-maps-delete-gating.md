# Google Maps Delete Gating, `editable` Lock, and Live Labels — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a consumer of `seam-google-maps` veto deletions, make a feature that declares `editable: false` undeletable, and let a group's label be rewritten in place without a full value write.

**Architecture:** One private resolver in `GoogleMapsService` (`_mayDelete`) answers every "may this be deleted?" question; three public query methods mirror the three existing delete commands so no command can acquire a delete without a gate. The menu-item decision moves out of the component into a pure function so it is testable without a map. `setGroupLabel` writes GeoJSON properties in place and rides the data layer's existing `setproperty` plumbing.

**Tech Stack:** Angular 20, RxJS, Jest (`jest-preset-angular`, jsdom), Storybook 9 (CSF 3), the Google Maps JS API behind a lazy loader.

**Spec:** [`docs/superpowers/specs/2026-09-12-google-maps-delete-gating-design.md`](../specs/2026-09-12-google-maps-delete-gating-design.md)

## Global Constraints

- **Branch:** all work lands on `marklb/map-interaction-improve`. Do not branch off `develop`.
- **`'legacy'` interaction mode behaviour must not drift.** Two applications depend on it and are not being updated. Where a refactor could change it, preserve the existing code path exactly rather than unifying it.
- **Prettier config** (`.prettierrc`): 2-space indent, **no semicolons**, single quotes, trailing commas, arrow parens always.
- **Naming:** anything exported through a `public-api.ts` must be prefixed `TheSeam`. Do not prefix interfaces with `I`. Private members are prefixed `_`, including component members that are only non-private so the template can reach them.
- **Change detection:** `ChangeDetectionStrategy.OnPush` throughout.
- **Commit trailer:** every commit message ends with
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`
- **Conventional commits** are required (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).
- **No customer data.** Invent fixture values; this repository is public.
- **Run tests with** `npx jest --ci --runInBand <path>` from the repository root. Jest's `testMatch` already includes `**/google-maps/**/*.spec.ts`, so new spec files under that directory are picked up with no config change.

---

## File Structure

**Created:**

| Path | Responsibility |
| --- | --- |
| `projects/ui-common/google-maps/context-menu/delete-menu-items.ts` | Pure function deciding which delete items the feature context menu offers. Not to be confused with `google-maps-contextmenu.ts`, which is the overlay that renders a menu. |
| `projects/ui-common/google-maps/context-menu/delete-menu-items.spec.ts` | Tests for that decision. |
| `projects/ui-common/google-maps/testing/fake-google-maps.spec.ts` | Proves the fake raises the data-layer events the service listens for. |
| `projects/ui-common/google-maps/google-maps.service.spec.ts` | The delete gate and `setGroupLabel`, against the fake map. |

**Modified:**

| Path | Change |
| --- | --- |
| `projects/ui-common/google-maps/feature-style/compute-feature-style.ts` | Extract the inline `wants()` closure into an exported `featureAllows()`. |
| `projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts` | Pin `featureAllows` directly. |
| `projects/ui-common/google-maps/testing/fake-google-maps.ts` | Add `FakeMap`; make feature property/geometry writes raise data-layer events. |
| `projects/ui-common/google-maps/google-maps.service.ts` | `setGroupLabel`, the delete gate, `deleteBlocked$`, the private removers. |
| `projects/ui-common/google-maps/google-maps/google-maps.component.ts` | `canDelete` input, `deleteBlocked` output, `setGroupLabel` delegate, menu built by the new pure function. |
| `projects/ui-common/google-maps/google-maps/google-maps.component.html` | `item.action(item)` → `item.action()`. |
| `projects/ui-common/google-maps/public-api.ts` | Export the new `context-menu/delete-menu-items` module. |
| `projects/ui-common/google-maps/google-maps.stories.ts` | Stories for label updates and menu gating. |

**Task order rationale:** Task 1 supplies the lock predicate the gate needs. Task 2 supplies the test harness Tasks 3–5 need. Task 3 (`setGroupLabel`) is independent of the delete work and lands early so the app is unblocked on live labels sooner. Tasks 4 and 5 are split so the behaviour-preserving refactor can be reviewed separately from the behaviour change built on it.

---

### Task 1: Extract `featureAllows` from `computeFeatureStyle`

The opt-out resolution currently lives in an inline `wants()` closure. The delete gate needs the same answer, and a second copy would drift.

**Files:**
- Modify: `projects/ui-common/google-maps/feature-style/compute-feature-style.ts`
- Test: `projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `featureAllows(feature: google.maps.Data.Feature, option: 'editable' | 'draggable' | 'clickable'): boolean`. Exported from `feature-style/compute-feature-style.ts`, which `public-api.ts` already re-exports via `export *`.

- [ ] **Step 1: Write the failing tests**

Append to `projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts`. Add `featureAllows` to the existing import from `./compute-feature-style`.

```ts
describe('featureAllows', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('allows an option no declaration mentions', () => {
    expect(featureAllows(makeFeature(), 'editable')).toBe(true)
  })

  it('refuses an option styleOptions declares false', () => {
    const feature = makeFeature({ styleOptions: { editable: false } })
    expect(featureAllows(feature, 'editable')).toBe(false)
  })

  it('allows an option styleOptions declares true', () => {
    const feature = makeFeature({ styleOptions: { editable: true } })
    expect(featureAllows(feature, 'editable')).toBe(true)
  })

  it('only an explicit false opts out', () => {
    const feature = makeFeature({ styleOptions: { editable: undefined } })
    expect(featureAllows(feature, 'editable')).toBe(true)
  })

  it('ignores styleOptionsSelected while unselected', () => {
    const feature = makeFeature({
      styleOptions: { editable: true },
      styleOptionsSelected: { editable: false },
    })
    expect(featureAllows(feature, 'editable')).toBe(true)
  })

  it('prefers styleOptionsSelected while selected', () => {
    const feature = makeFeature({
      styleOptions: { editable: true },
      styleOptionsSelected: { editable: false },
    })
    setFeatureSelected(feature, true)
    expect(featureAllows(feature, 'editable')).toBe(false)
  })

  it('falls back per key, not per object, while selected', () => {
    // styleOptionsSelected exists for an unrelated reason (colour). The
    // editable opt-out in styleOptions must survive it.
    const feature = makeFeature({
      styleOptions: { editable: false },
      styleOptionsSelected: { fillColor: 'gold' },
    })
    setFeatureSelected(feature, true)
    expect(featureAllows(feature, 'editable')).toBe(false)
  })

  it('resolves each option independently', () => {
    const feature = makeFeature({
      styleOptions: { editable: true, draggable: false, clickable: false },
    })
    expect(featureAllows(feature, 'editable')).toBe(true)
    expect(featureAllows(feature, 'draggable')).toBe(false)
    expect(featureAllows(feature, 'clickable')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts`
Expected: FAIL — `featureAllows is not a function` (or a TypeScript error that it is not exported).

- [ ] **Step 3: Add `featureAllows` and rewire `computeFeatureStyle`**

In `compute-feature-style.ts`, add the exported function above `computeFeatureStyle`:

```ts
/**
 * Whether the feature declines to opt OUT of `option`.
 *
 * Resolved per key, not per object: a selected feature consults
 * `styleOptionsSelected` first and falls back to `styleOptions` only for a key
 * `styleOptionsSelected` does not itself mention. Otherwise a feature
 * declaring `styleOptionsSelected` for an unrelated reason, such as a
 * different selected fill colour, would silently lose an unrelated
 * `editable: false` from `styleOptions` the moment it is selected.
 *
 * Only an explicit `false` opts out. Shared by `computeFeatureStyle` and the
 * delete gate in `GoogleMapsService`, so the lock a consumer declares means
 * the same thing to both.
 */
export function featureAllows(
  feature: google.maps.Data.Feature,
  option: 'editable' | 'draggable' | 'clickable',
): boolean {
  const selectedDeclared = isFeatureSelected(feature)
    ? getSelectedStyleOptionsDefinedByFeature(feature)
    : undefined
  const baseDeclared = getStyleOptionsDefinedByFeature(feature)
  return (selectedDeclared?.[option] ?? baseDeclared?.[option]) !== false
}
```

Then replace the body of `computeFeatureStyle` from its first line down to the `return options`, dropping the now-unused `baseDeclared`, `selectedDeclared`, and `wants` locals:

```ts
export function computeFeatureStyle(
  feature: google.maps.Data.Feature,
  context: TheSeamMapFeatureStyleContext,
): google.maps.Data.StyleOptions {
  const selected = isFeatureSelected(feature)

  const options = FEATURE_STYLE_OPTIONS_DEFAULT()
  mergeStyleOptions(options, getStyleOptionsDefinedByFeature(feature))

  if (selected) {
    mergeStyleOptions(options, FEATURE_STYLE_OPTIONS_SELECTED())
    mergeStyleOptions(options, getSelectedStyleOptionsDefinedByFeature(feature))
  }

  const editingArmed =
    context.editingEnabled && context.geometryEditingArmed && selected
  const wantsEditable = featureAllows(feature, 'editable')

  options.editable = wantsEditable && editingArmed
  // editable: false implies draggable: false (see the doc comment above) —
  // the reverse does not hold, so 'draggable' is still resolved on its own
  // for a feature that opts out of dragging alone.
  options.draggable =
    featureAllows(feature, 'draggable') && wantsEditable && editingArmed
  options.clickable =
    featureAllows(feature, 'clickable') && context.clicksAllowed

  return options
}
```

In `computeFeatureStyle`'s existing doc comment, replace the sentence beginning "Resolved through the same per-key `wants()` lookup" with "Resolved through `featureAllows`, which the delete gate shares."

- [ ] **Step 4: Run the whole style spec to verify no drift**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts`
Expected: PASS — the new `featureAllows` block **and** every pre-existing `computeFeatureStyle` test. The pre-existing tests passing unchanged is the evidence this was a pure extraction.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/feature-style/compute-feature-style.ts projects/ui-common/google-maps/feature-style/compute-feature-style.spec.ts
git commit -m "refactor(google-maps): extract featureAllows from computeFeatureStyle" -m "The delete gate needs the same per-key opt-out resolution. A second copy would drift from the styling path." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Give the fake a `Map` and real property events

The fake models the data layer but has no `Map`, so `GoogleMapsService` cannot be constructed under Jest. `FakeDataFeature.setProperty` also writes silently, where the real API raises `setproperty` on the data layer the feature belongs to — the event the whole label and value-change pipeline hangs off.

**Files:**
- Modify: `projects/ui-common/google-maps/testing/fake-google-maps.ts`
- Test: `projects/ui-common/google-maps/testing/fake-google-maps.spec.ts` (create)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `export class FakeMap extends FakeMapsEventTarget` with `readonly data: FakeData`, `readonly controls: any[][]`, `getDiv()`, `getZoom()`, `setZoom(zoom)`, `fitBounds(bounds, padding?)`, `panTo(latLng)`, `panToBounds(bounds)`, and the recorded fields `bounds`, `padding`, `center`. Registered as `google.maps.Map`. `FakeData.add()` links a feature to its layer so `setProperty` / `removeProperty` / `setGeometry` emit `setproperty` / `removeproperty` / `setgeometry`.

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/google-maps/testing/fake-google-maps.spec.ts`:

```ts
import { FakeData, installFakeGoogleMaps, uninstallFakeGoogleMaps } from './fake-google-maps'

describe('fake google maps', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('exposes a Map carrying a data layer', () => {
    const map = new google.maps.Map(document.createElement('div'))
    expect(map.data).toBeInstanceOf(FakeData)
  })

  it('records the last fitBounds call', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const bounds = new google.maps.LatLngBounds()
    map.fitBounds(bounds, 12)
    expect(map.bounds).toBe(bounds)
    expect(map.padding).toBe(12)
  })

  it('raises setproperty on the layer when an added feature is written to', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const events: any[] = []
    map.data.addListener('setproperty', (event: any) => events.push(event))

    const feature = map.data.add(
      new google.maps.Data.Feature({ geometry: null, properties: {} }),
    )
    feature.setProperty('FIELD_NAME', 'North 40')

    expect(events).toHaveLength(1)
    expect(events[0].feature).toBe(feature)
    expect(events[0].name).toBe('FIELD_NAME')
  })

  it('raises removeproperty on the layer', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const events: any[] = []
    map.data.addListener('removeproperty', (event: any) => events.push(event))

    const feature = map.data.add(
      new google.maps.Data.Feature({
        geometry: null,
        properties: { FIELD_NAME: 'North 40' },
      }),
    )
    feature.removeProperty('FIELD_NAME')

    expect(events).toHaveLength(1)
    expect(events[0].name).toBe('FIELD_NAME')
  })

  it('stops raising events once a feature is removed from the layer', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const feature = map.data.add(
      new google.maps.Data.Feature({ geometry: null, properties: {} }),
    )
    map.data.remove(feature)

    const events: any[] = []
    map.data.addListener('setproperty', (event: any) => events.push(event))
    feature.setProperty('FIELD_NAME', 'North 40')

    expect(events).toHaveLength(0)
  })

  it('raises nothing for a feature that was never added', () => {
    const events: any[] = []
    const data: any = new FakeData()
    data.addListener('setproperty', (event: any) => events.push(event))

    const feature = new google.maps.Data.Feature({
      geometry: null,
      properties: {},
    })
    feature.setProperty('FIELD_NAME', 'North 40')

    expect(events).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/testing/fake-google-maps.spec.ts`
Expected: FAIL — `google.maps.Map is not a constructor`.

- [ ] **Step 3: Implement the fake additions**

In `fake-google-maps.ts`, add an owner link to `FakeDataFeature` and replace its three mutators:

```ts
class FakeDataFeature {
  private _geometry: any
  private readonly _properties = new Map<string, any>()
  private readonly _id: string | number

  /**
   * The layer this feature was added to, or null. The real API raises
   * `setproperty` / `removeproperty` / `setgeometry` on the Data layer a
   * feature belongs to, and `GoogleMapsService` hangs its value-change and
   * label-refresh pipeline off exactly those events. Set by `FakeData.add`
   * and cleared by `FakeData.remove`.
   */
  _owner: FakeData | null = null
```

(leave the constructor, `getId`, `getGeometry`, `getProperty`, `forEachProperty`, and `toGeoJson` as they are)

```ts
  setGeometry(geometry: any): void {
    const oldGeometry = this._geometry
    this._geometry = geometry
    this._owner?.emit('setgeometry', {
      feature: this,
      newGeometry: geometry,
      oldGeometry,
    })
  }
  setProperty(name: string, value: any): void {
    const oldValue = this._properties.get(name)
    this._properties.set(name, value)
    this._owner?.emit('setproperty', { feature: this, name, oldValue })
  }
  removeProperty(name: string): void {
    const oldValue = this._properties.get(name)
    this._properties.delete(name)
    this._owner?.emit('removeproperty', { feature: this, name, oldValue })
  }
```

In `FakeData`, set and clear the link:

```ts
  add(feature: any): any {
    const f =
      feature instanceof FakeDataFeature
        ? feature
        : new FakeDataFeature(feature)
    f._owner = this
    this._features.push(f)
    this.emit('addfeature', { feature: f })
    return f
  }
  remove(feature: any): void {
    const index = this._features.indexOf(feature)
    if (index !== -1) {
      this._features.splice(index, 1)
      feature._owner = null
      this.emit('removefeature', { feature })
    }
  }
```

Add `FakeMap` after `FakeData`:

```ts
/**
 * A stand-in for `google.maps.Map`, enough to construct `GoogleMapsService`.
 *
 * `setMap()` defers Terra Draw initialisation to the map's first `idle`, and
 * this fake never fires `idle` unless a spec asks for it — so a spec can
 * exercise the service without Terra Draw at all.
 *
 * Viewport calls are recorded rather than simulated: a spec asserts on
 * `bounds` / `padding` / `center` instead of on a rendered map.
 */
export class FakeMap extends FakeMapsEventTarget {
  readonly data = new FakeData()
  /** One array per google.maps.ControlPosition slot. */
  readonly controls: any[][] = Array.from({ length: 13 }, () => [])

  bounds: any = null
  padding: any = undefined
  center: any = null

  private readonly _div = document.createElement('div')
  private _zoom = 14

  getDiv(): HTMLDivElement {
    return this._div
  }
  getZoom(): number {
    return this._zoom
  }
  setZoom(zoom: number): void {
    this._zoom = zoom
  }
  fitBounds(bounds: any, padding?: any): void {
    this.bounds = bounds
    this.padding = padding
  }
  panTo(latLng: any): void {
    this.center = latLng
  }
  panToBounds(bounds: any): void {
    this.bounds = bounds
  }
}
```

Register it in `FAKE_GOOGLE`, alongside `LatLng`:

```ts
    Map: FakeMap,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/testing/fake-google-maps.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Run every spec that uses the fake, to confirm the event change broke nothing**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps`
Expected: PASS. The registry and interaction-model specs write properties on features; some now also emit events, which nothing in those specs listens for.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/google-maps/testing/fake-google-maps.ts projects/ui-common/google-maps/testing/fake-google-maps.spec.ts
git commit -m "test(google-maps): add FakeMap and raise real property events in the fake" -m "GoogleMapsService could not be constructed under Jest without a Map, and feature property writes did not raise the data-layer events its value-change and label pipeline listens for." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `setGroupLabel`

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps.service.ts`
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.ts`
- Test: `projects/ui-common/google-maps/google-maps.service.spec.ts` (create)

**Interfaces:**
- Consumes: `FakeMap` from Task 2.
- Produces: `GoogleMapsService.setGroupLabel(key: string, label: string): boolean` and `TheSeamGoogleMapsComponent.setGroupLabel(key: string, label: string): boolean`.

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/google-maps/google-maps.service.spec.ts`:

```ts
import { NgZone, ViewContainerRef } from '@angular/core'
import { Polygon } from 'geojson'

import { dataPolygonFromGeoJson } from './google-maps-feature-helpers'
import { GoogleMapsService } from './google-maps.service'
import { MapValueManagerService } from './map-value-manager.service'
import {
  FakeMap,
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from './testing/fake-google-maps'

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

/** Runs callbacks straight through; the service only uses these two methods. */
const zone = {
  run: (fn: any) => fn(),
  runOutsideAngular: (fn: any) => fn(),
} as unknown as NgZone

function createService(): {
  service: GoogleMapsService
  map: FakeMap
} {
  const service = new GoogleMapsService(
    new MapValueManagerService(),
    zone,
    {} as ViewContainerRef,
  )
  const map = new FakeMap()
  service.setMap(map as unknown as google.maps.Map)
  return { service, map }
}

/** Add a feature to the map's data layer and return it. */
function addFeature(map: FakeMap, properties: Record<string, any>): any {
  return map.data.add(
    new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
      properties,
    }),
  )
}

describe('GoogleMapsService', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  describe('setGroupLabel', () => {
    it('writes the label onto every feature in the group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      const a1 = addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })
      const a2 = addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })

      expect(service.setGroupLabel('A', 'North 40')).toBe(true)

      expect(a1.getProperty('FIELD_NAME')).toBe('North 40')
      expect(a2.getProperty('FIELD_NAME')).toBe('North 40')
    })

    it('leaves other groups alone', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })
      const b = addFeature(map, { fieldId: 'B', FIELD_NAME: 'Untouched' })

      service.setGroupLabel('A', 'North 40')

      expect(b.getProperty('FIELD_NAME')).toBe('Untouched')
    })

    it('returns false for a key no feature carries', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })

      expect(service.setGroupLabel('NOPE', 'North 40')).toBe(false)
    })

    it('returns false when no featureLabelProperty is configured', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      const a = addFeature(map, { fieldId: 'A' })

      expect(service.setGroupLabel('A', 'North 40')).toBe(false)
      expect(a.getProperty('FIELD_NAME')).toBeUndefined()
    })

    it('raises no setproperty for a label that is already correct', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'North 40' })

      const events: any[] = []
      map.data.addListener('setproperty', (event: any) => events.push(event))

      expect(service.setGroupLabel('A', 'North 40')).toBe(true)
      expect(events).toHaveLength(0)
    })

    it('raises one setproperty per feature that actually changes', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'North 40' })
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'Stale' })

      const events: any[] = []
      map.data.addListener('setproperty', (event: any) => events.push(event))

      service.setGroupLabel('A', 'North 40')
      expect(events).toHaveLength(1)
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/google-maps.service.spec.ts`
Expected: FAIL — `service.setGroupLabel is not a function`.

- [ ] **Step 3: Implement `setGroupLabel` on the service**

In `google-maps.service.ts`, add directly below `setLabelProperty`:

```ts
  /**
   * Write `label` into `featureLabelProperty` on every feature in `key`'s
   * group, without re-adding any data. Returns `false` when no feature
   * carries `key`, or when no `featureLabelProperty` is configured — there is
   * then no property to write the label into.
   *
   * Unlike a write through the map's `value`, this does NOT go through
   * `setData()`, so the selection and the viewport are untouched. The
   * repaint and the value update fall out of the data layer's own
   * `setproperty` event, which `_initFeatureChangeListeners()` already turns
   * into a `_labelsOverlay.refresh()` and a `MapValueSource.FeatureChange`
   * emission.
   *
   * It DOES emit a value change, because the label is part of the GeoJSON and
   * the value genuinely changed. Writing that emitted value straight back
   * through the `value` input is inert: `MapValueManagerService.setValue`
   * finds the serialized form identical and returns without emitting.
   */
  public setGroupLabel(key: string, label: string): boolean {
    this._assertInitialized()
    const property = this._labelProperty
    if (!property) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[seam-google-maps] setGroupLabel("${key}") was called with no ` +
            `featureLabelProperty configured, so there is no property to ` +
            `write the label into. Nothing changed.`,
        )
      }
      return false
    }

    const features = this._registry.featuresIn(key)
    if (features.length === 0) {
      return false
    }

    for (const feature of features) {
      // `setProperty` raises `setproperty` whether or not the value differs,
      // and each one costs a full re-serialization of the map's value. A
      // rename typed character by character would pay that per keystroke per
      // feature for writes that change nothing.
      if (feature.getProperty(property) === label) {
        continue
      }
      feature.setProperty(property, label)
    }
    return true
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/google-maps.service.spec.ts`
Expected: PASS (6 tests). The "no featureLabelProperty" case logs a `console.warn`; that is expected output, not a failure.

- [ ] **Step 5: Add the component delegate**

In `google-maps.component.ts`, add below the existing `getGroups()` delegate, inside the block of `mapReady`-guarded delegates:

```ts
  /**
   * Set a group's label text in place. Returns false when no such group
   * exists, or when no `featureLabelProperty` is set.
   *
   * Does not clear the selection or re-fit the viewport, so it is safe to
   * call while the user is renaming the very group being displayed.
   */
  public setGroupLabel(key: string, label: string): boolean {
    if (!this._googleMaps.mapReady) {
      return false
    }
    return this._googleMaps.setGroupLabel(key, label)
  }
```

- [ ] **Step 6: Verify the library still builds**

Run: `npm run build:ui-common`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/google-maps/google-maps.component.ts projects/ui-common/google-maps/google-maps.service.spec.ts
git commit -m "feat(google-maps): add setGroupLabel to update a group's label in place" -m "Renaming a field no longer needs a full value write, which would clear the selection and re-fit the viewport on every keystroke." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Extract the delete bodies into private removers (no behaviour change)

The gate must run exactly once per delete. `deleteFocusedFeature()` currently calls the public `deleteSelection()` as a fallback, which after Task 5 would run a second gate and could emit `deleteBlocked$` twice.

Lift each command's body into a private method **verbatim**. Do not unify the three bookkeeping blocks — they differ, and merging them would itself be a behaviour change in `'legacy'` mode.

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps.service.ts`
- Test: `projects/ui-common/google-maps/google-maps.service.spec.ts`

**Interfaces:**
- Consumes: `createService` / `addFeature` from Task 3's spec file.
- Produces: private `_removeSelection()`, `_removeGroup(key: string)`, `_removeFocusedFeature()`. Public signatures of `deleteSelection()`, `deleteGroup(key)`, `deleteFocusedFeature()` are unchanged (all `void`).

- [ ] **Step 1: Write the characterization tests**

These describe today's behaviour, so they must pass **before** the refactor. They are the evidence the refactor changed nothing. Append to `google-maps.service.spec.ts`, inside the outer `describe('GoogleMapsService')`:

```ts
  describe('delete commands (characterization)', () => {
    it('deleteGroup removes every feature in the group and nothing else', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })

      service.deleteGroup('A')

      expect(service.getGroups().map((g) => g.key)).toEqual(['B'])
    })

    it('deleteGroup clears the selection when it deleted the selected group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      service.selectGroup('A')

      service.deleteGroup('A')

      expect(service.getSelectedFeature()).toBeNull()
    })

    it('deleteSelection removes the selected features', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })
      service.selectGroup('A')

      service.deleteSelection()

      expect(service.getGroups().map((g) => g.key)).toEqual(['B'])
    })

    it('deleteSelection with nothing selected removes nothing', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      addFeature(map, { fieldId: 'A' })

      service.deleteSelection()

      expect(service.getGroups().map((g) => g.key)).toEqual(['A'])
    })

    it('deleteFocusedFeature falls back to the selection when nothing is focused', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })
      service.selectGroup('A')
      // selectGroup focuses the group's first feature; clear it so the
      // fallback path is the one under test.
      service['_focusedFeature'] = null

      service.deleteFocusedFeature()

      expect(service.getGroups().map((g) => g.key)).toEqual(['B'])
    })

    it('deleteFocusedFeature removes only the focused polygon of a multi-polygon group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const a1 = addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A' })
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      service.deleteFocusedFeature()

      const groups = service.getGroups()
      expect(groups).toHaveLength(1)
      expect(groups[0].features).toHaveLength(1)
    })
  })
```

- [ ] **Step 2: Run them to verify they pass against the CURRENT code**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/google-maps.service.spec.ts`
Expected: PASS. If any fails, the test is wrong about today's behaviour — fix the test, not the source. This task must not change behaviour.

- [ ] **Step 3: Perform the extraction**

Rename each public delete method to a private one and give the public method a body that only delegates. Keep every line of the moved bodies exactly as it is, with one change: inside `_removeFocusedFeature`, the fallback calls `this._removeSelection()` instead of `this.deleteSelection()`.

```ts
  /**
   * Iterates the map's features and removes any that are selected.
   *
   * Gated by `deleteSelection()`. Nothing else may call a public delete
   * command: each one gates exactly once, so a public command calling
   * another would gate the same removal twice.
   */
  private _removeSelection(): void {
    this._assertInitialized()
    const mapData = this.googleMap.data
    mapData.forEach((f) => {
      if (isFeatureSelected(f)) {
        mapData.remove(f)
      }
    })
    // Every deleted feature was selected, so nothing should still read as
    // selected afterward. Re-sync `selection$` and `_focusedFeature` the same
    // way `_removeFocusedFeature()` and `setData()` already do, rather than
    // leaving them pointing at a group that no longer exists. In 'legacy'
    // mode nothing consumes selection$ today, and no remaining feature's raw
    // selected flag changes here (they were already false), so this is inert
    // there.
    this.clearSelection()
  }

  public deleteSelection(): void {
    this._removeSelection()
  }
```

Do the same for the other two: `deleteGroup(key)`'s body becomes `private _removeGroup(key: string): void`, with `public deleteGroup(key: string): void { this._removeGroup(key) }`; `deleteFocusedFeature()`'s body becomes `private _removeFocusedFeature(): void`, with `public deleteFocusedFeature(): void { this._removeFocusedFeature() }`. Move each method's existing doc comment onto the private version and leave the public one bare for now — Task 5 gives it its own.

- [ ] **Step 4: Run the tests to verify they still pass**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps`
Expected: PASS — every characterization test plus the rest of the module. Unchanged results are the point.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/google-maps.service.spec.ts
git commit -m "refactor(google-maps): split the delete commands from their removal bodies" -m "A gate must run exactly once per delete, and deleteFocusedFeature falls back to calling deleteSelection. No behaviour change: the bodies move verbatim, covered by characterization tests written first." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The delete gate

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps.service.ts`
- Test: `projects/ui-common/google-maps/google-maps.service.spec.ts`

**Interfaces:**
- Consumes: `featureAllows` (Task 1), the private removers (Task 4).
- Produces, on `GoogleMapsService`:
  - `setCanDelete(predicate: ((target: TheSeamMapGroupTarget) => boolean) | undefined | null): void`
  - `canDeleteFocusedFeature(): boolean`
  - `canDeleteGroup(key: string): boolean`
  - `canDeleteSelection(): boolean`
  - `readonly deleteBlocked$: Observable<TheSeamMapGroupTarget>`

  The three query methods return `false` when the map is not ready. They **must not** call `_assertInitialized()`: the component subscribes `_contextMenuItems$` from its template, which evaluates before the map is ready, and a throw there would break the first render.

- [ ] **Step 1: Write the failing tests**

Append to `google-maps.service.spec.ts`, inside the outer `describe`:

```ts
  describe('delete gating', () => {
    /** A grouped-mode service with field A (two polygons) and field B (one). */
    function grouped() {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const a1 = addFeature(map, { fieldId: 'A' })
      const a2 = addFeature(map, { fieldId: 'A' })
      const b = addFeature(map, { fieldId: 'B' })
      return { service, map, a1, a2, b }
    }

    it('allows every delete when no predicate is set', () => {
      const { service } = grouped()
      service.selectGroup('A')
      expect(service.canDeleteGroup('A')).toBe(true)
      expect(service.canDeleteFocusedFeature()).toBe(true)
      expect(service.canDeleteSelection()).toBe(true)
    })

    it('refuses a group delete the predicate rejects', () => {
      const { service } = grouped()
      service.setCanDelete(() => false)
      service.selectGroup('A')

      expect(service.canDeleteGroup('A')).toBe(false)
      service.deleteGroup('A')
      expect(service.getGroups().map((g) => g.key).sort()).toEqual(['A', 'B'])
    })

    it('refuses a focused-feature delete the predicate rejects', () => {
      const { service, a1 } = grouped()
      service.setCanDelete(() => false)
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      expect(service.canDeleteFocusedFeature()).toBe(false)
      service.deleteFocusedFeature()
      expect(service.getGroups().find((g) => g.key === 'A')?.features).toHaveLength(2)
    })

    it('refuses a selection delete the predicate rejects', () => {
      const { service } = grouped()
      service.setCanDelete(() => false)
      service.selectGroup('A')

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()
      expect(service.getGroups().map((g) => g.key).sort()).toEqual(['A', 'B'])
    })

    it('consults a whole-group delete with feature: null', () => {
      const { service } = grouped()
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.canDeleteGroup('A')

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('A')
      expect(seen[0].feature).toBeNull()
    })

    it('consults a polygon delete with that polygon, when the group survives', () => {
      const { service, a1 } = grouped()
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      service.canDeleteFocusedFeature()

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('A')
      expect(seen[0].feature).not.toBeNull()
    })

    it('consults the last polygon of a group as a group delete', () => {
      const { service, b } = grouped()
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.selectGroup('B')
      service['_focusedFeature'] = b

      service.canDeleteFocusedFeature()

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('B')
      // B has one polygon, so removing it empties the group: this is a group
      // delete however it was asked for.
      expect(seen[0].feature).toBeNull()
    })

    it('refuses to delete a feature that declares editable: false', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const retired = addFeature(map, {
        fieldId: 'R',
        styleOptions: { editable: false },
      })
      service.selectGroup('R')
      service['_focusedFeature'] = retired

      expect(service.canDeleteFocusedFeature()).toBe(false)
      expect(service.canDeleteGroup('R')).toBe(false)

      service.deleteGroup('R')
      expect(service.getGroups().map((g) => g.key)).toEqual(['R'])
    })

    it('refuses a group delete when any one member is locked', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A', styleOptions: { editable: false } })

      expect(service.canDeleteGroup('A')).toBe(false)
    })

    it('still allows deleting an unlocked sibling of a locked feature', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const open = addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A', styleOptions: { editable: false } })
      service.selectGroup('A')
      service['_focusedFeature'] = open

      expect(service.canDeleteFocusedFeature()).toBe(true)
    })

    it('applies the lock in legacy mode too', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      const retired = addFeature(map, {
        fieldId: 'R',
        styleOptions: { editable: false },
      })
      service.selectGroup('R')
      service['_focusedFeature'] = retired

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()
      expect(service.getGroups().map((g) => g.key)).toEqual(['R'])
    })

    it('emits deleteBlocked once per refused command', () => {
      const { service } = grouped()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      service.setCanDelete(() => false)
      service.selectGroup('A')

      service.deleteGroup('A')

      expect(blocked).toHaveLength(1)
      expect(blocked[0].group.key).toBe('A')
      expect(blocked[0].feature).toBeNull()
    })

    it('never emits deleteBlocked from a query', () => {
      const { service } = grouped()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      service.setCanDelete(() => false)
      service.selectGroup('A')

      service.canDeleteGroup('A')
      service.canDeleteFocusedFeature()
      service.canDeleteSelection()

      expect(blocked).toHaveLength(0)
    })

    it('leaves the selection and the context-menu target untouched when refused', () => {
      const { service, a1 } = grouped()
      service.selectGroup('A')
      service['_focusedFeature'] = a1
      // Establish a context-menu target the way a right-click would, before
      // the predicate starts refusing.
      service['_setContextMenuTarget'](a1)
      const targetBefore = service['_contextMenuTargetSubject'].value
      service.setCanDelete(() => false)

      service.deleteFocusedFeature()

      expect(service.getSelectedFeature()).not.toBeNull()
      expect(service['_focusedFeature']).toBe(a1)
      // A refused delete removed nothing, so the open menu's target is not
      // dangling and must survive — unlike after a successful delete, which
      // clears it.
      expect(service['_contextMenuTargetSubject'].value).toBe(targetBefore)
    })

    it('does not consult the predicate, or emit, when there is nothing to delete', () => {
      const { service } = createService()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      const predicate = jest.fn(() => false)
      service.setCanDelete(predicate)

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()

      expect(predicate).not.toHaveBeenCalled()
      expect(blocked).toHaveLength(0)
    })

    it('reports false from every query before the map is ready', () => {
      const service = new GoogleMapsService(
        new MapValueManagerService(),
        zone,
        {} as ViewContainerRef,
      )
      expect(service.canDeleteSelection()).toBe(false)
      expect(service.canDeleteGroup('A')).toBe(false)
      expect(service.canDeleteFocusedFeature()).toBe(false)
    })
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/google-maps.service.spec.ts`
Expected: FAIL — `service.setCanDelete is not a function`.

- [ ] **Step 3: Implement the gate**

Add `featureAllows` to the existing import from `./feature-style/compute-feature-style`.

Add the state, near `_labelProperty`:

```ts
  private _canDelete: ((target: TheSeamMapGroupTarget) => boolean) | undefined

  private readonly _deleteBlockedSubject = new Subject<TheSeamMapGroupTarget>()
  /**
   * A delete that was attempted and refused. Fires only from the three delete
   * commands, never from their `canDelete*` queries — rendering a menu is not
   * an attempt.
   */
  public readonly deleteBlocked$ = this._deleteBlockedSubject.asObservable()
```

Complete the subject in `ngOnDestroy`, alongside the others:

```ts
    this._deleteBlockedSubject.complete()
```

Add the resolution helpers, directly above `deleteSelection()`:

```ts
  /**
   * The consumer's veto. Consulted for every delete on every path, and for
   * whether to offer a delete at all.
   */
  public setCanDelete(
    predicate: ((target: TheSeamMapGroupTarget) => boolean) | undefined | null,
  ): void {
    this._canDelete = predicate ?? undefined
  }

  /**
   * Pair a set of features to remove with the target to consult `canDelete`
   * with. `null` when there is nothing to delete — distinct from a refusal,
   * and the reason no honest target exists to report.
   */
  private _deletionOf(
    key: string | null,
    removing: google.maps.Data.Feature[],
  ): {
    removing: google.maps.Data.Feature[]
    target: TheSeamMapGroupTarget
  } | null {
    if (key === null || removing.length === 0) {
      return null
    }
    const resolved = this._registry.groupWithSources(key)
    if (!resolved) {
      return null
    }
    // The empty-group invariant: a delete that leaves the group with no
    // features at all is a group delete, whichever path asked for it — so
    // `feature: null` always means "this group is about to cease to exist"
    // and a consumer never has to count features itself. Compared against
    // `featuresIn`, not `resolved.sources`, because a feature with
    // unsupported geometry is missing from `sources` but still occupies the
    // group.
    const all = this._registry.featuresIn(key)
    const emptiesGroup = all.every((f) => removing.indexOf(f) !== -1)
    return {
      removing,
      target: this._targetFor(resolved, emptiesGroup ? null : removing[0]),
    }
  }

  /** Resolves the same features `_removeSelection()` would remove. */
  private _selectionDeletion() {
    this._assertInitialized()
    const removing: google.maps.Data.Feature[] = []
    this.googleMap.data.forEach((f) => {
      if (isFeatureSelected(f)) {
        removing.push(f)
      }
    })
    if (removing.length === 0) {
      return null
    }
    return this._deletionOf(this._registry.keyOf(removing[0]), removing)
  }

  /** Resolves the same features `_removeFocusedFeature()` would remove. */
  private _focusedFeatureDeletion() {
    const focused = this._focusedFeature
    if (focused === null) {
      return this._selectionDeletion()
    }
    return this._deletionOf(this._registry.keyOf(focused), [focused])
  }

  /** Resolves the same features `_removeGroup(key)` would remove. */
  private _groupDeletion(key: string) {
    return this._deletionOf(key, this._registry.featuresIn(key))
  }

  /**
   * Whether `removing` may be deleted: the feature-declared lock first, then
   * the consumer's predicate.
   *
   * MUST stay pure. It also answers menu-render questions, which are not
   * delete attempts — a side effect here would fire on every right-click.
   */
  private _mayDelete(
    removing: google.maps.Data.Feature[],
    target: TheSeamMapGroupTarget,
  ): boolean {
    // A feature the consumer locked against reshaping must not be removable
    // by another route: deleting a polygon changes the map's value at least
    // as much as reshaping it does. Same precedent as editable: false
    // implying draggable: false in compute-feature-style.ts.
    if (removing.some((f) => !featureAllows(f, 'editable'))) {
      return false
    }
    return this._canDelete?.(target) ?? true
  }
```

Add the three queries just below them. They guard on `mapReady` rather than asserting, because the component's context-menu stream evaluates before the map is ready:

```ts
  /** Whether "Delete Polygon" (or the `Delete` key) may act. */
  public canDeleteFocusedFeature(): boolean {
    if (!this.mapReady) {
      return false
    }
    const deletion = this._focusedFeatureDeletion()
    return deletion !== null && this._mayDelete(deletion.removing, deletion.target)
  }

  /** Whether "Delete Field" may act on `key`. */
  public canDeleteGroup(key: string): boolean {
    if (!this.mapReady) {
      return false
    }
    const deletion = this._groupDeletion(key)
    return deletion !== null && this._mayDelete(deletion.removing, deletion.target)
  }

  /** Whether the legacy "Delete" item (or the `Delete` key) may act. */
  public canDeleteSelection(): boolean {
    if (!this.mapReady) {
      return false
    }
    const deletion = this._selectionDeletion()
    return deletion !== null && this._mayDelete(deletion.removing, deletion.target)
  }
```

Finally give each public command its gate. Note the shape: when `deletion` is `null` the call falls through to the remover, which then does exactly what it does today for an empty set — nothing was refused, so nothing is reported.

```ts
  /**
   * Remove every selected feature, unless `canDelete` or a feature's own
   * `editable: false` refuses. A refused delete emits on `deleteBlocked$` and
   * changes nothing.
   */
  public deleteSelection(): void {
    this._assertInitialized()
    const deletion = this._selectionDeletion()
    if (deletion !== null && !this._mayDelete(deletion.removing, deletion.target)) {
      this._deleteBlockedSubject.next(deletion.target)
      return
    }
    this._removeSelection()
  }

  /**
   * Remove every feature in `key`'s group, unless `canDelete` or a feature's
   * own `editable: false` refuses. A refused delete emits on `deleteBlocked$`
   * and changes nothing.
   */
  public deleteGroup(key: string): void {
    this._assertInitialized()
    const deletion = this._groupDeletion(key)
    if (deletion !== null && !this._mayDelete(deletion.removing, deletion.target)) {
      this._deleteBlockedSubject.next(deletion.target)
      return
    }
    this._removeGroup(key)
  }

  /**
   * Remove the focused polygon — or, with nothing focused, the selection —
   * unless `canDelete` or a feature's own `editable: false` refuses. A
   * refused delete emits on `deleteBlocked$` and changes nothing.
   */
  public deleteFocusedFeature(): void {
    this._assertInitialized()
    const deletion = this._focusedFeatureDeletion()
    if (deletion !== null && !this._mayDelete(deletion.removing, deletion.target)) {
      this._deleteBlockedSubject.next(deletion.target)
      return
    }
    this._removeFocusedFeature()
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps`
Expected: PASS — the new gating tests, Task 4's characterization tests (unchanged, because an unset predicate and unlocked features refuse nothing), and the rest of the module.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/google-maps.service.spec.ts
git commit -m "feat(google-maps): gate every delete path on canDelete and the editable lock" -m "One resolver answers every 'may this be deleted?' question, and three query methods mirror the three delete commands so no path can delete without a gate. A delete that would empty a group is consulted as a group delete however it was asked for." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Pure context-menu item builder

The menu decision currently lives inside a `combineLatest` in the component's constructor, where it cannot be tested without a rendered map. Move it out.

**Files:**
- Create: `projects/ui-common/google-maps/context-menu/delete-menu-items.ts`
- Create: `projects/ui-common/google-maps/context-menu/delete-menu-items.spec.ts`
- Modify: `projects/ui-common/google-maps/public-api.ts`

**Interfaces:**
- Consumes: `TheSeamMapGroupTarget`, `TheSeamMapInteractionMode`.
- Produces: `TheSeamMapContextMenuItem` (`{ label: string; action: () => void }`), `TheSeamMapDeleteMenuContext`, and `buildDeleteMenuItems(context: TheSeamMapDeleteMenuContext): TheSeamMapContextMenuItem[]`.

Note the `action` signature change: the component's current private interface is `action: (item: TheSeamMapContextMenuItem) => void` and the template calls `item.action(item)`. Nothing uses the argument, so the exported version drops it; Task 7 updates the template.

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/google-maps/context-menu/delete-menu-items.spec.ts`:

```ts
import { TheSeamMapGroupTarget } from '../feature-groups/feature-group'
import {
  buildDeleteMenuItems,
  TheSeamMapDeleteMenuContext,
} from './delete-menu-items'

function target(key: string, featureCount: number): TheSeamMapGroupTarget {
  const features = Array.from({ length: featureCount }, () => ({
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [] },
  }))
  return { group: { key, features }, feature: features[0] ?? null }
}

function context(
  overrides: Partial<TheSeamMapDeleteMenuContext> = {},
): TheSeamMapDeleteMenuContext {
  return {
    mode: 'grouped',
    editingEnabled: true,
    target: target('A', 2),
    canDeleteFocusedFeature: () => true,
    canDeleteGroup: () => true,
    canDeleteSelection: () => true,
    deleteFocusedFeature: () => undefined,
    deleteGroup: () => undefined,
    deleteSelection: () => undefined,
    ...overrides,
  }
}

describe('buildDeleteMenuItems', () => {
  it('offers nothing when editing is disabled', () => {
    expect(buildDeleteMenuItems(context({ editingEnabled: false }))).toEqual([])
  })

  it('offers both items for a multi-polygon group', () => {
    const items = buildDeleteMenuItems(context())
    expect(items.map((i) => i.label)).toEqual(['Delete Polygon', 'Delete Field'])
  })

  it('offers only Delete Field for a single-polygon group', () => {
    // The two would be the same act, and only one of them names it.
    const items = buildDeleteMenuItems(context({ target: target('B', 1) }))
    expect(items.map((i) => i.label)).toEqual(['Delete Field'])
  })

  it('hides Delete Polygon when the focused polygon may not be deleted', () => {
    const items = buildDeleteMenuItems(
      context({ canDeleteFocusedFeature: () => false }),
    )
    expect(items.map((i) => i.label)).toEqual(['Delete Field'])
  })

  it('hides Delete Field when the group may not be deleted', () => {
    const items = buildDeleteMenuItems(context({ canDeleteGroup: () => false }))
    expect(items.map((i) => i.label)).toEqual(['Delete Polygon'])
  })

  it('offers nothing when every delete is refused', () => {
    const items = buildDeleteMenuItems(
      context({
        canDeleteFocusedFeature: () => false,
        canDeleteGroup: () => false,
      }),
    )
    expect(items).toEqual([])
  })

  it('offers nothing in grouped mode with no target', () => {
    expect(buildDeleteMenuItems(context({ target: null }))).toEqual([])
  })

  it('offers a single Delete in legacy mode', () => {
    const items = buildDeleteMenuItems(context({ mode: 'legacy' }))
    expect(items.map((i) => i.label)).toEqual(['Delete'])
  })

  it('offers nothing in legacy mode when the selection may not be deleted', () => {
    const items = buildDeleteMenuItems(
      context({ mode: 'legacy', canDeleteSelection: () => false }),
    )
    expect(items).toEqual([])
  })

  it('wires each item to its own command', () => {
    const calls: string[] = []
    const items = buildDeleteMenuItems(
      context({
        deleteFocusedFeature: () => calls.push('focused'),
        deleteGroup: (key) => calls.push(`group:${key}`),
      }),
    )
    items.forEach((item) => item.action())
    expect(calls).toEqual(['focused', 'group:A'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/context-menu/delete-menu-items.spec.ts`
Expected: FAIL — cannot resolve `./delete-menu-items`.

- [ ] **Step 3: Implement the builder**

Create `projects/ui-common/google-maps/context-menu/delete-menu-items.ts`:

```ts
import { TheSeamMapGroupTarget } from '../feature-groups/feature-group'
import { TheSeamMapInteractionMode } from '../interaction/interaction-mode'

/** One entry in the map's feature context menu. */
export interface TheSeamMapContextMenuItem {
  label: string
  action: () => void
}

/**
 * What the menu needs from the map service to decide what to offer.
 *
 * Narrowed to the query/command pairs so the decision stays a pure function
 * and can be tested without a rendered map.
 */
export interface TheSeamMapDeleteMenuContext {
  mode: TheSeamMapInteractionMode
  editingEnabled: boolean
  /** The group the menu is opening for, or null when nothing is targeted. */
  target: TheSeamMapGroupTarget | null

  canDeleteFocusedFeature(): boolean
  canDeleteGroup(key: string): boolean
  canDeleteSelection(): boolean

  deleteFocusedFeature(): void
  deleteGroup(key: string): void
  deleteSelection(): void
}

/**
 * The delete items the feature context menu offers.
 *
 * A refused item is not rendered at all. The caller is expected to hide the
 * menu entirely for an empty list, so a consumer that refuses everything gets
 * no menu rather than an empty one.
 */
export function buildDeleteMenuItems(
  context: TheSeamMapDeleteMenuContext,
): TheSeamMapContextMenuItem[] {
  const items: TheSeamMapContextMenuItem[] = []

  if (!context.editingEnabled) {
    return items
  }

  if (context.mode !== 'grouped') {
    if (context.canDeleteSelection()) {
      items.push({ label: 'Delete', action: () => context.deleteSelection() })
    }
    return items
  }

  const target = context.target
  if (!target) {
    return items
  }
  const key = target.group.key

  // On a one-polygon field, "Delete Polygon" and "Delete Field" are the same
  // act — the first empties the group without saying so. Offer only the one
  // that names what happens.
  if (target.group.features.length <= 1) {
    if (context.canDeleteGroup(key)) {
      items.push({
        label: 'Delete Field',
        action: () => context.deleteGroup(key),
      })
    }
    return items
  }

  if (context.canDeleteFocusedFeature()) {
    items.push({
      label: 'Delete Polygon',
      action: () => context.deleteFocusedFeature(),
    })
  }
  if (context.canDeleteGroup(key)) {
    items.push({
      label: 'Delete Field',
      action: () => context.deleteGroup(key),
    })
  }
  return items
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps/context-menu/delete-menu-items.spec.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Export it**

Add to `projects/ui-common/google-maps/public-api.ts`, below the `feature-groups/feature-group` line:

```ts
export * from './context-menu/delete-menu-items'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/google-maps/context-menu projects/ui-common/google-maps/public-api.ts
git commit -m "feat(google-maps): extract the delete context-menu decision into a pure builder" -m "The item list could not be tested without a rendered map while it lived inside a combineLatest in the component's constructor. Single-polygon groups now offer only 'Delete Field', which is what the act actually is." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Wire the component

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.ts`
- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.html`

**Interfaces:**
- Consumes: `setCanDelete` / `canDelete*` / `deleteBlocked$` (Task 5), `buildDeleteMenuItems` (Task 6).
- Produces: `@Input() canDelete`, `@Output() deleteBlocked` on `TheSeamGoogleMapsComponent`.

- [ ] **Step 1: Replace the local interface with the exported one**

Delete the local `interface TheSeamMapContextMenuItem { … }` declaration near the top of `google-maps.component.ts` and import the module instead:

```ts
import {
  buildDeleteMenuItems,
  TheSeamMapContextMenuItem,
} from '../context-menu/delete-menu-items'
```

- [ ] **Step 2: Add the input and output**

Add the input below `selectedGroupKey`:

```ts
  /**
   * Vetoes a delete. Return `false` to refuse the target.
   *
   * `target.feature === null` means the whole group is about to cease to
   * exist — every polygon of it is going, however the delete was asked for.
   * A non-null `feature` means one polygon is being removed from a group that
   * survives.
   *
   * **Consulted when no delete is happening.** It decides whether to render
   * the context-menu items, so it runs on every context-menu open. A
   * predicate that logs an attempt or flips state will do so on every
   * right-click. It must also be deterministic for a given target, or the
   * menu and the `Delete` key can disagree about the same target.
   *
   * That is a correctness warning, not a performance one. The context-menu
   * target changes only on a right-click, a delete, and a value write, so
   * this runs a handful of times per gesture.
   *
   * Passing nothing refuses nothing, which is the behaviour this component
   * has always had.
   */
  @Input() canDelete: ((target: TheSeamMapGroupTarget) => boolean) | undefined
```

Add the output below `featureHoverChange`:

```ts
  /**
   * A delete was attempted and refused — in practice, the `Delete` key, since
   * a refused menu item is never rendered. Emits the target that was refused
   * so the consumer can explain why; only the consumer knows the reason.
   */
  @Output() deleteBlocked = new EventEmitter<TheSeamMapGroupTarget>()
```

- [ ] **Step 3: Subscribe to `deleteBlocked$`**

In the constructor, directly after the `hover$` subscription:

```ts
    // No `skip(1)` here, unlike `selection$` and `hover$`: `deleteBlocked$` is
    // a plain Subject with no replayed initial value to drop.
    this._googleMaps.deleteBlocked$
      .pipe(
        tap((target) => this.deleteBlocked.emit(target)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()
```

- [ ] **Step 4: Rebuild the menu stream through the pure builder**

Replace the whole `this._contextMenuItems$ = combineLatest([...])` assignment with:

```ts
    this._contextMenuItems$ = combineLatest([
      this._googleMaps.editingEnabled$,
      // The RIGHT-CLICKED feature's group — what "Delete Field" is
      // conceptually acting on, independent of what happens to be selected.
      // See `contextMenuTarget$`'s doc comment.
      this._googleMaps.contextMenuTarget$,
    ]).pipe(
      map(([editingEnabled, target]) =>
        buildDeleteMenuItems({
          mode: this.interactionMode,
          editingEnabled,
          target,
          canDeleteFocusedFeature: () =>
            this._googleMaps.canDeleteFocusedFeature(),
          canDeleteGroup: (key) => this._googleMaps.canDeleteGroup(key),
          canDeleteSelection: () => this._googleMaps.canDeleteSelection(),
          deleteFocusedFeature: () => this._googleMaps.deleteFocusedFeature(),
          deleteGroup: (key) => this._googleMaps.deleteGroup(key),
          deleteSelection: () => this._googleMaps.deleteSelection(),
        }),
      ),
      tap((items) => {
        if (items.length === 0) {
          this._googleMaps.setFeatureContextMenu(null)
        } else {
          this._googleMaps.setFeatureContextMenu(this.featureContextMenu)
        }
      }),
    )
```

- [ ] **Step 5: Forward the input and drop the dead handler**

In `ngOnChanges`, below the `selectedGroupKey` block:

```ts
    if (Object.prototype.hasOwnProperty.call(changes, 'canDelete')) {
      this._googleMaps.setCanDelete(this.canDelete)
    }
```

Delete `_onClickDeleteFeature()`. The legacy menu item now calls
`deleteSelection()` through the builder, and nothing else referenced it.

- [ ] **Step 6: Update the template**

In `google-maps.component.html`, change the menu item binding:

```html
    (click)="item.action()"
```

- [ ] **Step 7: Verify the build and lint pass**

Run: `npm run build:ui-common`
Expected: build succeeds. A failure naming `TheSeamMapContextMenuItem` means Step 1's import was missed.

Run: `npx eslint projects/ui-common/google-maps --ext .ts,.html`
Expected: no errors. An unused-import warning here means a leftover from Step 5.

- [ ] **Step 8: Run the module's tests**

Run: `npx jest --ci --runInBand projects/ui-common/google-maps`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add projects/ui-common/google-maps/google-maps/google-maps.component.ts projects/ui-common/google-maps/google-maps/google-maps.component.html
git commit -m "feat(google-maps): add canDelete and deleteBlocked to seam-google-maps" -m "A consumer can now veto a delete on every path, and hear about a refused Delete key press so it can explain why. Passing no predicate refuses nothing." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Stories

Storybook is not gated in CI, so these confirm the wiring against a real map rather than carrying the guarantees. They follow the existing file's conventions: `mapComponent(canvasElement)` waits for the map, `featureWithGroup(component, key)` finds a `Data.Feature`, and `google.maps.event.trigger` drives listeners.

**Files:**
- Modify: `projects/ui-common/google-maps/google-maps.stories.ts`

**Interfaces:**
- Consumes: everything from Tasks 3, 5, 6 and 7.
- Produces: nothing other tasks rely on.

- [ ] **Step 1: Add a fixture**

Add below the existing `RETIRED_FIELD_VALUE` declaration. `D` has two polygons so both menu items are offered; `E` has one so the single-item case is covered. Keys avoid `A`/`B`/`C`, which other fixtures use.

```ts
/**
 * One two-polygon field and one single-polygon field, for the delete-gating
 * stories: D exercises the two-item menu, E the single-polygon case where
 * "Delete Polygon" would empty the group and so is not offered.
 */
const DELETE_GATING_VALUE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { fieldId: 'D', FIELD_NAME: 'Twin Creek', plot: 1 },
      geometry: squareAt(-98.58, 37.65),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'D', FIELD_NAME: 'Twin Creek', plot: 2 },
      geometry: squareAt(-98.56, 37.65),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'E', FIELD_NAME: 'Lone Elm' },
      geometry: squareAt(-98.54, 37.65),
    },
  ],
}
```

- [ ] **Step 2: Add the stories**

Append to the end of `google-maps.stories.ts`:

```ts
export const GroupedSinglePolygonFieldOffersOnlyDeleteField: Story = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        featureLabelProperty="FIELD_NAME"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: DELETE_GATING_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    const data = component._googleMaps.googleMap.data

    // E has one polygon: deleting it empties the field, so the only honest
    // name for the act is "Delete Field".
    const lone = featureWithGroup(component, 'E')
    google.maps.event.trigger(data, 'click', { feature: lone })
    google.maps.event.trigger(data, 'contextmenu', { feature: lone })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items).toHaveLength(1)
    await expect(items[0].textContent?.trim()).toBe('Delete Field')
  },
}

export const GroupedCanDeleteHidesRefusedItems: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        featureLabelProperty="FIELD_NAME"
        [canDelete]="canDelete"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { ...args, value: DELETE_GATING_VALUE },
  }),
  args: {
    // Refuse only whole-field deletes, the way an app would for a producer
    // without the field-delete permission. Removing one polygon of a
    // multi-polygon field stays allowed.
    canDelete: (target: any) => target.feature !== null,
  },
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    const data = component._googleMaps.googleMap.data

    const twin = featureWithGroup(component, 'D')
    google.maps.event.trigger(data, 'click', { feature: twin })
    google.maps.event.trigger(data, 'contextmenu', { feature: twin })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items).toHaveLength(1)
    await expect(items[0].textContent?.trim()).toBe('Delete Polygon')
  },
}

export const GroupedBlockedDeleteKeyEmits: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        featureLabelProperty="FIELD_NAME"
        [canDelete]="canDelete"
        (deleteBlocked)="deleteBlocked($event)"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { ...args, value: DELETE_GATING_VALUE },
  }),
  args: {
    canDelete: () => false,
    deleteBlocked: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    const data = component._googleMaps.googleMap.data

    const lone = featureWithGroup(component, 'E')
    google.maps.event.trigger(data, 'click', { feature: lone })

    await userEvent.keyboard('{Delete}')

    await expect(featuresWithGroup(component, 'E')).toHaveLength(1)
    await expect(args.deleteBlocked).toHaveBeenCalledTimes(1)
    // E is a single-polygon field, so deleting it empties the group: the
    // refused target names the whole field, not one polygon.
    const target = (args.deleteBlocked as any).mock.calls[0][0]
    await expect(target.group.key).toBe('E')
    await expect(target.feature).toBeNull()
  },
}

export const GroupedRetiredFieldCannotBeDeleted: Story = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: RETIRED_FIELD_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    const data = component._googleMaps.googleMap.data

    // B declares styleOptions.editable: false. A feature locked against
    // reshaping must not be removable by another route either.
    const retired = featureWithGroup(component, 'B')
    google.maps.event.trigger(data, 'click', { feature: retired })
    google.maps.event.trigger(data, 'contextmenu', { feature: retired })
    await new Promise((resolve) => setTimeout(resolve, 250))

    // Every delete is refused, so no menu opens at all.
    await expect(canvasElement.querySelectorAll('[role="menuitem"]')).toHaveLength(0)

    await userEvent.keyboard('{Delete}')
    await expect(featuresWithGroup(component, 'B')).toHaveLength(1)
  },
}

export const GroupedSetGroupLabelKeepsSelection: Story = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        featureLabelProperty="FIELD_NAME"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: DELETE_GATING_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    component.selectGroup('D')
    await expect(isFeatureSelected(featureWithGroup(component, 'D'))).toBe(true)

    await expect(component.setGroupLabel('D', 'Twin Creek North')).toBe(true)

    // The rename must land on every polygon of the field...
    for (const feature of featuresWithGroup(component, 'D')) {
      await expect(feature.getProperty('FIELD_NAME')).toBe('Twin Creek North')
    }
    // ...without the selection being cleared, which is what a full value
    // write through setData() would have done on every keystroke.
    await expect(isFeatureSelected(featureWithGroup(component, 'D'))).toBe(true)

    await expect(component.setGroupLabel('NOPE', 'Nowhere')).toBe(false)
  },
}
```

- [ ] **Step 3: Run the stories**

Storybook listens on **port 6007 and is IPv6-only**, so a `127.0.0.1` probe fails even when it is running. Assume the developer already has it open; starting a new instance takes several minutes.

Run: `npm run test-storybook -- --testNamePattern "Grouped(SinglePolygon|CanDelete|BlockedDelete|RetiredFieldCannotBeDeleted|SetGroupLabel).*"`
Expected: the five new stories pass. If the runner cannot connect, ask the developer to start Storybook rather than starting one.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/google-maps/google-maps.stories.ts
git commit -m "test(google-maps): add stories for delete gating and in-place labels" -m "Covers the single-polygon menu, a canDelete that refuses only field deletes, the deleteBlocked emission from the Delete key, the editable lock, and setGroupLabel leaving the selection alone." -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Final verification

- [ ] Run the full Jest suite: `npm run test:ci`. Expected: PASS.
- [ ] Run lint: `npm run lint`. Expected: no errors.
- [ ] Build the library: `npm run build:ui-common`. Expected: succeeds.
- [ ] Confirm `npx jest --ci --runInBand projects/ui-common/google-maps` reports the new spec files: `google-maps.service.spec.ts`, `context-menu/delete-menu-items.spec.ts`, `testing/fake-google-maps.spec.ts`.

## Deviation from the spec, recorded

The spec says to extract "the removal-plus-bookkeeping body into a private `_removeFeatures(...)`" — singular. Task 4 extracts **three** private removers instead, one per command, because the three bookkeeping blocks genuinely differ (which subject is re-synced, and when `_focusedFeature` is cleared). Unifying them would be a behaviour change in its own right, in `'legacy'` mode among others, smuggled inside a refactor. The spec's actual requirement — "No public command may call another public command" — is met.
