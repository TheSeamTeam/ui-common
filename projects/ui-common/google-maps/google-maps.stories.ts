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
    // computeFeatureStyle's selected-defaults pass (FEATURE_STYLE_OPTIONS_SELECTED)
    // runs after properties.styleOptions and always sets fillColor to the
    // selection highlight color; only a feature's own styleOptionsSelected can
    // override it (see compute-feature-style.ts and its spec's "applies
    // styleOptionsSelected, not styleOptionsHovered" case). This fixture only
    // declares styleOptions, so the highlight color wins while selected.
    expect(style.fillColor).toBe('green')
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
  },
}
