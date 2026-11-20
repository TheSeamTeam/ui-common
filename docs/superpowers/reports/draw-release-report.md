# Draw-release investigation report

## Task A — investigation findings

**The design doc's hypothesis is refuted.** `isDrawing()` reading Terra
Draw's `getMode()` was not the defect. Verified three independent ways:

1. **Isolated reproduction.** Built a minimal hand-rolled `TerraDrawAdapter`
   (no Google Maps, no browser) and drove a real `TerraDraw` +
   `TerraDrawPolyLineMode` through the exact sequence `_onDrawFinished` uses
   (`getSnapshotFeature` → `removeFeatures` → `setMode('static')`, all
   synchronously inside the `finish` listener). `getMode()` correctly read
   `'static'` afterward, and the cursor call sequence ended `"unset"`.
   `'static'` mode is auto-registered by Terra Draw's own constructor
   (`Object.assign({}, modes, { static: this._mode })`) regardless of what's
   passed in `modes` — the `TerraDrawPolyLineMode`-only `modes` array in
   `_initTerraDraw()` was never the problem.
2. **Real browser, single draw.** Using Playwright against the actual
   running Storybook instance, drove a real 5-click draw (grouped mode, edit
   mode armed) via real mouse events. Result: `isDrawing()` → `false`,
   `getMode()` → `'static'`, no leftover cursor-override `<style>` tag, and
   the newly-drawn+selected feature's live style came back
   `editable: true, draggable: true` — screenshot confirms visible vertex
   handles. Same result whether the draw starts a new group or joins an
   already-selected one.
3. **Real browser, repeated draws.** A **second** draw in the same session
   reliably reproduced both reported symptoms: `currentCoordinate` froze
   mid-sequence (clicks silently dropped), the draw never closed, and the
   session was left stuck with `isDrawing(): true, mode: 'polyline'` —
   permanent crosshair, handles disarmed. This is the **already-documented,
   upstream Terra Draw / Google Maps adapter pointer-capture race**
   ([terra-draw#710](https://github.com/JamesLMilner/terra-draw/issues/710)),
   called out in `_initTerraDraw()`'s own comment as "not fixable in this
   wrapper" and listed in the design doc's Out of scope section. Confirmed
   the existing recovery path works unmodified: `setEditMode(false)` then
   `setEditMode(true)` (the user's reported workaround) fully restores
   `isDrawing()`/mode/cursor, and a subsequent draw can proceed.

**Conclusion:** there was no fixable bug in `stopDrawing()`/`setMode`/cursor
release to begin with, and the actual trigger is explicitly out of scope.
Per the "make our own state authoritative" instruction, `isDrawing()` now
reads `_drawingSubject` (which `startDrawing()`/`stopDrawing()` fully
control) instead of asking Terra Draw's own `getMode()`, so a future
divergence in Terra Draw's internal state can never disagree with — or
silently disarm — this service's own bookkeeping. `stopDrawing()`'s
unconditional `setMode('static')` call, which already does the real work of
releasing Terra Draw's cursor/pointer state, is unchanged.

**Legacy inertness:** `LegacyInteractionModel.featureFlags()` never consults
`isDrawing` at all (`geometryEditingArmed: true` unconditionally), and
`LegacyInteractionModel.onMapClick()` never calls `startDrawing()`. The
authoritative-state change is a drop-in replacement with the same value at
every call site in both modes; `LegacyDrawButtonTogglesDrawing` (unchanged)
still passes.

## Task B — findings

Confirmed by reading `compute-feature-style.ts`: the existing clamp resolved
`editable` and `draggable` **independently** per key, so `styleOptions: {
editable: false }` alone left `draggable` at its default `true` — exactly
the reported bug (`GroupedRetiredFieldStaysUneditable`'s existing test
asserted `draggable: true` in that case, encoding the bug as intentional).

## Status: complete, all fixes applied

## Commits
- `7096bba2` — `fix(google-maps): make isDrawing() authoritative on our own draw state` (Task A)
- `7c6e918b` — `fix(google-maps): editable: false now implies draggable: false` (Task B)

## One line per fix
- A: `isDrawing()` now returns `this._drawingSubject.value` instead of
  `this._terraDraw?.getMode() === 'polyline'`; kept + cleaned up
  `GroupedDrawingStateReleasesAfterStop` story as the missing coverage.
- B: `computeFeatureStyle` now clamps `draggable` to `wants('draggable') &&
  wantsEditable && editingArmed`, so a declared `editable: false` (resolved
  through the same per-key `styleOptionsSelected ?? styleOptions` lookup)
  forces `draggable: false` too; `draggable: false` alone still does not
  affect `editable`. Doc comment updated; two spec cases added/updated in
  `compute-feature-style.spec.ts`; `GroupedRetiredFieldStaysUneditable` story
  updated to assert `draggable: false` for both retired fields.

## Verification (all run against this branch, in this order)

- `npm run lint` — **pass** (0 errors; 48 pre-existing `no-console`
  warnings, none in touched files).
- `npm run test:ci` — **pass** (114 suites, 928 tests).
- `npm run build:ui-common` — **pass**, exit 0, `google-maps` entry point
  built cleanly.
- `npm run build-storybook` — **pass**, exit 0 (pre-existing bundle-size
  warnings only, unrelated to these changes).
- `npm run test-storybook -- google-maps` — **pass**, 22/22 tests, including
  the new `GroupedDrawingStateReleasesAfterStop` story and the updated
  `GroupedRetiredFieldStaysUneditable` story.
