# Google Maps: delete gating, the `editable` lock, and live group labels

Date: 2026-09-12 · Epic [NCC-2872](https://theseam.youtrack.cloud/issue/NCC-2872)

Covers items 1, 2, and 3 of the second `@theseam/ui-common` handoff from the
Cotton app — the three map findings. Items 4 and 5 (modal) and item 6
(`seam-tabbed`) are deliberately out of scope and belong on their own branches.

Work lands on `marklb/map-interaction-improve`, alongside the unmerged grouped
interaction model it completes.

## Why these three together

They are one feature set, not three tickets that happen to share a directory:

- Items 1 and 2 gate the same three delete paths and must resolve through a
  single decision point, or a path acquires a delete without a gate.
- Item 3 is independent in behaviour but shares the branch, because the grouped
  interaction model it extends has not shipped.

## Back-compatibility exposure: almost none

`master` does not carry `editable` or `draggable` in
`SUPPORTED_PROPERTY_STYLE_OPTIONS` — the list lives in `google-maps.service.ts`
there and stops at `clickable`/`visible`. No released build can express
`styleOptions: { editable: false }` at all, so item 2 cannot change behaviour any
consumer currently relies on, in either interaction mode.

`canDelete` is opt-in: a consumer that passes nothing gets exactly today's
behaviour. `setGroupLabel` and the grouped interaction model are unreleased
outside a local branch.

The one real constraint stays what it was: `'legacy'` mode behaviour must not
drift, because two apps depend on it and are not being updated.

---

## 1. One delete gate

### The paths

| Path | Command | Mode |
| --- | --- | --- |
| Context menu "Delete Polygon" | `deleteFocusedFeature()` | grouped |
| Context menu "Delete Field" | `deleteGroup(key)` | grouped |
| Context menu "Delete" | `deleteSelection()` | legacy |
| `Delete` key | `deleteFocusedFeature()` | grouped |
| `Delete` key | `deleteSelection()` | legacy |

### Service surface

```ts
setCanDelete(
  predicate: ((target: TheSeamMapGroupTarget) => boolean) | undefined | null,
): void

canDeleteFocusedFeature(): boolean
canDeleteGroup(key: string): boolean
canDeleteSelection(): boolean

readonly deleteBlocked$: Observable<TheSeamMapGroupTarget>
```

The three queries mirror the three commands one-for-one. That pairing is the
point: it makes a command without a matching gate visible as an asymmetry rather
than as a silent hole.

Each query resolves its own set of `Data.Feature`s to remove, builds the target,
and delegates to one shared resolver:

```ts
private _mayDelete(
  removing: google.maps.Data.Feature[],
  target: TheSeamMapGroupTarget,
): boolean
```

which answers in a fixed order:

1. `false` if **any** feature in `removing` is editing-locked (see §2).
2. otherwise the consumer predicate's answer, defaulting to `true` when no
   predicate is set.

`_mayDelete` **must be pure** — no emission, no state change. It also answers
menu-render questions, which are not delete attempts.

### When there is nothing to delete

Distinct from a refusal, and must not be conflated with one. `removing` is empty
when no feature is focused and nothing is selected, or when `key` names no group.
In that case:

- the query returns `false` — there is no delete to offer, so no menu item
  renders;
- the command does **not** emit `deleteBlocked$` — nothing was refused, because
  nothing was asked for, and there is no honest target to emit.

The consumer predicate is not consulted at all in this case. It answers "may this
target be deleted?", and there is no target.

The command does **not** early-return either. It falls through to its
`_remove*()` body, which finds nothing to remove and does whatever bookkeeping
it already did. This is deliberate, not an oversight: `deleteSelection()` with
nothing selected already ran `_removeSelection()`, whose `clearSelection()` is
observable — it clears `_focusedFeature` and re-syncs `selection$`. An early
return would have removed that, which is a `'legacy'` behaviour change, and
legacy must not drift. Gating therefore only ever *blocks* a delete; it never
skips work a command already did.

`canDeleteFocusedFeature()` resolves `removing` the way `deleteFocusedFeature()`
does today: the focused feature when there is one, otherwise **the features the
data layer's own raw selected flags mark** — the same set `_removeSelection()`
iterates — otherwise empty. Reading the raw flags rather than the selected
group's `featuresIn()` is what the paragraph above demands (the query must
resolve the same set the command removes), and the two genuinely diverge:
`startDrawing()` raw-deselects every feature via `setFeatureSelected` without
touching `_selectionSubject`, so the subject can name a group while no feature
in it reads as selected.

### The empty-group invariant

Target construction lives in one place and follows one rule:

> If `removing` covers every feature in the group, the target is
> `{ group, feature: null }`. Otherwise it is `{ group, feature: <the polygon> }`.

So `feature: null` means **"this group is about to cease to exist"**, on every
path. A consumer writes one rule for "may this field be deleted" and one for "may
a polygon be removed from this field", and never counts features itself.

Consequences, all intended:

- `deleteFocusedFeature()` on a single-polygon group consults as a group delete.
- The `Delete` key on a single-polygon group does the same.
- `deleteGroup(key)` always consults as a group delete.
- `deleteSelection()` in legacy always empties its group, so always consults as a
  group delete.

One exception exists, for a feature no target can name at all — see the second
**Known limit** below. It is resolved by refusing the delete, not by weakening
what `feature: null` promises.

### Menu items

`_contextMenuItems$` in `TheSeamGoogleMapsComponent`:

- **grouped, single-feature group** — only `Delete Field`, gated on
  `canDeleteGroup(key)`. `Delete Polygon` is not rendered: on a one-polygon field
  the two are the same act, and only one of them names it. This removes the
  asymmetry the handoff flagged, where emptying a field was reachable by a path
  that did not say so.
- **grouped, multi-feature group** — `Delete Polygon` gated on
  `canDeleteFocusedFeature()`, then `Delete Field` gated on
  `canDeleteGroup(key)`.
- **legacy** — the existing single `Delete`, gated on `canDeleteSelection()`.

A refused item is **not rendered**. The existing `tap` already calls
`setFeatureContextMenu(null)` for an empty list, so when every delete is refused
the context menu does not open at all — there is no empty menu to explain.

### Refusal signalling

Only the **commands** signal. On refusal each pushes the target to
`deleteBlocked$` and returns without touching the data layer.

A hidden menu item cannot be clicked, so in practice `deleteBlocked$` fires from
the `Delete` key. It also fires if an item was rendered and the predicate's
answer changed before the click — that was a real attempt, and consistency is
worth more than the rarity of the case.

It never fires from `canDelete*()`. Menu rendering is not an attempt.

### Component surface

```ts
@Input() canDelete: ((target: TheSeamMapGroupTarget) => boolean) | undefined
@Output() deleteBlocked = new EventEmitter<TheSeamMapGroupTarget>()
```

`ngOnChanges` forwards `canDelete` to `setCanDelete()` under the same
`hasOwnProperty` pattern the other inputs use. The constructor pipes
`deleteBlocked$` into the output with `takeUntil(this._ngUnsubscribe)`.

No `skip(1)` here: `deleteBlocked$` is a plain `Subject`, not a
`BehaviorSubject`, so it has no replayed initial value to drop — unlike
`selection$` and `hover$`.

### The input's doc comment must say

- It is consulted **when no delete is happening** — it decides whether to render
  menu items, so it runs on every context-menu open. A consumer that logs an
  attempt or flips state inside it will fire on every right-click.
- It must be **deterministic for a given target**, or the menu and the `Delete`
  key can disagree.
- `feature: null` means the whole group is going away; a non-null `feature` means
  one polygon is being removed from a group that will survive.
- Not a performance warning. `contextMenuTarget$` emits only on a right-click,
  the delete paths, and `setData`, so this is a handful of calls per gesture.

### Why the target alone, with no `source`

Settled in the handoff and reaffirmed here:

- Adding a positional parameter later is source-compatible, so the object shape
  `({ target, source })` buys no future-proofing a positional one lacks.
- A `source` invites rules that differ by route, producing exactly the
  inconsistency the predicate exists to prevent — the `Delete` key becoming a way
  around a hidden menu item.
- There is no honest value for `source` at menu-render time, when no delete has
  been attempted.

**Known limit, recorded so the next person does not rediscover it.** The target
cannot express an operation that acts on a group without emptying it. A
hypothetical "Delete all others" would carry the polygon being *kept*, which
neither `feature: null` nor `feature: <polygon>` describes. That is the concrete
need that would justify revisiting the signature. It does not exist today.

**Second known limit, and the invariant's one exception.** The target also
cannot name a feature whose geometry is neither `Polygon` nor `MultiPolygon`.
`groupWithSources()` drops such a feature from `sources` and from the emitted
`group.features`, so it has never appeared in anything the consumer has seen —
yet it still occupies its group, and it is still reachable by a delete:
`_applySelection` sets the raw selected flag on every feature in
`featuresIn(key)`, so right-clicking one passes `allowsContextMenu()`, focuses
it, and offers "Delete Polygon".

Removing it from a group that survives therefore has no honest target. Reporting
`feature: null` would be a lie in the one direction that matters: it promises the
group is going, so a consumer whose rule is "a field may be deleted, an
individual polygon may not" would answer `true` and lose a polygon it meant to
keep.

The resolution, in `_mayDeleteResolved()`: **refuse that delete outright, but
only when a `canDelete` predicate is actually set.** The defect is lying to the
predicate, so fail closed exactly where a consumer's rule could be subverted, and
stay inert where there is none — there is nobody to lie to, and refusing
unconditionally would change `'legacy'` behaviour for unsupported-geometry
features, which is forbidden.

So the invariant holds as stated for every feature a consumer can see, and the
one feature it cannot see is not deleted behind its back instead of being
misdescribed. The refusal signals on `deleteBlocked$` like any other, carrying
`{ group, feature: null }` — an overstatement of scope, but the only value the
type admits, and one that only ever reports a refusal, so it can never authorise
a removal. Emitting nothing was the alternative, and that would leave a refused
delete indistinguishable from a successful one.

### Internal refactor this requires

`deleteFocusedFeature()` currently falls back to calling `deleteSelection()` when
`_focusedFeature` is null. Once both are gated, that nested call would run a
second gate and could emit `deleteBlocked$` twice or gate a different set.

Extract the removal-plus-bookkeeping body into a private `_removeFeatures(...)`
that does no gating. The public commands each gate once, then call it. **No
public command may call another public command.**

---

## 2. `editable: false` implies not-deletable

`computeFeatureStyle` resolves the opt-out flags per key, consulting
`styleOptionsSelected[option]` first when the feature is selected and falling
back to `styleOptions[option]`, with only an explicit `false` opting out. That
logic is currently an inline `wants()` closure.

Extract it so the lock and the style cannot drift:

```ts
// feature-style/compute-feature-style.ts
/**
 * Whether the feature declines to opt OUT of `option`, resolved per key across
 * `styleOptionsSelected` (when the feature is selected) then `styleOptions`.
 * Only an explicit `false` opts out.
 */
export function featureAllows(
  feature: google.maps.Data.Feature,
  option: 'editable' | 'draggable' | 'clickable',
): boolean
```

`computeFeatureStyle` is rewritten to call it — a pure extraction, no styling
behaviour change. `_mayDelete` becomes its second caller, via
`featureAllows(f, 'editable')`.

Rationale, matching the precedent already set for `draggable`: a feature the
consumer has locked should not be modifiable by another route. Deleting a polygon
changes the map's value at least as much as reshaping it does.

On selection state: every feature reachable by a delete path is in the selected
group — grouped mode requires the group to be selected before the context menu
opens, and legacy deletes the selection — so resolving through the same
selection-aware rule as `computeFeatureStyle` is consistent rather than subtle.

This is **not** a substitute for item 1. "The last polygon of a saved field" is a
live, relational condition; expressing it through `styleOptions` would mean
recomputing and writing the map value on every change.

---

## 3. `setGroupLabel`

### Surface

```ts
// GoogleMapsService, plus a mapReady-guarded delegate on the component
setGroupLabel(key: string, label: string): boolean
```

Writes `properties[featureLabelProperty]` onto every `Data.Feature` in the group.

Returns `false`:

- when no group carries `key`, or
- when `featureLabelProperty` is unset — there is no property to write to, and
  silence there would look like it worked. Warn in dev mode, matching the
  `selectedGroupKey` precedent in `_applySelectedGroupKey()`.

Skips the write for a feature that already holds that exact value, so
keystroke-level renaming does not fire redundant `setproperty` events. Writes to
every feature in `featuresIn(key)`, including any with unsupported geometry —
`_buildLabels()` iterates the whole data layer too, so excluding them would let a
stale label win.

The component delegate returns `false` when the map is not ready, matching the
documented non-throwing contract of `selectGroup` / `fitGroup` / `panToGroup`.

### Why this needs no new plumbing

The handoff assumed "every external value write lands in `setData()`". That holds
for writes through the `value` input, not for in-place property writes:

1. `feature.setProperty(...)` fires `setproperty` on the data layer.
2. `createFeatureChangeObservable` forwards it — the name is not an `__app__`
   property.
3. Its subscriber in `_initFeatureChangeListeners()` already calls
   `_labelsOverlay?.refresh()` and pushes the value as
   `MapValueSource.FeatureChange`.
4. The component's `valueChanged` tap routes `FeatureChange` **away** from
   `setData()`.

So the label repaints and the value updates, while selection and viewport are
untouched.

### The feedback loop is already closed

If the app writes the emitted value back through `[value]` or a form control,
`MapValueManagerService.setValue` finds `JSON.stringify(value)` identical to the
stored value and returns without emitting — no `setData()`, no cleared selection,
no re-fit. The value written back originated from the map, so it is identical by
construction.

Document this on the method: calling it **does** emit a value change, because the
label is part of the GeoJSON and the value genuinely changed.

### Deliberately not a general property setter

`setGroupProperties(key, props)` was considered and rejected. The second use case
it would appear to serve — muting a field the moment it retires — writes
`styleOptions`, which needs `_refreshStyles()`. A generic property setter would
not trigger that, so it would be a bag that appears to cover a case it silently
breaks. Retire-styling deserves its own `setGroupStyle()` when it is real.

---

## Testing

### Test infrastructure

`testing/fake-google-maps.ts` has no `Map`. Add an exported `FakeMap` carrying a
`FakeData` layer and extending `FakeMapsEventTarget`, plus the few methods
`setMap()` and its callees touch (`getDiv`, `fitBounds`, `setZoom`, `panTo`,
`controls`).

`setMap()` defers Terra Draw to the map's first `idle`, which the fake never
fires unless a spec asks, so the service is constructible under Jest without
Terra Draw. `NgZone` can be instantiated directly; `ViewContainerRef` is only
reached through the context-menu overlay and can be a stub in specs that never
open one.

### `google-maps.service.spec.ts` (new)

- Each of the three commands: refused by a `false` predicate, allowed by `true`,
  allowed with no predicate set.
- Each of the three queries returns the matching command's answer.
- The editing lock refuses a delete of a feature declaring
  `styleOptions: { editable: false }`, on every path, in both modes.
- A group delete is refused when **any** member is locked.
- The invariant: `deleteFocusedFeature()` on a single-feature group consults with
  `feature: null`; on a multi-feature group, with the polygon.
- `deleteBlocked$` fires once per refused command, and never from a query.
- Nothing to delete: the query returns `false`, the command no-ops, the predicate
  is never called, and `deleteBlocked$` stays silent.
- A refused command leaves the data layer, the selection, and
  `contextMenuTarget$` untouched.
- `setGroupLabel`: unknown key returns `false`; unset `featureLabelProperty`
  returns `false`; a successful write lands on every feature in the group and on
  no other group's; an unchanged value fires no `setproperty`.

### `compute-feature-style.spec.ts`

Add cases pinning `featureAllows` directly — per-key resolution,
`styleOptionsSelected` precedence when selected, and only `false` opting out — so
the extraction cannot drift from the styling path that shares it.

### Storybook

A story exercising the menu gating and the `deleteBlocked` output, for manual
confirmation. Not load-bearing: Storybook is not gated in CI, so the Jest specs
carry the guarantees.

## Out of scope

- Items 4 and 5 (`ModalBodyComponent` padding, `ModalRef` close veto) and item 6
  (`seam-tabbed`) — their own branches.
- The map's `padding` input. The handoff already established this is not a bug:
  on a raster map `fitBounds` floors to an integer zoom, so the input behaves like
  a boolean. Changing that means geographic padding, an explicit post-fit zoom, or
  a vector map — none of which this work needs.
- `setGroupStyle()`. Real when retire-styling is real.
