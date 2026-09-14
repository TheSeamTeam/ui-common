# Closing-click double-delivery — investigation and fix

## Hypothesis: confirmed

Drove real, physical-timing mouse draws (via Playwright's CDP-level `page.mouse`,
not synthetic `dispatchEvent`) against the live Storybook at `localhost:6007`
(not restarted), in the `GroupedEditModeArmsDrawingWhenNothingSelected` story,
with temporary `console.log` instrumentation in `_onDrawFinished()`,
`stopDrawing()`, `_applySelection()`, and the map `click` listener.

~45 real closes with human-realistic timing variance produced zero misfires.
Aiming the closing click 4-9px off the exact first-vertex pixel (still inside
Terra Draw's 10px snap radius, but off the marker's own small DOM hit target)
reproduced it repeatedly: 13 confirmed misfires across 45 closes in that mode.
Every single one showed the identical ordering:

```
_onDrawFinished start
stopDrawing            (_drawingSubject -> false; isDrawing() now false)
_applySelection(newKey) (the new polygon becomes the selection)
map click               <- SECOND delivery, guard reads isDrawing()==false, PASSES
startDrawing called     <- GroupedInteractionModel.onMapClick's editMode branch re-arms
```

This is the hypothesis exactly: the physical closing click is delivered twice —
once (fast) through Terra Draw's own pointer-driven close detection, which is
what runs `_onDrawFinished()`/`stopDrawing()`, and again through Google's own
`click` recognition on the map, which the service's `googleMap.addListener('click', ...)`
is bound to directly. The second delivery consistently landed ~4-9ms after
`stopDrawing()`'s own timestamp — comfortably within one animation frame, never
anywhere close to a `setTimeout`-scale gap.

Confirmed the legacy consequence by code inspection rather than a second live
hunt (same shared listener/guard; only the model's `onMapClick` differs):
`LegacyInteractionModel.onMapClick()` calls `selectGroup(null, null)`
unconditionally, so the same late click clears the selection the draw just
made — the map ends up in neither the editing nor the drawing state, matching
the reported legacy symptom exactly.

Never reproduced from any `play()`-driven / synthetic-event draw, consistent
with the ticket's observation — this needed genuine CDP-level mouse timing.

## One correction to the hypothesis: the proposed discriminator does not hold

The task's suggested `domEvent.timeStamp`-predates-the-finish check was tried
first. It does not work here. In every one of the 13 captured misfires, the
late click's own `domEvent.timeStamp` was a few milliseconds **after**
`stopDrawing()`'s timestamp, not before — indistinguishable from a genuinely
fresh click by timestamp alone. A separate raw-event probe (native
`mouseup`/`click` listeners added directly to `document`) confirmed the
browser's own native click fires ~1ms after mouseup, with no built-in
click-vs-drag deferral visible at that layer — so whatever produces the ~5-9ms
gap for the *second* Google Maps delivery appears to stamp its own synthetic
`click` at the moment it dispatches, not at the original pointer event's time.
Comparing timestamps would therefore not have caught these actual misfires.

## The fix: one-shot suppression flag, bounded by two `requestAnimationFrame` hops

`_suppressNextMapClick` is armed at the very top of `_onDrawFinished()` —
before its early-return for an unusable draw, since the echo can follow either
outcome — and consumed (and cleared) by the very next `click` the map listener
receives. To stop it lingering forever when the echo never arrives (the normal
case for most real closes, and true of every synthetic/`play()`-driven draw,
confirmed above), it also self-clears after two `requestAnimationFrame`
callbacks: comfortably past the observed ~5-9ms gap (a single frame is
~16ms), while two real actions — even fast automated ones — are never going to
land within two animation frames of each other, so an unrelated later click is
never at risk of being swallowed. A `setTimeout` was deliberately not used —
it would "solve" this by guessing a safe wall-clock delay, which is exactly
the kind of timing window this fix avoids introducing.

Verified directly against the live browser:
- Re-ran the same real-mouse reproduction (25 closes, same offset technique):
  **zero** misfires of the bug signature (new selection + incremented feature
  count + `isDrawing()` back to `true`) after the fix, versus 13/50 before it.
- Forced the worst case directly — `google.maps.event.trigger(map, 'click', {domEvent: {timeStamp: performance.now()}, latLng: null})`
  immediately after a real finish — confirmed the new selection survives
  untouched and drawing does not restart.
- Confirmed no lingering: after waiting past the two-frame window, a forced
  map click is *not* swallowed and behaves as a normal fresh click.

## Regression stories (real automated coverage for a bug automation couldn't otherwise reach)

- `GroupedLateMapClickAfterFinishStaysInEditingState` — real draw via
  `drawSquare()`, then forces the late map click via
  `google.maps.event.trigger(map, 'click', ...)` immediately after the finish.
  Asserts `isDrawing()` stays `false`, the selection stays on the new group's
  key, and the new feature's `editable` style stays armed.
- `LegacyLateMapClickAfterFinishKeepsSelection` — same forced late click after
  a legacy-mode draw. Asserts the just-drawn feature stays selected (not
  cleared to nothing) and drawing stays off.

## Unrelated environment issue found and fixed along the way

`npm run build:ui-common` failed silently (exit 127, no error text) partway
through the `@theseam/ui-common/google-maps` entry point, immediately after
the Angular/TS compile step, on every attempt with the fix applied. Bisected
by stashing/restoring pieces of the diff: the *baseline* (no changes) built
fine, *stories.ts alone* built fine, but *any* variant of the `service.ts`
fix (including a `setTimeout`-based variant tried purely to rule out
`requestAnimationFrame` as the cause) failed identically. The actual cause was
a stale `.angular/cache/**/ng-packagr/tsbuildinfo/theseam-ui-common-google-maps.tsbuildinfo`
incremental-build cache left over from before this session's edits, which
was already present at the very start of this task. Deleting `.angular/cache`
resolved it permanently; the full `build:ui-common` now completes cleanly
(exit 0, ~19.5s) with the fix in place. Not a code defect.

## Standing constraint: `'legacy'` inertness

Verified, not assumed: the fix touches only the shared map `click` listener in
`_initFeatureStyling()` and adds one field plus one private helper method. It
does not change `LegacyInteractionModel`, `GroupedInteractionModel`,
`public-api.ts`, or any other call site. `LegacyClickStillArmsEditing` and
`LegacyDrawButtonTogglesDrawing` (pre-existing legacy regression stories)
still pass unchanged, and the new `LegacyLateMapClickAfterFinishKeepsSelection`
story passed directly on the first run — the suppression flag protects legacy
mode identically to grouped mode, since both share the one listener.

## Five checks (verbatim tails)

**`npm run lint`**
```
✖ 48 problems (0 errors, 48 warnings)
```
Same count as this branch's pre-existing baseline; no new warnings in the
touched files (the one `no-console` warning still reported in
`google-maps.service.ts` is the pre-existing `_warnAboutLabelDisagreement()`
call, untouched by this change).

**`npm run test:ci`**
```
Test Suites: 114 passed, 114 total
Tests:       934 passed, 934 total
Snapshots:   0 total
Time:        35.798 s, estimated 39 s
Ran all test suites.
```

**`npm run build:ui-common`**
```
Built Angular Package
- from: C:/Users/mark.berry/dev_home/git/TheSeam.UiCommon/projects/ui-common
- to:   C:/Users/mark.berry/dev_home/git/TheSeam.UiCommon/dist/ui-common
Build at: 2026-09-09T18:15:17.736Z - Time: 19552ms
```
(See "Unrelated environment issue" above — required clearing a stale
`.angular/cache` first; unrelated to this fix's code.)

**`npm run build-storybook`**
```
info => Output directory: C:\Users\mark.berry\dev_home\git\TheSeam.UiCommon\storybook-static
```
Exit 0.

**`npm run test-storybook -- google-maps`** — run twice, as requested:

Run 1:
```
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        87.586 s
Ran all test suites matching /google-maps/i.
```

Run 2:
```
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
```
Both runs: 30/30 (28 pre-existing + the 2 new regression stories), exit 0.
Storybook `:6007` confirmed healthy throughout and never restarted.

## Commit

`77acb82d` — `fix(google-maps): suppress the closing click's late echo on the map click listener`
