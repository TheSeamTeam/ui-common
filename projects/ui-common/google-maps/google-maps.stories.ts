import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { provideAnimations } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

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
    const component = (window as any).ng.getComponent(host)
    const geoJson = await component.getGeoJson()
    const types = geoJson.features.map((f: any) => f.geometry.type).sort()
    expect(types).toEqual(['MultiPolygon', 'Polygon'])
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
    expect(args.selectionChange).not.toHaveBeenCalled()

    google.maps.event.trigger(component._googleMaps.googleMap.data, 'click', {
      feature: featureA1,
    })

    // Exactly one emission, and it is the click's. This is the actual proof a
    // click selected something: it fails if the trigger is removed, or if
    // GroupedInteractionModel.onFeatureClick is gutted to a no-op — unlike
    // getGroups(), which reflects grouping alone and is blind to selection.
    expect(args.selectionChange).toHaveBeenCalledTimes(1)

    // `plot` distinguishes field A's two polygons, so this also pins that the
    // focused feature is the one clicked and that the group holds two
    // DIFFERENT features rather than the same one twice.
    //
    // The array literal pins the order as well as the length. Order comes from
    // `data.forEach` iteration, which Google does not document as stable
    // though it is insertion order in practice — if this ever flakes, that is
    // the reason.
    expect(args.selectionChange).toHaveBeenLastCalledWith(
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
    expect(isFeatureSelected(featureA1)).toBe(true)
    expect(isFeatureSelected(featureA2)).toBe(true)
    expect(isFeatureSelected(featureB)).toBe(false)
  },
}

export const GroupedEditModeIgnoresFeatureClicks: Story = {
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
    component.setEditMode(true)

    const feature = featureWithGroup(component, 'A')
    const style = component._googleMaps.googleMap.data.getStyle()(feature)

    // With edit mode armed and nothing selected, polygons must ignore clicks
    // so a click can only ever mean "start drawing".
    expect(style.clickable).toBe(false)
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
    expect(retiredStyle.editable).toBe(false)
    expect(retiredStyle.fillColor).toBe('dimgray')

    // Field C opts out of editing but declares no styleOptionsSelected, so
    // the documented visual merge chain (defaults -> styleOptions ->
    // selected defaults -> styleOptionsSelected) still applies the default
    // selection highlight colour on top of its plain styleOptions fill —
    // pinning that this precedence is unchanged by the opt-out fix above.
    component.selectGroup('C')
    const plain = featureWithGroup(component, 'C')
    const plainStyle = component._googleMaps.googleMap.data.getStyle()(plain)
    expect(plainStyle.editable).toBe(false)
    expect(plainStyle.fillColor).toBe('green')
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
    component.setEditMode(true)
    component.selectGroup('A')

    const [featureA1] = featuresWithGroup(component, 'A')
    expect(isFeatureSelected(featureA1)).toBe(true)

    // First Escape: nothing is drawing, so this clears the selection alone —
    // proven by the feature actually losing its selected state — and does not
    // yet leave edit mode.
    component._googleMaps.handleEscape()
    expect(isFeatureSelected(featureA1)).toBe(false)
    expect(component.isEditMode()).toBe(true)

    // Second Escape: selection is already clear, so this leaves edit mode.
    component._googleMaps.handleEscape()
    expect(component.isEditMode()).toBe(false)
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
    expect(style.editable).toBe(true)
    expect(isFeatureSelected(feature)).toBe(true)
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
    expect(button).not.toBeNull()

    expect(component._googleMaps.isDrawing()).toBe(false)
    button.click()
    expect(component._googleMaps.isDrawing()).toBe(true)
    button.click()
    expect(component._googleMaps.isDrawing()).toBe(false)
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
    expect(isFeatureSelected(feature)).toBe(true)

    google.maps.event.trigger(data, 'contextmenu', { feature })
    // Let the menu's embedded view render and detect changes.
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    expect(items).toHaveLength(1)
    expect(items[0].textContent?.trim()).toBe('Delete')
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

    expect(isFeatureSelected(feature)).toBe(false)

    google.maps.event.trigger(data, 'contextmenu', { feature })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    expect(items).toHaveLength(0)
  },
}

/**
 * Drives `GoogleMapsService._onDrawFinished()` directly rather than a real
 * Terra Draw session. Data-layer polygons render into a canvas overlay with
 * no per-feature DOM element, so `GroupedClickSelectsWholeField` et al.
 * already trigger `google.maps.event.trigger(map.data, ...)` instead of
 * clicking anything — but Terra Draw itself has no equivalent map-level
 * event to trigger: its Google Maps adapter binds real pointer listeners to
 * the map's rendered DOM subtree, so finishing an actual polyline draw from a
 * `play` function would mean simulating a precise sequence of pixel-space
 * pointer events against a real map projection, AND getting the result past
 * Terra Draw's own per-mode store validation (`addFeatures` validates
 * against whichever mode is registered, and the polyline mode's validator
 * expects in-progress LineString geometry, not a finished Polygon). Neither
 * is what these stories are for: F5 is about proving `_onDrawFinished`
 * translates a `MapDrawOutcome` into the right map value, given a finished
 * geometry — not about Terra Draw's own drawing UX, which is unit-tested
 * elsewhere via the interaction models and has no coverage gap of its own.
 * So this stubs the two `TerraDraw` calls `_onDrawFinished` makes
 * (`getSnapshotFeature`, `removeFeatures`) to hand it a real, finished
 * Polygon directly, then calls the private method itself — the actual
 * outcome-translation path, exercised for real.
 */
function finishDrawWithPolygon(component: any, polygon: any): void {
  const service = component._googleMaps
  const id = 'story-finished-draw'
  service._terraDraw.getSnapshotFeature = () => ({
    type: 'Feature',
    geometry: polygon,
    properties: {},
  })
  service._terraDraw.removeFeatures = () => undefined
  service._onDrawFinished(id)
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
    component.setEditMode(true)
    // Nothing selected — GROUPED_VALUE's initial state has no selection.

    const groupsBefore = component.getGroups().length
    // Away from every existing square, so containment/hole logic (skipped
    // entirely here since nothing is selected, but kept clean regardless)
    // never enters into it.
    finishDrawWithPolygon(component, squareAt(-98.5, 37.63))

    expect(component.getGroups().length).toBe(groupsBefore + 1)

    const lastSelection = (args.selectionChange as any).mock.calls.at(-1)?.[0]
    expect(lastSelection).toBeTruthy()
    expect(lastSelection.group.features).toHaveLength(1)
    const newKey = lastSelection.group.key
    expect(typeof newKey).toBe('string')
    expect(newKey.length).toBeGreaterThan(0)

    // The generated key must be a real GeoJSON property, not just the
    // internal __app__ fallback — required so the grouping survives
    // getGeoJson()'s round trip instead of being destroyed at the exact
    // boundary meant to carry it.
    const geoJson = await component.getGeoJson()
    const written = (geoJson as any).features.find(
      (f: any) => f.properties.fieldId === newKey,
    )
    expect(written).toBeTruthy()
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
  play: async ({ canvasElement, args }) => {
    const component = await mapComponent(canvasElement)
    component.setEditMode(true)
    component.selectGroup('A')

    finishDrawWithPolygon(component, squareAt(-98.52, 37.63))

    // Field A had two polygons; the new one joins it as a third rather than
    // starting a group of its own.
    expect(featuresWithGroup(component, 'A')).toHaveLength(3)

    const lastSelection = (args.selectionChange as any).mock.calls.at(-1)?.[0]
    expect(lastSelection.group.key).toBe('A')
    expect(lastSelection.group.features).toHaveLength(3)

    // The join is a written property, not just the in-memory selection —
    // confirms _registry.assignKey wrote fieldId = 'A' onto the new feature.
    const geoJson = await component.getGeoJson()
    const aFeatures = (geoJson as any).features.filter(
      (f: any) => f.properties.fieldId === 'A',
    )
    expect(aFeatures).toHaveLength(3)
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
    expect(isFeatureSelected(featureA1)).toBe(true)
    expect(isFeatureSelected(featureA2)).toBe(true)

    // The real 'Delete' key path (not deleteFocusedFeature() called
    // directly), so this also exercises the component's keydown handler.
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Delete' }))

    // Only the focused polygon is gone — its groupmate survives. Matches the
    // design's granularity: a polygon added to the wrong field must have a
    // way out that doesn't cost the rest of the field.
    const remaining = featuresWithGroup(component, 'A')
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(featureA2)

    // Selection must track what remains, not what was deleted — the guard
    // for F2 (deleteSelection leaving selection$/_focusedFeature stale) and
    // F3 (Delete Field acting on the wrong group): if either regressed here,
    // this would either still report 2 features, or clear to null instead of
    // staying on A's one remaining polygon.
    const lastSelection = (args.selectionChange as any).mock.calls.at(-1)?.[0]
    expect(lastSelection).toBeTruthy()
    expect(lastSelection.group.key).toBe('A')
    expect(lastSelection.group.features).toHaveLength(1)
  },
}

/**
 * Regression guard for F2: every item this menu offers (Delete Polygon,
 * Delete Field) is a destructive edit, so it must not be reachable outside
 * edit mode — even for a feature that IS selected. Right-clicking normally
 * can't even reach an unselected feature in edit mode (`clickable: false`),
 * so a selected-but-not-editing feature is the meaningful case left to guard:
 * the ordinary click-to-select flow with edit mode never having been turned
 * on. Replaces `GroupedDeleteFieldActsOnRightClickedGroup`, whose scenario (a
 * DIFFERENT group selected than the one right-clicked) is no longer
 * reachable — in edit mode a non-selected group can't receive a right-click
 * at all, and outside edit mode the menu doesn't open regardless of what's
 * selected.
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
    expect(isFeatureSelected(featureA1)).toBe(true)

    google.maps.event.trigger(data, 'contextmenu', { feature: featureA1 })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    expect(items).toHaveLength(0)
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
    expect(isFeatureSelected(featureA1)).toBe(true)

    // The real keyboard path, not `_googleMaps.openContextMenu()` called
    // directly — this also exercises the component's keydown handler.
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ContextMenu' }))
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = canvasElement.querySelectorAll('[role="menuitem"]')
    expect(items).toHaveLength(0)
  },
}

/**
 * Regression guard for what remains reachable of the invariant
 * `GroupedContextMenuKeyTargetsCurrentSelection` used to guard: the menu's
 * items must act on the feature/group the menu actually opened for, not on
 * whatever a PRIOR interaction happened to focus or select. That story's own
 * scenario (a stale target from an earlier right-click surviving a
 * keyboard-opened menu for a newly-selected DIFFERENT group) is no longer
 * reachable, because F2 means edit mode must be on for any of this to open,
 * and in edit mode a non-selected group is `clickable: false` — so the menu
 * can now only ever open on the selected group. What's left to guard: WITHIN
 * that one reachable group, right-clicking a different polygon than the one
 * a plain click last focused must retarget the menu to it, and an unrelated
 * bystander group must stay untouched throughout.
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
    // selected AND focused. (With edit mode already on and nothing selected,
    // a click on any polygon is ignored by design — the "off" row of the
    // interaction table — so selection has to happen first.)
    const [featureX1, featureX2] = featuresWithGroup(component, 'X')
    google.maps.event.trigger(data, 'click', { feature: featureX1 })
    expect(isFeatureSelected(featureX1)).toBe(true)

    component.setEditMode(true)

    // Right-click the OTHER polygon in the same group — the only group that
    // can receive a right-click at all while edit mode is on.
    google.maps.event.trigger(data, 'contextmenu', { feature: featureX2 })
    await new Promise((resolve) => setTimeout(resolve, 250))

    const items = Array.from(
      canvasElement.querySelectorAll('[role="menuitem"]'),
    ) as HTMLElement[]
    const deletePolygon = items.find(
      (item) => item.textContent?.trim() === 'Delete Polygon',
    )
    expect(deletePolygon).toBeTruthy()
    deletePolygon!.click()

    // X2 — what the menu actually opened for — is gone. X1 — merely focused
    // by the earlier click — survives, and bystander field Y is untouched.
    const remainingX = featuresWithGroup(component, 'X')
    expect(remainingX).toHaveLength(1)
    expect(remainingX[0]).toBe(featureX1)
    expect(featuresWithGroup(component, 'Y')).toHaveLength(2)
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
    expect(button).not.toBeNull()
  },
}
