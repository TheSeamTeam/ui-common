# Design: Replace Google Maps Drawing Library with Terra Draw

**Date:** 2026-07-07
**Status:** Approved (pending spec review)
**Area:** `projects/ui-common/google-maps`, `projects/ui-common/utils/geo-json`

## Background

Google deprecated the Maps JavaScript API **Drawing Library**
(`google.maps.drawing.*`) in August 2025 and decommissioned it in **May 2026**.
Google provides no first-party replacement; the official deprecations page only
says to "switch to using alternatives." In practice Google steers developers to
**Terra Draw** (`terra-draw`), an open-source, GeoJSON-native drawing library
with a Google Maps adapter, and publishes an official Maps JS sample using it.

Our `seam-google-maps` wrapper uses the Drawing Library in exactly one place:
capturing the act of drawing a new polygon (`GoogleMapsService._drawingManager`).
Everything downstream — rendering, selection, hover, context menu, editing of
existing polygons, GeoJSON serialization — runs on `google.maps.Data`, which is
**not** deprecated.

Because the decommission date has already passed, the current
`DrawingManager` is at risk of breaking in the `quarterly` release channel our
loader defaults to. This migration is time-sensitive.

## Goals

- Replace `google.maps.drawing.DrawingManager` with Terra Draw for polygon input.
- Preserve all current drawing behavior, including the "draw a hole inside an
  existing polygon" cutout feature.
- Move the correctness-critical geometry math into pure, GeoJSON-only functions
  in `utils/geo-json` so it is unit-testable with no Google Maps mocking.
- No breaking changes to the public API consumed by our apps.

## Non-Goals

- The `google.maps.Marker` deprecation (not used for field boundaries).
- Places Autocomplete deprecations.
- Any generic, non-Google map abstraction layer.
- Service-level unit tests requiring a `google.maps.*` mock harness.

## Public API Contract (must not break)

`TheSeamGoogleMapsComponent`: `zoom`, `latitude`, `longitude`, `value`,
`editingEnabled`, `fitBounds`, `getGeoJson`.

`GoogleMapsService`: `setFeatureHoveredStyleOverride`, `googleMap` (apps read
`googleMap.data` to adjust `google.maps.Data.Feature` properties).

All other members (`stopDrawing`, `isDrawing`, `_drawingManager` internals, the
`polygoncomplete` handler, etc.) may change freely.

## Core Data Flow

```
User draws polygon
  → Terra Draw (polygon mode) emits `finish`
  → getSnapshotFeature(id): GeoJSON Polygon
  → PURE: validate min points → decide cutout vs. new → merge rings (rewind)
  → apply to google.maps.Data:
        cutout  → setGeometry() on the EXISTING exterior Data.Feature instance
        new     → add() a new Data.Feature
  → removeFeatures([id]) to clear Terra Draw's copy
  → select the resulting feature
```

GeoJSON is used only for computation and the cutout decision. Mutations are
applied to existing `google.maps.Data.Feature` instances via `setGeometry`,
never by recreating a feature (see Design Constraints).

## Design Constraints

### Feature-instance identity preservation

`google.maps.Data.Feature` instances (and their properties) are referenced
outside the wrapper — most notably a small app that implements a map-control
"legend": on hover it iterates `googleMap.data`, calls
`setFeatureHoveredStyleOverride`, and stores a control-only tracking property on
each feature instance.

Therefore:

- Cutout merges are applied by calling `setGeometry(...)` on the **existing**
  exterior `Data.Feature` instance. `setGeometry` swaps only the geometry
  object; the instance identity, `__app__isSelected`, and any custom properties
  persist. (This matches what `addInnerFeatureCutoutToExteriorFeature` already
  does today.)
- No existing `Data.Feature` is round-tripped to GeoJSON and rebuilt as a new
  instance.
- The only newly constructed `Data.Feature` is the freshly drawn polygon in the
  non-cutout case — nothing references it yet.
- Result: `setFeatureHoveredStyleOverride` and the legend app keep working
  unchanged; no refactor of that app is required.

## Dependencies & Loader

- Add `terra-draw` and `terra-draw-google-maps-adapter`. Keep `@types/google.maps`.
- Remove `'drawing'` from the requested `libraries` in consuming loader configs
  (e.g. `google-maps.stories.ts`). `lazy-google-maps-api-loader.ts` does not
  hardcode libraries, so it needs no change.
- Terra Draw's Google Maps adapter requires the map's DOM element to have an
  `id` and requires waiting for the instance's async `ready` event before
  setting a drawing mode. The map element id is set on `googleMap.getDiv()` if
  absent during init.

## Component Changes

### 1. Pure GeoJSON logic (`projects/ui-common/utils/geo-json`) — unit-tested

New / extracted pure functions operating on GeoJSON `Polygon` /
coordinate arrays (turf is pure JS and runs in jsdom):

- **`addHoleToPolygon(exterior: Polygon, hole: Polygon): Polygon`** — the cutout
  merge. Appends the hole's outer ring to the exterior polygon's rings as an
  interior ring, wound **opposite** the exterior ring using turf `rewind`
  (an upgrade over today's blind `.reverse()`, which assumed exterior and inner
  shared a winding direction — fragile when the exterior came from an imported
  GeoJSON with arbitrary winding). Primary test target. Extraction and
  replacement of `addInnerFeatureCutoutToExteriorFeature`.
- **`polygonContains(outer: Polygon, inner: Polygon): boolean`** — turf
  `booleanContains` on GeoJSON. Extraction of `featureContains`; used to select
  the exterior candidate for a cutout.
- **Min-point check** — extract `polygonViolatesMinMax` (and
  `collectionViolatesMinMax` if useful) from `min-max-points.validator.ts` into
  its own file so drawing and the validator share one implementation. Move the
  point-count test cases from `min-max-points.validator.spec.ts` onto the
  extracted function's spec; the validator spec keeps only wiring coverage
  (empty value, coercion, error object shape).

### 2. `closePolygons` idempotency fix (`close-polygons.ts`)

`closePolygon` currently does `c.push(c[0])` unconditionally with no start/end
guard, so it is not idempotent and double-closes already-closed rings.
Spec-valid GeoJSON is already closed, and Terra Draw emits closed polygons, so
this must be fixed before reusing it as the ring-closing utility. Also, its
signature accepts `Polygon | MultiPolygon` but the body only handles
`FeatureCollection` / `Feature`; a bare `Polygon` (what Terra Draw provides)
passes through untouched.

Changes:

- Add a start/end equality guard mirroring `fixPathDifferentStartingAndEndingPoint`.
  Exact float equality is correct here because the closing point is a literal
  copy of the start point (we compare a value to its own copy, not two
  independently-derived numbers), so decimal precision is not a concern.
- Handle bare `Polygon` / `MultiPolygon` in the body to match the signature.
- Add `close-polygons.spec.ts` (currently none): already-closed input, open
  input, repeat-call idempotency, MultiPolygon, bare geometry.
- Retire `fixPathDifferentStartingAndEndingPoint` in favor of `closePolygons`.
- Note: `closePolygons` has no in-repo caller (it is exported for consuming
  apps' upload flow). The fix is backward-compatible and strictly safer for that
  path, which previously double-closed valid uploads.

### 3. Terra Draw integration in `GoogleMapsService`

Replace the `_drawingManager` field with a private Terra Draw instance (no
separate provider class — a single provider does not warrant the abstraction).

- `_initDrawingManager()` → `_initTerraDraw()`: construct
  `new TerraDraw({ adapter: new TerraDrawGoogleMapsAdapter({ lib: google.maps, map: this.googleMap }), modes: [new TerraDrawPolygonMode()] })`,
  ensure the map div has an id, `start()`, wait for `ready`. `static` is the
  resting (non-drawing) mode.
- `polygoncomplete` handler → `draw.on('finish', (id, ctx) => ctx.action === 'draw' && ...)`:
  read `getSnapshotFeature(id)`, run the pure validate → contains → merge/add
  flow, apply per Core Data Flow, then `removeFeatures([id])`. A small
  `coordinates → google.maps.Data.Polygon` builder is the only remaining glue
  helper (replaces the `google.maps.Polygon`-based `createDataFeatureFromPolygon`).
- `getPossibleExteriorFeature` keeps iterating `data` synchronously (via the
  existing `polygonCoordinates` extractor) and delegates the math to
  `polygonContains`.
- `setEditingEnabled()` drawing branch → `draw.setMode('polygon')` vs
  `draw.setMode('static')`. Data-layer `editable` styling for existing features
  is unchanged.
- `stopDrawing()` → cancel the in-progress draw via mode toggle / Terra Draw's
  cancel. The `overlaycomplete` race-condition hack is deleted. Terra Draw
  natively handles Escape = cancel and Enter = finish.
- `isDrawing()` → `draw.getMode() !== 'static'`.
- `ngOnDestroy` → tear down the Terra Draw instance and listeners.

### 4. Draw-toggle map control

New Angular control component `TheSeamGoogleMapsDrawButtonControlComponent`,
mirroring the existing recenter/upload button components and registered via the
existing `MapControl` / `GoogleMapsControlsService` path. Toggles polygon vs.
static mode through the service; reflects `isDrawing` / `editingEnabled` state;
shown only when `editingEnabled`. Restores the on-map "draw" affordance that
Google's `drawingControl` provided, with no change required in consuming apps.
Exact map position finalized during implementation.

## Behavior Parity

- Preserved public contract per above.
- Internal `stopDrawing` / `isDrawing` keep their names and shapes so the
  component's Escape-key handler and `_onMapReady` flow work unchanged.
- `allowDrawingHoleInPolygon` cutout behavior preserved; winding upgrade makes
  it more reliable for imported exteriors.
- One intentional UX change: the draw button is now ours, not Google's built-in
  toolbar.

## Testing

Per decision: **unit-test the pure logic only.**

- New specs: `addHoleToPolygon` (including winding correctness and
  nested-inside detection), `polygonContains`, extracted min-point helper,
  and `close-polygons.spec.ts`.
- Relocate point-count cases from the min-max validator spec to the extracted
  helper's spec.
- The `google-maps` folder stays out of Jest `testMatch`; no service-level
  specs added. `utils/**/*.spec.ts` already runs, so the new geo-json specs are
  picked up automatically.

### Manual test checklist (Storybook `google-maps.stories.ts`)

- Draw a polygon; verify emitted GeoJSON.
- Cancel mid-draw via Escape and via the draw button.
- Draw a hole inside an existing polygon (`allowDrawingHoleInPolygon`).
- Edit/drag an existing polygon, including one with a hole.
- Delete a selected feature.
- Toggle `editingEnabled` on/off and confirm the draw control shows/hides and
  drawing stops.
- Confirm hover/legend-style overrides via `setFeatureHoveredStyleOverride`
  still work (feature identity preserved).

## Risks & Notes

- **Timeline:** the Drawing Library is already past decommission; verify whether
  it is currently broken in a consuming app before/after the change.
- **Adapter readiness:** drawing mode must not be enabled before Terra Draw's
  `ready` event; getting this wrong yields a silently non-functional draw button.
- **Winding upgrade** is the only deliberate behavior change; covered by tests.
```
