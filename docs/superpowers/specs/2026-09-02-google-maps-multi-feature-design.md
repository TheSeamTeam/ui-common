# Google Maps Multi-Feature Management — Design

Epic [NCC-2872](https://theseam.youtrack.cloud/issue/NCC-2872) · Date: 2026-09-02 ·
Branch: `marklb/map-interaction-improve`

## Context

`@theseam/ui-common/google-maps` was built for one producer editing the boundary
of one field. `TheSeam.Sustainability.Cotton.App` is being rebuilt so a producer
can upload and manage **many** fields in a single map, with a properties panel
beside it.

The findings this design rests on were gathered app-side and recorded in the
Cotton repo at `docs/superpowers/specs/2026-09-01-ui-common-map-handoff.md`.
That document is the record of *what the app needs*; this one is the record of
*what the library will do*. Read it for the consumer inventory, the verified
"already works" list, and the traps.

### What already works and is not rebuilt

- **Many polygons on one map.** `MapValue` is a whole `FeatureCollection` and
  `setStyle` runs per feature. The collapse to a single field happens in the
  app's `mergePolygons()` call, not here.
- **Per-feature styling from GeoJSON properties**, via
  `properties.styleOptions` and `SUPPORTED_PROPERTY_STYLE_OPTIONS`.
- **Consumer-supplied map controls**, via `seam-map-control` and `MapControl`.
  `google-maps.component.html` has no `<ng-content>` deliberately — controls
  mount through `addControl()` against the Maps JS API, not the DOM. Do not add
  a projection slot.

### Non-goals

- Multi-part **geometry** authoring is not the requirement. A field is already a
  `FeatureCollection` that may hold several `Polygon` features, and the app's
  control validates `isOnlyGeometryTypesValidator(['Polygon', 'MultiPolygon'])`.
  What is new is that the map now holds features belonging to *different*
  fields.
- Label collision de-confliction. Explicitly deferred; see
  [Labels](#labels).
- Undo. Named here only because it is the mitigation the interaction model
  avoids needing.
- `noInnerRingsValidator()` and `allowDrawingHoleInPolygon = false` stay as they
  are. Hole prevention is an app-side decision confirmed on NCC-2873 (other MRV
  platforms, Regrow specifically, reject holes).

## Constraints

**Additive and opt-in.** Three apps consume this module across five call sites.
Only Cotton is asking for anything. `TheSeam.PeanutTrustClient` and
`TheSeam.DataCommons.App` must need no PR, so every behavioural change is gated
behind a new input that defaults to today's behavior.

**Accidental mutation is the risk to design against.** Boundaries arrive from
external sources. A stray click that nudges a vertex on an imported boundary is
close to unrecoverable without an undo feature, which does not exist. Clicking a
polygon must not, on its own, arm geometry editing.

**`setData()` replaces the whole value.** That is correct `ControlValueAccessor`
semantics and is not changing. The consequence for this design is narrow: a
feature's handle cannot be the `Data.Feature` instance, because those are new
objects after every write. It has to be carried in the GeoJSON.

## Architecture

### Interaction models as a strategy

The behaviour that differs between old and new usage is threaded through seven
listeners in a 724-line `GoogleMapsService`. Rather than adding
`if (mode === …)` to each, the differing behaviour is extracted behind a small
interface with two implementations:

```
GoogleMapsService                 (Maps API + terra-draw plumbing; unchanged role)
  └── MapInteractionModel         (interface)
        ├── LegacyInteractionModel
        └── GroupedInteractionModel
```

The model answers five questions and nothing else:

| Question | Called from |
| --- | --- |
| What does a click on a feature do? | `data` `click` listener |
| What does a click on empty map do? | map `click` listener |
| What happens when a draw finishes? | `_onDrawFinished()` |
| What interaction flags does this feature get? | `data.setStyle()` callback |
| May this feature open a context menu? | `data` `contextmenu` listener |

This keeps the service focused on wrapping the API, gives each model a surface
small enough to unit test, and makes the eventual default flip a file deletion
rather than an untangling.

`interactionMode: 'legacy' | 'grouped'` selects it, defaulting to `'legacy'`.

### `'legacy'` — unchanged

Exactly today's behavior. The draw button toggles terra-draw. Clicking a polygon
selects it, and `editingEnabled` alone decides whether that arms handles. Peanut
and DataCommons keep working untouched.

The bug fixes and additive capabilities in
[Styling and editability](#styling-and-editability) apply in both models; they
are corrections and opt-in properties, not behaviour changes.

### `'grouped'` — the new model

Three pieces of state: `editMode` (toggled by the map's button control),
`selection` (a group key or `null`), and `drawing` (terra-draw live).

| `editMode` | selection | click on a polygon | click on empty map | drag |
| --- | --- | --- | --- | --- |
| off | — | select its group, emit | clear selection | pan |
| on | none | **ignored** (`clickable: false`) | start a draw | pan |
| on | group G | G's own geometry goes to Google's vertex/midpoint editor; other polygons ignored | start a draw | vertex drag, or body drag to move that polygon; else pan |

Draw completion:

- **nothing selected** → a new feature, which becomes the selection. The
  exterior-containment search is skipped entirely, so a polygon drawn across an
  unrelated field does not cut a hole in it.
- **group G selected** → a new feature carrying G's group value, joining that
  field. Or, when the drawn polygon lies fully inside one of G's polygons and
  `allowDrawingHoleInPolygon` is true, a hole in that polygon instead.

`Escape` cascades, one concern per press: cancel an in-progress draw → clear the
selection → leave edit mode. Three presses from any state gets fully out.

`Delete` removes the **focused polygon only**, matching today's granularity — a
polygon added to the wrong field otherwise has no way out short of exporting the
GeoJSON, editing it by hand, and re-importing. A new
`deleteFocusedFeature()` backs the key in `'grouped'` mode; `'legacy'` keeps
calling `deleteSelection()`. `deleteSelection()` itself is unchanged — it
removes everything selected, which in `'grouped'` mode is the whole group, and
is what the explicit **Delete Field** context-menu item calls. See
[Context menu](#context-menu).

**Known consequence.** With edit mode on, switching to a different field means
turning edit mode off first. This is accepted. Nothing else can be true at the
same time without a click meaning two things, and a mode the user toggles
deliberately is the point — it is what stops a click from reshaping an imported
boundary.

## Identity and grouping

One input, `featureGroupProperty`, names the property that groups features into
a field. The consumer chooses the name so it cannot collide with properties in
an uploaded file — a real concern, since a customer's John Deere export carries
`FIELD_ID`, `FARM_ID`, `CLIENT_ID`, `ORG_ID` and more.

A feature's group key resolves as:

1. `properties[featureGroupProperty]`, when present.
2. Otherwise a map-assigned key, stored in a new `__app__groupKey` app property.

App properties are already stripped by `stripAppFeaturePropertiesFromJson()` and
already skipped by the `setproperty` change listener, so a map-assigned key
neither leaks into the value nor triggers a value change. Because the component
guards `setData()` against `MapValueSource.FeatureChange`, map-assigned keys
survive for as long as the value is not written from outside — which is the
correct lifetime, since an external write is a genuinely new value.

With `featureGroupProperty` unset, every feature is its own group. That is
precisely legacy semantics, which is why the two models can share the grouping
code.

### Drawn features and transient groups

Every feature belongs to a group, drawn ones included. What differs is which:

- Drawn with a group selected → it joins that group. When the group is not
  transient, the library **writes** `properties[featureGroupProperty]` onto the
  new feature. This is the one place the library sets a consumer-owned property,
  and it is necessary — otherwise the join would not survive `getGeoJson()` and
  the app could not tell which field the polygon belongs to. Only ever written
  on features the map itself created; uploaded geometry is never given a group
  value it did not arrive with.
- Drawn with nothing selected → a new transient group, keyed by
  `__app__groupKey` alone.

So the signal for "this is a new field" is not the absence of a group. It is
`transient: true` on the emitted group, which is equivalent to the feature
having no value at `properties[featureGroupProperty]`. The app assigns its own
identifier at save time; that identifier need not be a GeoJSON property at
all.

### Emitted shape

Outputs emit plain GeoJSON rather than `google.maps.Data.Feature` instances, for
two reasons that do not depend on how large a group turns out to be:

- **A `Data.Feature` handed to a consumer goes stale.** `setData()` removes and
  recreates every feature, so an instance a consumer stored is detached from the
  map after the next value write, with no signal that it happened. GeoJSON is
  inert data that cannot go stale.
- **It keeps consumers off the Maps API.** The abstraction boundary this module
  was originally meant to hold stays where it belongs, and the emitted types
  match what consumers already handle everywhere else — `MapValue` is GeoJSON,
  the validators take GeoJSON, `mergePolygons()` takes GeoJSON.

The cost is a geometry conversion per emit. That is bounded by the size of one
group rather than the whole map, and only on selection and hover changes.

```ts
export interface TheSeamMapFeatureGroup {
  /** `properties[featureGroupProperty]`, or a map-assigned key when the feature carries none. */
  key: string
  /** True when the key was map-assigned — these features are not yet a saved field. */
  transient: boolean
  features: Feature<Polygon | MultiPolygon>[]
}

export interface TheSeamMapGroupTarget {
  group: TheSeamMapFeatureGroup
  /**
   * The polygon the interaction landed on. For a selection this is the one
   * `Delete` acts on; for a hover, the one under the cursor.
   */
  feature: Feature<Polygon | MultiPolygon> | null
}
```

`feature` is a reference into `group.features`, not a copy.

Selection and hover carry identical payloads, so this is one type rather than
two structurally identical ones. It supersedes the `TheSeamMapSelection` /
`focused` naming used while designing.

## Public API

### Inputs

| Input | Type | Default | Notes |
| --- | --- | --- | --- |
| `interactionMode` | `'legacy' \| 'grouped'` | `'legacy'` | Selects the interaction model. |
| `featureGroupProperty` | `string \| undefined` | `undefined` | Property name that groups features into a field. Unset = one group per feature. |
| `featureLabelProperty` | `string \| undefined` | `undefined` | Property name holding a group's label text. Unset = no labels. |
| `selectedGroupKey` | `string \| null` | `null` | Declarative preselection. Applied when the input value changes, on map-ready, and after each external value write — **not** on every change-detection pass, so it never fights a user's click. Not two-way; `selectionChange` is the read side. |

### Outputs

```ts
@Output() selectionChange = new EventEmitter<TheSeamMapGroupTarget | null>()
@Output() featureHoverChange = new EventEmitter<TheSeamMapGroupTarget | null>()
```

`featureHoverChange` closes the remainder of the handoff's gap 2. The
`mouseover`/`mouseout` listeners already exist and only toggle private styling;
this exposes them. It is the piece `modal-attributes-map` currently fakes from
the list side with its own `_mapControlItemHovered`.

Both outputs emit in `'legacy'` mode too, where each feature is its own group.
That is additive: today the only `@Output` is `mapReady`.

### Methods

On `TheSeamGoogleMapsComponent`, delegating to `GoogleMapsService`:

```ts
selectGroup(key: string): boolean        // false when no such group
clearSelection(): void
fitGroup(key: string, padding?: number | google.maps.Padding): boolean
panToGroup(key: string): boolean
getGroups(): TheSeamMapFeatureGroup[]
setEditMode(enabled: boolean): void
isEditMode(): boolean
```

This is the handoff's gap 5 — needed to open the modal with a field preselected
and to jump to a field after import.

### Draw button control

`TheSeamGoogleMapsDrawButtonControlComponent` currently toggles `drawing$`. In
`'grouped'` mode it toggles `editMode` instead, and its label and icon follow
the active interaction model. One button either way; the semantics come from the
model rather than from a second control.

### Context menu

`data` `contextmenu` currently returns early unless the feature is selected, so
in `'grouped'` mode with edit mode off a right-click would silently do nothing.
Whether it opens becomes the model's fifth decision:

- `'legacy'` — selected only. **Unchanged.** Right-clicking an unselected
  feature does nothing today and still does nothing, so no consumer sees a
  difference.
- `'grouped'` — opens for the feature under the cursor regardless of selection.

Items in `'grouped'` mode:

- **Delete Polygon** — always. Calls `deleteFocusedFeature()`.
- **Delete Field** — only when the group holds more than one feature. Calls the
  existing `deleteSelection()`, which in this model means the whole group.

`'legacy'` keeps its single **Delete** item, wired to `deleteSelection()` as
today.

## Styling and editability

### Precedence

`setStyle`'s selected branch currently *replaces* `opts` wholesale, discarding
the consumer's `styleOptions` merge, and merges the **hovered** properties where
it should merge the selected ones. That second half is the handoff's reported
bug: `getSelectedStyleOptionsDefinedByFeature` is exported but never called, so
`styleOptionsSelected` does nothing and hovered styling leaks into the selected
style. Both are fixed by making the order explicit:

```
FEATURE_STYLE_OPTIONS_DEFAULT
  → properties.styleOptions
  → FEATURE_STYLE_OPTIONS_SELECTED       (when selected)
  → properties.styleOptionsSelected       (when selected)
  → interaction clamp                     (always last)
```

Safe to change: `modal-attributes-map` is the only consumer of these features
and uses neither `styleOptionsSelected` nor `styleOptionsHovered`.

A consequence worth stating: because `FEATURE_STYLE_OPTIONS_SELECTED` comes
after `styleOptions`, selecting a muted retired field recolors it green unless
the consumer also sets `styleOptionsSelected`. That is explicit and now
possible, where before it was silently impossible.

### The clamp

`editable`, `draggable`, and `clickable` are admitted to
`SUPPORTED_PROPERTY_STYLE_OPTIONS`, but the clamp runs last and is
**one-directional — a feature can only opt out, never opt in**:

```
effective editable  = declared(editable,  default true)
                      && editingEnabled
                      && isSelected
                      && (grouped ? editMode : true)
effective draggable = same
effective clickable = declared(clickable, default true)
                      && model.allowsClicks(feature)
```

`declared(x)` reads from `styleOptionsSelected` when selected, else
`styleOptions`.

This is the handoff's gap 4. A retired field sets `editable: false` and stays
unreshapeable while its neighbours do not — and no property in an uploaded file
can arm editing when the mode says no. The `clickable` half is what makes
"polygons ignore clicks while edit mode is armed with nothing selected" work,
with the model, not the consumer, winning that decision.

Generalises beyond retired fields to any per-feature lock, such as a boundary
frozen once its questionnaire is submitted.

### Selection is per group

`__app__isSelected` stays the storage, but it is set on **every** feature in the
group, so a field's polygons style and arm together. `isFeatureSelected()` and
`setFeatureSelected()` keep their signatures; the group-wide application happens
above them.

## Labels

`label` is listed in `SUPPORTED_PROPERTY_STYLE_OPTIONS` but Google's Data layer
honours it only on **Point** features. It is silently inert on polygons — no
error, no label. This is the handoff's gap 1.

**Renderer: a single custom `OverlayView`** holding one child `div` per group.
One overlay, not one per group: with 74 fields that is a single `draw()` per
frame updating 74 child positions rather than 74 overlays each doing projection
work. `GoogleMapsContextMenu` is the existing precedent for the pattern in this
repo.

- Pane: `overlayLayer`, with `pointer-events: none`. Labels never participate in
  hit testing, so they cannot interfere with clicks, drawing, or the
  context-menu overlay.
- Position: the centre of the group's combined bounds, via the existing
  `getFeatureBounds()` / `getBoundsWithAllFeatures()` helpers.
- Text: `properties[featureLabelProperty]` from the first feature in the group
  that carries a non-empty value. Other features' values are ignored.

  The library does **not** require a group's features to agree, and does not
  keep them in sync — a label is presentation, not state the map owns. But
  because a disagreement renders as one plausible-looking label rather than as
  anything wrong, it warns once in dev mode when features in one group carry
  differing non-empty values. Which one wins in that case is deliberately
  unspecified: `google.maps.Data`'s iteration order is not documented as stable,
  so relying on "first" would be relying on an implementation detail. Keeping
  them consistent is the app's business; being told when they are not is the
  library's.
- Hidden while drawing.
- Hidden when the group's projected bounds are smaller than a pixel threshold.
  This self-tunes as the map zooms out, so no `minZoom` input is needed and a
  label never floats over a shape too small to read.
- **No collision de-confliction.** Documented as a known limitation rather than
  half-solved. With 74 fields, labels will overlap at low zoom; the pixel
  threshold reduces but does not eliminate it.

Rejected alternatives: `AdvancedMarkerElement` has built-in `collisionBehavior`,
which is the one thing this leaves on the table, but it requires the `marker`
library and a Cloud-console **Map ID** in map options — every consuming app
would need one configured before labels worked. A `Point` feature per group
would reuse the working `label` support, but those points land in the same
`map.data` the value serializes from, so `getGeoJson()` would emit them,
breaking `isOnlyGeometryTypesValidator(['Polygon', 'MultiPolygon'])`, and they
would be clickable and selectable.

**Styling wrinkle to verify early.** The label divs are created outside
Angular's view, so emulated encapsulation will not reach them.
`:host ::ng-deep .seam-map-feature-label` should work, since Google's panes live
inside the component's host element, but that needs proving rather than
assuming. If it does not hold, the fallback is a stylesheet asset in a
`google-maps/styles/` directory, following the pattern already used by
`breadcrumbs/styles/` and listed in the `assets` array of
`projects/ui-common/ng-package.json`, with `$seam-map-*` prefixed variables.

## MultiPolygon

A customer's John Deere export of 74 fields is 42 `Polygon` and 32
`MultiPolygon`, so MultiPolygon is not an edge case. It is currently
second-class: `geoJsonPolygonFromDataFeature()` returns `undefined` for anything
that is not a `Polygon`, which silently disables the exterior-containment search
and hole-cutting on exactly those features.

New helpers in `google-maps-feature-helpers.ts`:

| Helper | Purpose |
| --- | --- |
| `geoJsonFeatureFromDataFeature()` | Read a feature as a GeoJSON `Feature<Polygon \| MultiPolygon>`. Required by the outputs. |
| `polygonsFromDataFeature()` | Every part of a feature, so containment can match one part of a MultiPolygon. |
| `dataMultiPolygonFromGeoJson()` | Write modified MultiPolygon geometry back. |

`getFeatureBounds()` already works for any geometry, since it uses
`forEachLatLng`.

**Verify before building on it:** that `Data.addGeoJson()` / `toGeoJson()`
round-trips `MultiPolygon` rather than degrading it to a `GeometryCollection`.
If it degrades, the value fails the app's
`isOnlyGeometryTypesValidator(['Polygon', 'MultiPolygon'])`, and that changes
this plan. This is the first thing to prove, not the last.

## Error handling

The service's existing posture is kept: `_assertInitialized()` throws in dev
mode when the Maps API is touched before it loads, and the API loader's failure
is caught into `_gmApiLoaded` emitting `false`.

New failure modes are non-throwing, because they are all "the consumer named
something that is not there", which must not break a map:

| Situation | Behaviour |
| --- | --- |
| `selectGroup`/`fitGroup`/`panToGroup` with an unknown key | Returns `false`. No throw, no selection change. |
| `selectedGroupKey` names a group not in the current value | Selection clears and `selectionChange` emits `null`. Warns once in dev mode. |
| `featureGroupProperty` names a property no feature has | Every feature becomes its own group. Legitimate, so no warning. |
| `featureLabelProperty` names a property a group lacks | That group renders no label. |
| Features in one group carry differing non-empty label values | One is rendered; which is unspecified. Warns once in dev mode. |
| A feature is neither `Polygon` nor `MultiPolygon` | Excluded from groups, outputs, and labels; still renders. Warns once in dev mode. |

## Verification

**Jest.** Add `**/google-maps/**/*.spec.ts` to `testMatch` in
`projects/ui-common/jest.config.ts`. The directory has no specs today, so this
cannot break the suite, and it moves the repo toward the goal of covering
everything that should be covered.

Unit-testable without the Maps API:

- group key resolution, including map-assigned keys and the ungrouped fallback
- the style precedence chain and every row of the clamp table
- the new GeoJSON helpers, and the existing ones, against a stubbed
  `global.google.maps.Data` — these construct `google.maps.Data.Polygon`, so a
  small fake is needed, and building it once unlocks testing the helpers that
  already exist
- the label pixel-threshold rule, as a pure function of projected bounds
- each `MapInteractionModel`'s four decisions, driven by a fake service — this
  is the main reason the strategy is worth extracting

**Storybook.** The interaction state machine gets stories with `play`
functions covering: click-selects-group with edit off, click-ignored with edit
armed and nothing selected, draw-creates-new-group, draw-joins-selected-group,
the `Escape` cascade, `Delete` removing only the focused polygon, per-feature
`editable: false` surviving selection, and labels appearing and hiding.

The map does render in Storybook today without an API key, but with a
"For development purposes only" watermark and a dismissible "This page can't
load Google Maps correctly" dialog. That dialog is harmless when working by
hand and likely to interfere with `play` functions. So:

1. Add `.env.local` and `.env*.local` to `.gitignore` — it currently has no
   `env` entry at all, and this library is on a **public** remote while the apps
   are private. This lands before any key goes into a file.
2. Read `process.env.STORYBOOK_GOOGLE_MAPS_API_KEY` in
   `google-maps.stories.ts`. Storybook 9 loads `.env.local` and exposes
   `STORYBOOK_`-prefixed variables to the preview with no `main.js` change.
3. Have the play functions dismiss the dialog defensively, so stories pass with
   or without a key.

Storybook is not gated in CI — stories are neither type-checked nor run before
merge — so these stories must be run by hand before merging.

**Traps carried over from the app session:** `test-storybook` path arguments are
regexes, and a path containing `+field-print-analysis` reads `s+` as a
quantifier, matching nothing while reporting `0 matches` rather than erroring —
pass a filename fragment. `Component not found in compodoc JSON` is cosmetic.
Never put a class instance in Storybook `args`; build it in `render`.

**Manual smoke test, separately:** the `seam-map-control` /
`MAP_CONTROLS_SERVICE` path dates from roughly 2022 and several Angular majors
ago, and `modal-attributes-map` is its only exercise. The Cotton modal will
depend on it, so confirm it still works on the current version.

## Consumer impact

| App | Call sites | Change needed |
| --- | --- | --- |
| `TheSeam.Sustainability.Cotton.App` | 1 | Opts in: `interactionMode`, `featureGroupProperty`, `featureLabelProperty`, `selectionChange`. Must also call `mergePolygons()` per group rather than over the whole value. |
| `TheSeam.PeanutTrustClient` | 1 | **None.** |
| `TheSeam.DataCommons.App` | 3 | **None required**, but see the note below. `modal-attributes-map` could later drop its `_mapControlItemHovered` workaround in favour of `featureHoverChange`. |

**One correction is visible in `'legacy'` mode.** Fixing the precedence chain
means `properties.styleOptions` is no longer discarded when a feature is
selected. `modal-attributes-map` is the only consumer of that property and sets
`fillColor` and `visible` — so a selected feature there will now keep its
consumer-set fill instead of reverting entirely to
`FEATURE_STYLE_OPTIONS_SELECTED`, and a feature marked `visible: false` stays
hidden when selected rather than reappearing. Both are the intended behaviour
and neither can throw, but `modal-attributes-map` should be looked at before
merge. The handoff flags it as a quickly-written proof of concept that may not
be actively used; confirm which.

Released as `feat:` — a minor bump. Nothing breaks a public signature.

### Deprecation path

`'legacy'` exists so apps nobody is working in need no PR. It is not permanent:
deprecate `interactionMode: 'legacy'` in this release, and when a major is next
cut, flip the default to `'grouped'` and delete `LegacyInteractionModel`. The
strategy boundary is what makes that a deletion.

## Out of scope

Real, but unrelated. Noted for separate tickets rather than folded in.

- `isEmptyInputValue` has drifted from Angular's, which now routes through
  `lengthOrSize()` to avoid treating an object with a `length` property as
  empty.
- `passwordUppercaseValidator` throws on a non-string value.
- `seam-tabbed` is slated for a rewrite as two components, route-driven and not.
- `TheSeamMapsControlComponent` would fit better as a directive; it is a
  component with an empty template.
- The upstream terra-draw pointer-control race
  ([terra-draw#710](https://github.com/JamesLMilner/terra-draw/issues/710)),
  already documented in `_initTerraDraw()`. Not fixable in this wrapper.
