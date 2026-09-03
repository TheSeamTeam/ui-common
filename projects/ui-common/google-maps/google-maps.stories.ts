import { applicationConfig, moduleMetadata } from '@storybook/angular'
import { expect } from 'storybook/test'

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

export default {
  title: 'GoogleMaps/Components',
  // component: TheSeamGoogleMapsComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [CommonModule, TheSeamGoogleMapsModule],
      providers: [
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
  ],
}

export const Basic = ({ ...args }) => ({
  template: `<seam-google-maps seamHoverClass="border border-warning"></seam-google-maps>`,
})

export const Control = ({ ...args }) => ({
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
    control: new FormControl(),
  },
})

export const Places = ({ ...args }) => ({
  template: `<input seamGoogleMapsPlacesAutocomplete />`,
  props: {},
})

export const PlacesComponent = ({ ...args }) => ({
  template: `<seam-google-maps-places-autocomplete></seam-google-maps-places-autocomplete>`,
  props: {},
})

export const PlacesMapBind = ({ ...args }) => ({
  template: `
    <seam-google-maps-places-autocomplete></seam-google-maps-places-autocomplete>
    <seam-google-maps></seam-google-maps>
  `,
  props: {},
})

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

// Captured by `GroupedClickSelectsWholeField`'s `onSelection` prop handler,
// bound in its template via `(selectionChange)="onSelection($event)"`. A
// module-scoped array (reset at the top of `render()`) lets `play` read what
// the template binding emitted without depending on Storybook's Angular
// renderer exposing the mounted component's `props` object back to the play
// function — it doesn't, so this closure is the reliable way to observe it.
let groupClickSelections: any[] = []

export const GroupedClickSelectsWholeField = {
  render: () => {
    groupClickSelections = []
    return {
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
        onSelection(event: any) {
          groupClickSelections.push(event)
        },
      },
    }
  },
  play: async ({ canvasElement }: any) => {
    const component = await mapComponent(canvasElement)
    const [featureA1, featureA2] = featuresWithGroup(component, 'A')
    const featureB = featureWithGroup(component, 'B')

    google.maps.event.trigger(component._googleMaps.googleMap.data, 'click', {
      feature: featureA1,
    })

    // The emitted event is the actual proof a click selected something: this
    // assertion would fail if the trigger were removed, or if
    // GroupedInteractionModel.onFeatureClick were gutted to a no-op — unlike
    // getGroups(), which reflects grouping alone and is unaffected by
    // selection state.
    const lastSelection = groupClickSelections[groupClickSelections.length - 1]
    expect(lastSelection).toBeTruthy()
    expect(lastSelection.group.key).toBe('A')
    // Field A has two polygons; clicking one selects both.
    expect(lastSelection.group.features).toHaveLength(2)
    expect(lastSelection.feature).toBeTruthy()

    // Cross-check against the data layer itself: group-wide selection, not
    // per-feature selection, and field B is untouched.
    expect(isFeatureSelected(featureA1)).toBe(true)
    expect(isFeatureSelected(featureA2)).toBe(true)
    expect(isFeatureSelected(featureB)).toBe(false)
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
    props: { value: RETIRED_FIELD_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
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
    expect(isFeatureSelected(feature)).toBe(true)
  },
}

/**
 * Automated stand-in for part of Task 13's manual legacy-path check: with no
 * `interactionMode` set, the mounted draw control still reads "Draw Field"
 * (not the grouped-mode "Edit Fields" label) and a click toggles drawing
 * directly, with no intervening edit-mode concept.
 */
export const LegacyDrawButtonTogglesDrawing = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
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
export const LegacyContextMenuOnSelectedShowsSingleDelete = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
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
export const LegacyContextMenuOnUnselectedDoesNothing = {
  render: () => ({
    template: `<seam-google-maps [value]="value" style="height: 400px"></seam-google-maps>`,
    props: { value: GROUPED_VALUE },
  }),
  play: async ({ canvasElement }: any) => {
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
 * Smoke-tests the consumer-supplied `seam-map-control` / `MAP_CONTROLS_SERVICE`
 * path: `modal-attributes-map` in TheSeam.DataCommons.App is its only other
 * exercise, and the Cotton modal will depend on it. Not part of the
 * grouped-interaction feature itself — this exists to catch Angular-version
 * drift on a ~2022-era path before the Cotton modal starts relying on it.
 */
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
