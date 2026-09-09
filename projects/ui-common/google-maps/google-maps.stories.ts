import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, fn, userEvent } from 'storybook/test'

import { provideAnimations } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

import { getComponentInstance } from '@theseam/ui-common/story-helpers'

import { TheSeamGoogleMapsComponent } from './google-maps/google-maps.component'
import { TheSeamGoogleMapsApiLoader } from './google-maps-api-loader/google-maps-api-loader'
import {
  TheSeamLazyMapsApiLoader,
  THESEAM_LAZY_MAPS_API_CONFIG,
} from './google-maps-api-loader/lazy-google-maps-api-loader'
import { isFeatureSelected } from './google-maps-feature-helpers'
import { TheSeamGoogleMapsRecenterButtonControlComponent } from './google-maps-recenter-button-control/google-maps-recenter-button-control.component'
import { TheSeamGoogleMapsModule } from './google-maps.module'

const meta: Meta<TheSeamGoogleMapsComponent> = {
  title: 'GoogleMaps/Components',
  component: TheSeamGoogleMapsComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        {
          provide: TheSeamGoogleMapsApiLoader,
          useClass: TheSeamLazyMapsApiLoader,
        },
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
      ],
    }),
    moduleMetadata({
      imports: [CommonModule, TheSeamGoogleMapsModule],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamGoogleMapsComponent>

export const Basic: Story = {
  render: (args) => ({
    template: `<seam-google-maps seamHoverClass="border border-warning"></seam-google-maps>`,
    props: args,
  }),
}

export const Control: Story = {
  render: (args) => ({
    moduleMetadata: {
      imports: [ReactiveFormsModule],
    },
    template: `
      <input type="text" />
      <seam-google-maps [formControl]="control"></seam-google-maps>
      <input type="text" />
      [{{ control.value | json }}]
    `,
    props: {
      ...args,
      control: new FormControl(),
    },
  }),
}

export const Places: Story = {
  render: (args) => ({
    template: `<input seamGoogleMapsPlacesAutocomplete />`,
    props: args,
  }),
}

export const PlacesComponent: Story = {
  render: (args) => ({
    template: `<seam-google-maps-places-autocomplete></seam-google-maps-places-autocomplete>`,
    props: args,
  }),
}

export const PlacesMapBind: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps-places-autocomplete></seam-google-maps-places-autocomplete>
      <seam-google-maps></seam-google-maps>
    `,
    props: args,
  }),
}

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
export const MultiPolygonRoundTrip: Story = {
  render: (args) => ({
    template: `<seam-google-maps #map [value]="value" style="height: 400px"></seam-google-maps>`,
    props: args,
  }),
  args: {
    value: MULTI_POLYGON_VALUE,
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('seam-google-maps')
    // Wait for the map to load the value into its data layer.
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const component = getComponentInstance(host, TheSeamGoogleMapsComponent)!
    const geoJson: any = await component.getGeoJson()
    const types = geoJson.features.map((f: any) => f.geometry.type).sort()
    await expect(types).toEqual(['MultiPolygon', 'Polygon'])
  },
}

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
      properties: { fieldId: 'A', FIELD_NAME: 'North 40', plot: 1 },
      geometry: squareAt(-98.58, 37.63),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'A', FIELD_NAME: 'North 40', plot: 2 },
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

/**
 * Two retired-looking fields for `GroupedRetiredFieldStaysUneditable`:
 * `B` declares both `styleOptions` (its resting colour) and
 * `styleOptionsSelected` (a muted colour of its own, for while selected);
 * `C` declares only `styleOptions`, no selected variant. Both opt out of
 * editing. Kept separate from `GROUPED_VALUE` so this fixture's extra group
 * doesn't change any other story's group count.
 */
const RETIRED_FIELD_VALUE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        fieldId: 'B',
        FIELD_NAME: 'Retired South',
        styleOptions: { fillColor: 'gray', editable: false },
        styleOptionsSelected: { fillColor: 'dimgray' },
      },
      geometry: squareAt(-98.58, 37.61),
    },
    {
      type: 'Feature',
      properties: {
        fieldId: 'C',
        FIELD_NAME: 'Plainly Styled',
        styleOptions: { fillColor: 'silver', editable: false },
      },
      geometry: squareAt(-98.56, 37.61),
    },
  ],
}

/**
 * Two two-polygon fields for `GroupedContextMenuActsOnRightClickedPolygon`:
 * both need more than one feature so "Delete Field" is offered, and X needs a
 * second polygon so a right-click can land on one different from whichever
 * was last focused by a plain click — X and Y, so neither collides with
 * `GROUPED_VALUE`'s A/B or `RETIRED_FIELD_VALUE`'s B/C.
 */
const TWO_FIELDS_VALUE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { fieldId: 'X' },
      geometry: squareAt(-98.44, 37.63),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'X' },
      geometry: squareAt(-98.42, 37.63),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'Y' },
      geometry: squareAt(-98.44, 37.61),
    },
    {
      type: 'Feature',
      properties: { fieldId: 'Y' },
      geometry: squareAt(-98.42, 37.61),
    },
  ],
}

/** Wait for the map to render and load its value. */
async function mapComponent(canvasElement: HTMLElement): Promise<any> {
  const host = canvasElement.querySelector('seam-google-maps')
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return getComponentInstance(host, TheSeamGoogleMapsComponent)
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

/** Every Data.Feature whose group property matches. */
function featuresWithGroup(component: any, key: string): any[] {
  const matches: any[] = []
  component._googleMaps.googleMap.data.forEach((f: any) => {
    if (f.getProperty('fieldId') === key) {
      matches.push(f)
    }
  })
  return matches
}

/**
 * Poll `predicate` until it's true. Needed for the terra-draw#710 recovery:
 * a `startDrawing()` call that lands while a recreated `TerraDraw` instance
 * is still starting up finishes entering drawing mode from that instance's
 * `ready` event, which fires asynchronously — so `isDrawing()` does not
 * necessarily flip synchronously the way it does on a non-recreating call.
 */
async function waitUntil(
  predicate: () => boolean,
  timeoutMs = 2000,
): Promise<void> {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitUntil: condition was not met before timeout')
    }
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}

/**
 * Places one real drawing vertex via a synthetic `pointerdown`/`pointerup`
 * pair dispatched on Terra Draw's own event-capturing overlay element —
 * the same element and event types (`pointerdown`/`pointerup`, not `click`)
 * its Google Maps adapter's `getAdapterListeners()` actually registers.
 * Calling `startDrawing()`/`stopDrawing()` alone never places a vertex or
 * touches the adapter's pointer capture at all — this does, which is what
 * lets `GroupedEmptyArmDoesNotRecreateTerraDraw` and
 * `GroupedRepeatedRealDrawsRecreateTerraDrawAndSurviveIt` (below) tell an
 * armed-but-empty session apart from a real one entirely from a `play`
 * function, with no manual mouse driving required.
 */
async function placeVertex(
  component: any,
  containerX: number,
  containerY: number,
): Promise<void> {
  const el = component._googleMaps
    .getDiv()
    .querySelector('div[style*="z-index: 3;"]') as HTMLElement
  const rect = el.getBoundingClientRect()
  // `userEvent.pointer` rather than hand-dispatched PointerEvents: Storybook
  // instruments it, so the interactions panel shows each click and its coords
  // (`userEvent.pointer((3) { coords: { clientX: 316, ... }, keys:
  // "[MouseLeft]", ... })`), which is what makes a failing draw debuggable
  // step by step. It also drives the full gesture — pointerover/enter/move,
  // pointerdown/mousedown, pointerup/mouseup, click — where the hand-rolled
  // version only dispatched pointerdown/pointerup, so it exercises Terra
  // Draw's listeners more faithfully rather than less.
  await userEvent.pointer({
    coords: { clientX: rect.left + containerX, clientY: rect.top + containerY },
    keys: '[MouseLeft]',
    target: el,
  })
}

/** Places 4 corners of a small square plus a closing click near the first
 * corner, finishing a real polygon the same way a real mouse-driven draw
 * would. */
async function drawSquare(component: any, x: number, y: number): Promise<void> {
  const pts: [number, number][] = [
    [x, y],
    [x + 80, y],
    [x + 80, y + 80],
    [x, y + 80],
    [x + 2, y + 2],
  ]
  for (const [px, py] of pts) {
    // Awaited deliberately, even though it costs the indentation under an
    // enclosing `step()`. Storybook's instrumenter tracks the parent call
    // synchronously, so only calls *initiated* inside the step callback's
    // synchronous run get nested under it. Dropping the `await` fires all
    // five clicks in one synchronous burst, which does nest them — but it
    // also means five concurrent `userEvent.pointer` calls share
    // user-event's internal pointer state, so their events can interleave.
    // Correct sequencing beats nicer grouping. To get both, pass `step` in
    // and wrap each vertex in its own step.
    await placeVertex(component, px, py)
  }
}

export const GroupedClickSelectsWholeField: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        featureLabelProperty="FIELD_NAME"
        [value]="value"
        (selectionChange)="selectionChange($event)"
        style="height: 400px"></seam-google-maps>
    `,
    props: args,
  }),
  args: {
    value: GROUPED_VALUE,
    selectionChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const component = await mapComponent(canvasElement)
    const [featureA1, featureA2] = featuresWithGroup(component, 'A')
    const featureB = featureWithGroup(component, 'B')

    // Nothing has been interacted with yet, so the output must be silent.
    // An `@Output` reports a change, not initial state — several paths clear
    // the selection defensively during setup, and each used to emit its own
    // `null` before the user had touched anything.
    await expect(args.selectionChange).not.toHaveBeenCalled()

    google.maps.event.trigger(component._googleMaps.googleMap.data, 'click', {
      feature: featureA1,
    })

    // Exactly one emission, and it is the click's. This is the actual proof a
    // click selected something: it fails if the trigger is removed, or if
    // GroupedInteractionModel.onFeatureClick is gutted to a no-op — unlike
    // getGroups(), which reflects grouping alone and is blind to selection.
    await expect(args.selectionChange).toHaveBeenCalledTimes(1)

    // `plot` distinguishes field A's two polygons, so this also pins that the
    // focused feature is the one clicked and that the group holds two
    // DIFFERENT features rather than the same one twice.
    //
    // The array literal pins the order as well as the length. Order comes from
    // `data.forEach` iteration, which Google does not document as stable
    // though it is insertion order in practice — if this ever flakes, that is
    // the reason.
    await expect(args.selectionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        feature: expect.objectContaining({
          properties: expect.objectContaining({ fieldId: 'A', plot: 1 }),
        }),
        group: expect.objectContaining({
          key: 'A',
          features: [
            expect.objectContaining({
              properties: expect.objectContaining({ fieldId: 'A', plot: 1 }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({ fieldId: 'A', plot: 2 }),
            }),
          ],
        }),
      }),
    )

    // Cross-check against the data layer itself: group-wide selection, not
    // per-feature selection, and field B is untouched.
    await expect(isFeatureSelected(featureA1)).toBe(true)
    await expect(isFeatureSelected(featureA2)).toBe(true)
    await expect(isFeatureSelected(featureB)).toBe(false)
  },
}

/**
 * The rule this pins: clicks are suppressed only while Terra Draw is
 * actually capturing pointer input — that is the one moment a click is
 * genuinely ambiguous between "select this" and "place a vertex". Edit mode
 * alone, with nothing selected and no draw in progress, is not that moment,
 * so a polygon stays clickable and a click can select a field without
 * leaving edit mode first. Replaces `GroupedEditModeIgnoresFeatureClicks`,
 * which pinned the opposite (and since-reversed) rule: that edit mode alone
 * made every non-selected polygon `clickable: false` for as long as edit mode
 * stayed on, which left no way to switch fields without leaving edit mode.
 */
export const GroupedEditModeAllowsClicksBetweenDraws: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    component.setEditMode(true)
    // Entering edit mode with nothing selected auto-arms drawing (F6) — cancel
    // it the same way a first Escape would, to reach the "edit mode on,
    // nothing selected, no draw in progress" state this story is actually
    // about. GroupedEditModeArmsDrawingWhenNothingSelected covers the arm
    // itself.
    service.stopDrawing()

    const feature = featureWithGroup(component, 'A')
    const clickable = () => service.googleMap.data.getStyle()(feature).clickable

    // Edit mode on, nothing selected, no draw in progress: still clickable.
    await expect(service.isDrawing()).toBe(false)
    await expect(clickable()).toBe(true)

    // A draw starting is what actually makes a click ambiguous.
    service.startDrawing()
    await waitUntil(() => service.isDrawing() === true)
    await expect(clickable()).toBe(false)

    // Once the draw ends, the ambiguity is gone and clicks resume.
    service.stopDrawing()
    await expect(service.isDrawing()).toBe(false)
    await expect(clickable()).toBe(true)
  },
}

/**
 * F6: pressing the edit-mode button with nothing selected arms nothing under
 * the old behaviour — the cursor switches to a crosshair, but the user's
 * FIRST click on the map only finishes arming Terra Draw and places no
 * vertex; a second click is what actually starts the polygon. Legacy does not
 * have this gap (its button calls startDrawing() directly), so grouped mode
 * is made to match: setEditMode(true) itself arms drawing when nothing is
 * selected, so the button press is what puts Terra Draw in crosshair mode
 * and the very next click places a vertex.
 */
export const GroupedEditModeArmsDrawingWhenNothingSelected: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps

    // GROUPED_VALUE's initial state has no selection.
    await expect(service.isDrawing()).toBe(false)
    component.setEditMode(true)

    // The button press itself armed Terra Draw — no separate startDrawing()
    // call needed for the very next click to place a vertex rather than being
    // swallowed arming it.
    await expect(service.isDrawing()).toBe(true)
    // The draw button's `_active` signal follows editMode$ in grouped mode
    // (not drawing$), so it still reads pressed while armed like this.
    await expect(component.isEditMode()).toBe(true)
  },
}

/**
 * F6's other branch: entering edit mode with a group already selected must
 * NOT arm drawing. The user is there to reshape that group via its
 * vertex/midpoint handles, and arming would make every click place a vertex
 * instead of selecting — including the clicks on OTHER groups that let the
 * user switch which one is selected.
 */
export const GroupedEditModeDoesNotArmWithSelection: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    component.selectGroup('A')

    component.setEditMode(true)
    await expect(service.isDrawing()).toBe(false)

    // Proof arming did not suppress feature clicks: a click on a DIFFERENT
    // field still switches the selection to it.
    const data = service.googleMap.data
    const featureB = featureWithGroup(component, 'B')
    google.maps.event.trigger(data, 'click', { feature: featureB })
    await expect(isFeatureSelected(featureB)).toBe(true)
    await expect(service.isDrawing()).toBe(false)
  },
}

export const GroupedRetiredFieldStaysUneditable: Story = {
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

    // Field B opts out of editing AND wants its own muted colour while
    // selected. Both must hold: declaring styleOptionsSelected for colour
    // must not silently re-arm editing (compute-feature-style.ts resolves
    // the editable/draggable/clickable opt-outs per key, falling back to
    // styleOptions only for a key styleOptionsSelected doesn't itself
    // mention).
    component.selectGroup('B')
    const retired = featureWithGroup(component, 'B')
    const retiredStyle =
      component._googleMaps.googleMap.data.getStyle()(retired)
    await expect(retiredStyle.editable).toBe(false)
    // A locked field must not be draggable either — moving the whole polygon
    // changes the map's value exactly as much as reshaping it does, so a
    // "lock" that still lets it be dragged to a new location is not a lock.
    // editable: false implies draggable: false (compute-feature-style.ts).
    await expect(retiredStyle.draggable).toBe(false)
    await expect(retiredStyle.fillColor).toBe('dimgray')

    // Field C opts out of editing but declares no styleOptionsSelected, so
    // the documented visual merge chain (defaults -> styleOptions ->
    // selected defaults -> styleOptionsSelected) still applies the default
    // selection highlight colour on top of its plain styleOptions fill —
    // pinning that this precedence is unchanged by the opt-out fix above.
    component.selectGroup('C')
    const plain = featureWithGroup(component, 'C')
    const plainStyle = component._googleMaps.googleMap.data.getStyle()(plain)
    await expect(plainStyle.editable).toBe(false)
    await expect(plainStyle.draggable).toBe(false)
    await expect(plainStyle.fillColor).toBe('green')
  },
}

export const GroupedEscapeCascades: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    // Select A BEFORE entering edit mode: setEditMode(true) only auto-arms
    // drawing (F6) when nothing is selected, and this story is about the
    // selection/edit-mode/Escape cascade, not that arm — which
    // GroupedEditModeArmsDrawingWhenNothingSelected covers on its own.
    component.selectGroup('A')
    component.setEditMode(true)
    await expect(component._googleMaps.isDrawing()).toBe(false)

    const [featureA1] = featuresWithGroup(component, 'A')
    await expect(isFeatureSelected(featureA1)).toBe(true)

    // First Escape: nothing is drawing, so this clears the selection alone —
    // proven by the feature actually losing its selected state — and does not
    // yet leave edit mode.
    component._googleMaps.handleEscape()
    await expect(isFeatureSelected(featureA1)).toBe(false)
    await expect(component.isEditMode()).toBe(true)

    // Clearing the selection via Escape must NOT itself arm drawing (F6 only
    // arms from setEditMode(), and handleEscape()'s clear path never calls
    // it) — this state has to stay clickable so the user can select a
    // replacement, otherwise Escape traps them with nothing left to click.
    const data = component._googleMaps.googleMap.data
    await expect(component._googleMaps.isDrawing()).toBe(false)
    const featureB = featureWithGroup(component, 'B')
    google.maps.event.trigger(data, 'click', { feature: featureB })
    await expect(isFeatureSelected(featureB)).toBe(true)

    // Clear the selection again (via the API, standing in for a second
    // Escape's worth of state) to reach "edit mode on, nothing selected" for
    // the final cascade step.
    component._googleMaps.clearSelection()

    // Third Escape (second from this null-selection state): selection is
    // already clear, so this leaves edit mode.
    component._googleMaps.handleEscape()
    await expect(component.isEditMode()).toBe(false)
  },
}

/**
 * Probes F3's premise directly: `startDrawing()`/`stopDrawing()` are the only
 * two places `_drawingSubject` changes, so a round trip through them must
 * leave `isDrawing()` exactly where it started. This is the coverage whose
 * absence let a stuck drawing mode go unnoticed — this is the one story that
 * cycles the round trip on its own (with no draw in between) purely to pin
 * that invariant in isolation, distinct from the real-draw stories
 * (`GroupedDrawCreatesNewGroup` et al.) which exercise the same transition as
 * a side effect of an actual finished polygon.
 *
 * Investigation finding (see .superpowers/draw-release-report.md for detail):
 * `isDrawing()` reading Terra Draw's own `getMode()` was not, in fact, the
 * defect — `setMode('static')` always took effect and this round trip always
 * passed. `isDrawing()` now reads `_drawingSubject` instead (see its doc
 * comment in google-maps.service.ts) so that guarantee no longer depends on
 * Terra Draw's own mode agreeing, which is what actually goes wrong on a
 * later draw in the same session, via the upstream terra-draw/adapter
 * pointer-capture race already documented in `_initTerraDraw()`.
 */
export const GroupedDrawingStateReleasesAfterStop: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    // Select a group first so setEditMode(true) does not auto-arm drawing
    // (F6) — this story is about the startDrawing()/stopDrawing() round trip
    // itself, not the arm-on-entry behaviour.
    component.selectGroup('A')
    component.setEditMode(true)

    await expect(service.isDrawing()).toBe(false)

    service.startDrawing()
    await expect(service.isDrawing()).toBe(true)

    service.stopDrawing()
    await expect(service.isDrawing()).toBe(false)
  },
}

/**
 * Regression coverage for the terra-draw#710 recovery (see
 * .superpowers/terra-draw-710-spike.md,
 * .superpowers/terra-draw-recreate-report.md, and
 * .superpowers/escape-draw-cursor-report.md for the narrowing below).
 *
 * Two changes since the recreate was first added:
 *
 * 1. `stopDrawing()` only marks the instance for recreation when the session
 *    that just ended actually placed a coordinate (`_hasPlacedVertex()`,
 *    reading Terra Draw's own mode state) — an armed-but-empty session never
 *    touched the adapter's pointer capture terra-draw#710 is about, so it no
 *    longer pays for a recreate it doesn't need. See
 *    `GroupedEmptyArmDoesNotRecreateTerraDraw`, right below, for that half.
 * 2. The recreate for a session that DID place a vertex now runs EAGERLY,
 *    inside `stopDrawing()` itself, rather than being deferred to the next
 *    `startDrawing()` call. This story is about that half: each cycle places
 *    ONE real vertex — via `placeVertex()`'s synthetic
 *    `pointerdown`/`pointerup` pair on Terra Draw's own overlay element,
 *    which (unlike calling `startDrawing()`/`stopDrawing()` alone) actually
 *    exercises the adapter's real pointer-capture calls
 *    (`setPointerCapture`/`releasePointerCapture`) — then cancels via
 *    `stopDrawing()` directly, and asserts the underlying `TerraDraw`
 *    instance has ALREADY been swapped by the time that call returns, with
 *    no wait needed. That is the eager half: before this change, the swap
 *    only happened lazily, on the NEXT `startDrawing()`.
 *
 * A single full close (`drawSquare()`, placing 4 corners plus a closing
 * click) is included at the end to confirm the narrowed + eagerly-timed
 * recreate does not stop an actual finished draw from working.
 *
 * What this still cannot cover: several consecutive real, physical,
 * mouse-driven closes exercise the browser's pointer-capture semantics one
 * step further than repeated synthetic `PointerEvent` dispatches can promise
 * reliably from inside a `play` function — the very first attempt at
 * repeating `drawSquare()` across 4 cycles here turned out flaky under the
 * test runner even though it passed by hand against the live dev server,
 * which is why this story only closes once and cancels (a cheaper, fully
 * deterministic operation) for the other cycles. That "does #710 protection
 * survive several consecutive REAL draws" question was instead verified by
 * hand — 3 consecutive real `page.mouse.click()`-driven draws against the
 * live Storybook session, every one closing successfully, feature count
 * incrementing by exactly 1 each time — see
 * `.superpowers/escape-draw-cursor-report.md`.
 */
export const GroupedRepeatedDrawCyclesRecreateTerraDraw: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    // Select a group first so setEditMode(true) does not auto-arm drawing
    // (F6) — this story is about the recreate cycling itself, not the
    // arm-on-entry behaviour.
    component.selectGroup('A')
    component.setEditMode(true)

    const seenInstances = new Set<any>()
    const CYCLES = 4

    for (let i = 0; i < CYCLES; i++) {
      await waitUntil(() => service.isDrawing() === false)

      service.startDrawing()
      // Cycle 1 flips synchronously (no recreate pending yet); a later
      // cycle may still be mid recreate if the previous cycle's eager
      // rebuild hasn't reported `ready` yet — `startDrawing()` queues itself
      // via `_pendingStartDrawing` in that case, so this still resolves.
      await waitUntil(() => service.isDrawing() === true)

      const instanceBefore = service._terraDraw
      seenInstances.add(instanceBefore)

      // Place ONE real vertex, via a real pointer, so this cycle's
      // stopDrawing() sees _hasPlacedVertex() true.
      placeVertex(component, 300, 150)
      await waitUntil(() => service['_hasPlacedVertex']())

      service.stopDrawing()
      await expect(service.isDrawing()).toBe(false)
      // Eager: the instance must already differ right after stopDrawing()
      // returns -- no wait for a later startDrawing() needed.
      await expect(service._terraDraw).not.toBe(instanceBefore)
    }

    // Every cycle used a genuinely different instance — the eager recreate
    // really ran each time a real vertex was placed, not just once.
    await expect(seenInstances.size).toBe(CYCLES)

    // One full close, to confirm the narrowed + eagerly-timed recreate
    // still lets an actual finished draw work end to end.
    await waitUntil(() => service.isDrawing() === false)
    let before = 0
    service.googleMap.data.forEach(() => before++)
    service.startDrawing()
    await waitUntil(() => service.isDrawing() === true)
    await drawSquare(component, 100, 300)
    await waitUntil(() => service.isDrawing() === false)
    let after = 0
    service.googleMap.data.forEach(() => after++)
    await expect(after).toBe(before + 1)
  },
}

/**
 * The other half of the narrowed terra-draw#710 trigger (see the previous
 * story's doc comment): an armed session that places ZERO vertices before
 * being cancelled must NOT mark Terra Draw for recreation, because it never
 * touched the adapter's pointer capture in the first place. This is exactly
 * the shape `setEditMode(true)`'s F6 auto-arm produces every time it gets
 * cancelled before the user draws anything — e.g. by `Escape` — which is
 * what let the swallowed-click bug reach a real re-arm through
 * `startDrawing()`'s own `!_terraDrawReady` guard (see
 * `.superpowers/escape-draw-cursor-report.md`). Confirms the `TerraDraw`
 * instance is untouched and, cycling this twice, that `_terraDrawReady`
 * never goes false in between — i.e. no async gap is ever introduced by an
 * empty arm, so a re-arm right after one is always synchronous.
 */
export const GroupedEmptyArmDoesNotRecreateTerraDraw: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    // Nothing selected: GROUPED_VALUE's initial state has no selection, so
    // setEditMode(true) itself arms drawing (F6) — no vertex is ever placed
    // in this story, matching the "armed, then cancelled empty" shape.
    const instanceBefore = service._terraDraw

    for (let i = 0; i < 2; i++) {
      component.setEditMode(true)
      await expect(service.isDrawing()).toBe(true)
      await expect(service._terraDraw).toBe(instanceBefore)
      await expect(service['_terraDrawReady']).toBe(true)

      component.setEditMode(false)
      await expect(service.isDrawing()).toBe(false)
      // The instance and its readiness must be completely untouched — an
      // armed-but-empty session is not the kind terra-draw#710 protects
      // against, so it must not pay for (or need) a recreate.
      await expect(service._terraDraw).toBe(instanceBefore)
      await expect(service['_terraDrawReady']).toBe(true)
    }
  },
}

/**
 * Direct regression test for the reported bug (see
 * .superpowers/escape-draw-cursor-report.md): pressing `Escape` enough times
 * to cancel the auto-armed draw (F6) AND leave edit mode, then re-entering
 * edit mode via `setEditMode(true)` (standing in for the button) and drawing
 * immediately — zero delay, the worst case for a swallowed click — must
 * still make the new polygon the selection, with no vertex lost to a
 * recreate's async `ready` gap. Before the narrowed + eagerly-timed
 * recreate, the first Escape's cancel of the auto-armed (but empty) draw
 * marked Terra Draw for recreation, so THIS re-arm paid for a recreate it
 * didn't need and a real click landing before the new instance's `ready`
 * fired was silently dropped by `startDrawing()`'s own `!_terraDrawReady`
 * guard — which could leave the polygon never closing at all (stuck
 * `isDrawing()`, permanent crosshair) depending on exactly how many clicks
 * landed in the gap.
 */
export const GroupedEagerRecreateAvoidsSwallowedClick: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    // Nothing selected: setEditMode(true) auto-arms (F6), matching the
    // owner's reported starting point.
    component.setEditMode(true)
    await expect(service.isDrawing()).toBe(true)

    // Escape cascade: cancel the auto-armed (empty) draw, then leave edit
    // mode — exactly 2 presses, since nothing was ever selected.
    service.handleEscape()
    await expect(service.isDrawing()).toBe(false)
    await expect(component.isEditMode()).toBe(true)
    service.handleEscape()
    await expect(component.isEditMode()).toBe(false)

    // Re-enter edit mode (auto-arms again, nothing selected) and draw
    // IMMEDIATELY — no waitUntil, no delay — the worst case for a click
    // racing an async recreate gap.
    component.setEditMode(true)
    await drawSquare(component, 100, 300)

    await waitUntil(() => service.isDrawing() === false)
    const selection = service['_selectionSubject'].value
    await expect(selection).not.toBeNull()
    const newFeature = featureWithGroup(component, selection.group.key)
    await expect(newFeature).not.toBeUndefined()
    const style = service.googleMap.data.getStyle()(newFeature)
    await expect(style.editable).toBe(true)
  },
}

export const LegacyClickStillArmsEditing: Story = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const feature = featureWithGroup(component, 'A')

    google.maps.event.trigger(component._googleMaps.googleMap.data, 'click', {
      feature,
    })

    const style = component._googleMaps.googleMap.data.getStyle()(feature)
    // Regression guard for the two apps that are not being updated: in legacy
    // mode a click alone still arms handles.
    await expect(style.editable).toBe(true)
    await expect(isFeatureSelected(feature)).toBe(true)
  },
}

/**
 * Automated stand-in for part of Task 13's manual legacy-path check: with no
 * `interactionMode` set, the mounted draw control still reads "Draw Field"
 * (not the grouped-mode "Edit Fields" label) and a click toggles drawing
 * directly, with no intervening edit-mode concept.
 */
export const LegacyDrawButtonTogglesDrawing: Story = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const button = canvasElement.querySelector(
      '[title="Draw Field"]',
    ) as HTMLButtonElement
    await expect(button).not.toBeNull()

    await expect(component._googleMaps.isDrawing()).toBe(false)
    button.click()
    await expect(component._googleMaps.isDrawing()).toBe(true)
    button.click()
    await expect(component._googleMaps.isDrawing()).toBe(false)
  },
}

/**
 * Automated stand-in for part of Task 13's manual legacy-path check:
 * right-clicking a selected polygon opens a menu with exactly one item,
 * "Delete" (not the grouped-mode "Delete Polygon" / "Delete Field" pair).
 */
export const LegacyContextMenuOnSelectedShowsSingleDelete: Story = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const feature = featureWithGroup(component, 'A')
    const data = component._googleMaps.googleMap.data

    google.maps.event.trigger(data, 'click', { feature })
    await expect(isFeatureSelected(feature)).toBe(true)

    google.maps.event.trigger(data, 'contextmenu', { feature })
    // Let the menu's embedded view render and detect changes.
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items).toHaveLength(1)
    await expect(items[0].textContent?.trim()).toBe('Delete')
  },
}

/**
 * Automated stand-in for part of Task 13's manual legacy-path check:
 * right-clicking an unselected polygon opens no menu at all.
 */
export const LegacyContextMenuOnUnselectedDoesNothing: Story = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const feature = featureWithGroup(component, 'A')
    const data = component._googleMaps.googleMap.data

    await expect(isFeatureSelected(feature)).toBe(false)

    google.maps.event.trigger(data, 'contextmenu', { feature })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items).toHaveLength(0)
  },
}

export const GroupedDrawCreatesNewGroup: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        (selectionChange)="selectionChange($event)"
        style="height: 400px"></seam-google-maps>
    `,
    props: args,
  }),
  args: {
    value: GROUPED_VALUE,
    selectionChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    component.setEditMode(true)
    // Nothing selected — GROUPED_VALUE's initial state has no selection, so
    // setEditMode(true) itself arms drawing (F6) and this real draw runs
    // directly against that armed session, via placeVertex()'s synthetic
    // pointerdown/pointerup pairs on Terra Draw's own overlay element (see
    // drawSquare(), above) — the same real `finish` event a mouse-driven
    // draw fires, landing on `_onDrawFinished()` for real.
    await expect(service.isDrawing()).toBe(true)

    const groupsBefore = component.getGroups().length
    await drawSquare(component, 300, 150)
    await waitUntil(() => service.isDrawing() === false)

    await expect(component.getGroups().length).toBe(groupsBefore + 1)

    const lastSelection = (args.selectionChange as any).mock.calls.at(-1)?.[0]
    await expect(lastSelection).toBeTruthy()
    await expect(lastSelection.group.features).toHaveLength(1)
    const newKey = lastSelection.group.key
    await expect(typeof newKey).toBe('string')
    await expect(newKey.length).toBeGreaterThan(0)

    // The generated key must be a real GeoJSON property, not just the
    // internal __app__ fallback — required so the grouping survives
    // getGeoJson()'s round trip instead of being destroyed at the exact
    // boundary meant to carry it.
    const geoJson = await component.getGeoJson()
    const written = (geoJson as any).features.find(
      (f: any) => f.properties.fieldId === newKey,
    )
    await expect(written).toBeTruthy()
  },
}

export const GroupedDrawJoinsSelectedGroup: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        (selectionChange)="selectionChange($event)"
        style="height: 400px"></seam-google-maps>
    `,
    props: args,
  }),
  args: {
    value: GROUPED_VALUE,
    selectionChange: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const component = await mapComponent(canvasElement)
    const service = component._googleMaps
    // Select the group BEFORE entering edit mode, so setEditMode(true) does
    // NOT auto-arm drawing (F6 only arms when nothing is selected — see
    // GroupedEditModeDoesNotArmWithSelection) — this story needs an explicit
    // startDrawing() so the real draw below joins a stable, already-selected
    // group rather than racing the auto-arm's own selection state.
    component.selectGroup('A')
    component.setEditMode(true)
    await expect(service.isDrawing()).toBe(false)

    service.startDrawing()
    await waitUntil(() => service.isDrawing() === true)
    await step('Draw square', async () => {
      await drawSquare(component, 300, 150)
    })
    await waitUntil(() => service.isDrawing() === false)

    // Field A had two polygons; the new one joins it as a third rather than
    // starting a group of its own.
    await expect(featuresWithGroup(component, 'A')).toHaveLength(3)

    const lastSelection = (args.selectionChange as any).mock.calls.at(-1)?.[0]
    await expect(lastSelection.group.key).toBe('A')
    await expect(lastSelection.group.features).toHaveLength(3)

    // The join is a written property, not just the in-memory selection —
    // confirms _registry.assignKey wrote fieldId = 'A' onto the new feature.
    const geoJson = await component.getGeoJson()
    const aFeatures = (geoJson as any).features.filter(
      (f: any) => f.properties.fieldId === 'A',
    )
    await expect(aFeatures).toHaveLength(3)
  },
}

export const GroupedDeleteRemovesOnlyFocusedPolygon: Story = {
  render: (args) => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        (selectionChange)="selectionChange($event)"
        style="height: 400px"></seam-google-maps>
    `,
    props: args,
  }),
  args: {
    value: GROUPED_VALUE,
    selectionChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const component = await mapComponent(canvasElement)
    const data = component._googleMaps.googleMap.data
    const [featureA1, featureA2] = featuresWithGroup(component, 'A')

    // Selecting A focuses featureA1 specifically (the feature the click
    // landed on), while group-wide selection styles both of A's polygons.
    google.maps.event.trigger(data, 'click', { feature: featureA1 })
    await expect(isFeatureSelected(featureA1)).toBe(true)
    await expect(isFeatureSelected(featureA2)).toBe(true)

    // The real 'Delete' key path (not deleteFocusedFeature() called
    // directly), so this also exercises the component's keydown handler.
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Delete' }))

    // Only the focused polygon is gone — its groupmate survives. Matches the
    // design's granularity: a polygon added to the wrong field must have a
    // way out that doesn't cost the rest of the field.
    const remaining = featuresWithGroup(component, 'A')
    await expect(remaining).toHaveLength(1)
    await expect(remaining[0]).toBe(featureA2)

    // Selection must track what remains, not what was deleted — the guard
    // for F2 (deleteSelection leaving selection$/_focusedFeature stale) and
    // F3 (Delete Field acting on the wrong group): if either regressed here,
    // this would either still report 2 features, or clear to null instead of
    // staying on A's one remaining polygon.
    const lastSelection = (args.selectionChange as any).mock.calls.at(-1)?.[0]
    await expect(lastSelection).toBeTruthy()
    await expect(lastSelection.group.key).toBe('A')
    await expect(lastSelection.group.features).toHaveLength(1)
  },
}

/**
 * Regression guard for F2: every item this menu offers (Delete Polygon,
 * Delete Field) is a destructive edit, so it must not be reachable outside
 * edit mode — even for a feature that IS selected, via the ordinary
 * click-to-select flow with edit mode never having been turned on.
 */
export const GroupedContextMenuClosedOutsideEditMode: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const data = component._googleMaps.googleMap.data

    // Select field A the ordinary way — a click, with edit mode never turned
    // on.
    const [featureA1] = featuresWithGroup(component, 'A')
    google.maps.event.trigger(data, 'click', { feature: featureA1 })
    await expect(isFeatureSelected(featureA1)).toBe(true)

    google.maps.event.trigger(data, 'contextmenu', { feature: featureA1 })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items).toHaveLength(0)
  },
}

/**
 * Keyboard twin of `GroupedContextMenuClosedOutsideEditMode`: `openContextMenu()`
 * (the `ContextMenu` keydown path) sources its feature from
 * `getSelectedFeature()` and used to open unconditionally on it, bypassing
 * `_model.allowsContextMenu()` entirely — so a selected-but-not-editing group
 * could still reach the destructive menu via the keyboard even after F2 gated
 * the mouse `contextmenu` listener on edit mode. `openContextMenu()` now
 * consults the same predicate before opening.
 */
export const GroupedContextMenuKeyClosedOutsideEditMode: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const data = component._googleMaps.googleMap.data

    // Select field A the ordinary way — a click, with edit mode never turned
    // on.
    const [featureA1] = featuresWithGroup(component, 'A')
    google.maps.event.trigger(data, 'click', { feature: featureA1 })
    await expect(isFeatureSelected(featureA1)).toBe(true)

    // The real keyboard path, not `_googleMaps.openContextMenu()` called
    // directly — this also exercises the component's keydown handler.
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ContextMenu' }))
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items).toHaveLength(0)
  },
}

/**
 * Regression guard for the invariant `GroupedContextMenuKeyTargetsCurrentSelection`
 * used to guard: the menu's items must act on the feature/group the menu
 * actually opened for, not on whatever a PRIOR interaction happened to focus
 * or select. Within one group: right-clicking a different polygon than the
 * one a plain click last focused must retarget the menu to it, and an
 * unrelated bystander group must stay untouched throughout.
 * `GroupedContextMenuNeverOpensOutsideSelectedGroup`, further below, is the
 * sibling guard for the cross-GROUP case — now that the menu requires the
 * right-clicked feature's group to already be the selection, that guard
 * pins "never opens outside it" rather than "acts on the right group".
 */
export const GroupedContextMenuActsOnRightClickedPolygon: Story = {
  render: () => ({
    template: `
      <seam-google-maps
        interactionMode="grouped"
        featureGroupProperty="fieldId"
        [value]="value"
        style="height: 400px"></seam-google-maps>
    `,
    props: { value: TWO_FIELDS_VALUE },
  }),
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const data = component._googleMaps.googleMap.data

    // Click field X's first polygon BEFORE entering edit mode: it becomes
    // selected AND focused. (Selection works identically with edit mode on
    // or off, so this ordering is just convenience, not a requirement.)
    const [featureX1, featureX2] = featuresWithGroup(component, 'X')
    google.maps.event.trigger(data, 'click', { feature: featureX1 })
    await expect(isFeatureSelected(featureX1)).toBe(true)

    component.setEditMode(true)

    // Right-click the OTHER polygon in the same group X, not group Y.
    google.maps.event.trigger(data, 'contextmenu', { feature: featureX2 })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = Array.from(
      canvasElement.querySelectorAll('[role="menuitem"]'),
    ) as HTMLElement[]
    const deletePolygon = items.find(
      (item) => item.textContent?.trim() === 'Delete Polygon',
    )
    await expect(deletePolygon).toBeTruthy()
    deletePolygon!.click()

    // X2 — what the menu actually opened for — is gone. X1 — merely focused
    // by the earlier click — survives, and bystander field Y is untouched.
    const remainingX = featuresWithGroup(component, 'X')
    await expect(remainingX).toHaveLength(1)
    await expect(remainingX[0]).toBe(featureX1)
    await expect(featuresWithGroup(component, 'Y')).toHaveLength(2)
  },
}

/**
 * Pins the invariant that survives however the click rules evolve: the
 * grouped context menu never opens for a feature outside the currently
 * selected group. Every item it offers (Delete Polygon, Delete Field) is a
 * destructive edit, so a right-click on a field the user has not selected
 * must not reach it — matching legacy's own `isFeatureSelected(feature)` gate.
 *
 * This scenario has flipped three times as the design settled: written when
 * a right-click could act on a non-selected group ("Delete Field" acting on
 * the right-clicked group via `contextMenuTarget$` / `deleteGroup(key)`),
 * made unreachable when edit mode gated clicks on selection, restored when
 * clicks became ungated between draws, and unreachable once more now that
 * `allowsContextMenu()` itself requires the right-clicked feature's group to
 * already be the selection. Asserting the invariant directly — rather than
 * one reachability path through it — is what stops this from needing a
 * fourth flip.
 */
export const GroupedContextMenuNeverOpensOutsideSelectedGroup: Story = {
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
  play: async ({ canvasElement }) => {
    const component = await mapComponent(canvasElement)
    const data = component._googleMaps.googleMap.data

    // Select field B, then enter edit mode.
    component.selectGroup('B')
    component.setEditMode(true)

    // Right-clicking a polygon of a DIFFERENT group (A) must open nothing.
    const [featureA1] = featuresWithGroup(component, 'A')
    google.maps.event.trigger(data, 'contextmenu', { feature: featureA1 })
    await new Promise((resolve) => setTimeout(resolve, 250))

    await expect(
      canvasElement.querySelectorAll('[role="menuitem"]'),
    ).toHaveLength(0)

    // Right-clicking a polygon of the SELECTED group (B) opens it.
    const [featureB1] = featuresWithGroup(component, 'B')
    google.maps.event.trigger(data, 'contextmenu', { feature: featureB1 })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    await expect(items.length).toBeGreaterThan(0)
  },
}

/**
 * Smoke-tests the consumer-supplied `seam-map-control` / `MAP_CONTROLS_SERVICE`
 * path: `modal-attributes-map` in TheSeam.DataCommons.App is its only other
 * exercise, and the Cotton modal will depend on it. Not part of the
 * grouped-interaction feature itself — this exists to catch Angular-version
 * drift on a ~2022-era path before the Cotton modal starts relying on it.
 */
export const ConsumerSuppliedControl: Story = {
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
  play: async ({ canvasElement }) => {
    await mapComponent(canvasElement)
    // The control mounts through addControl() against the Maps JS API, not
    // through the DOM — google-maps.component.html has no <ng-content> slot,
    // deliberately. So look for it in the map's rendered control container.
    const button = canvasElement.querySelector('[title="Smoke Test"]')
    await expect(button).not.toBeNull()
  },
}
