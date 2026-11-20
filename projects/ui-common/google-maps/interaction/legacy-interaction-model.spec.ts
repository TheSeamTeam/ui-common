import { MultiPolygon, Polygon } from 'geojson'

import {
  dataMultiPolygonFromGeoJson,
  isFeatureSelected,
  setFeatureSelected,
} from '../google-maps-feature-helpers'
import { createFakeInteractionContext } from '../testing/fake-interaction-context'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import { LegacyInteractionModel } from './legacy-interaction-model'

const drawn: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
      [1, 1],
    ],
  ],
}

describe('LegacyInteractionModel', () => {
  let model: LegacyInteractionModel

  beforeEach(() => {
    installFakeGoogleMaps()
    model = new LegacyInteractionModel()
  })
  afterEach(() => uninstallFakeGoogleMaps())

  it('selects the clicked feature', () => {
    const ctx = createFakeInteractionContext()
    const feature = ctx.addFeatureWithPolygon(drawn)
    model.onFeatureClick(feature, ctx)
    expect(ctx.selectGroup).toHaveBeenCalledWith(
      ctx.groups.keyOf(feature),
      feature,
    )
  })

  it('clears selection on a map click', () => {
    const ctx = createFakeInteractionContext()
    model.onMapClick(ctx)
    expect(ctx.selectGroup).toHaveBeenCalledWith(null, null)
  })

  it('always arms geometry editing and always allows clicks', () => {
    const ctx = createFakeInteractionContext()
    const feature = ctx.addFeatureWithPolygon(drawn)
    expect(model.featureFlags(feature, ctx)).toEqual({
      geometryEditingArmed: true,
      clicksAllowed: true,
    })
  })

  it('ignores editMode and isDrawing entirely for featureFlags', () => {
    // Legacy has no edit-mode/drawing-armed distinction (F3 is grouped-only):
    // `editMode` is always false in practice for this model, but confirm
    // featureFlags does not react to it or to isDrawing regardless.
    const ctx = createFakeInteractionContext({
      editMode: true,
      isDrawing: true,
    })
    const feature = ctx.addFeatureWithPolygon(drawn)
    expect(model.featureFlags(feature, ctx)).toEqual({
      geometryEditingArmed: true,
      clicksAllowed: true,
    })
  })

  it('creates a new ungrouped feature when a draw finishes', () => {
    const ctx = createFakeInteractionContext()
    expect(model.onDrawFinished(drawn, ctx)).toEqual({
      kind: 'newFeature',
      groupKey: null,
    })
  })

  it('cuts a hole when holes are allowed and a container exists', () => {
    const ctx = createFakeInteractionContext({ allowHoles: true })
    const container = ctx.addFeatureWithPolygon({
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
    })
    expect(model.onDrawFinished(drawn, ctx)).toEqual({
      kind: 'hole',
      target: container,
    })
  })

  it('does not cut a hole in a MultiPolygon container, even with holes allowed', () => {
    // Legacy parity: the pre-strategy service found the exterior feature with
    // geoJsonPolygonFromDataFeature, which returns undefined for MultiPolygon,
    // so a MultiPolygon never matched. Grouped mode's shared search is now
    // MultiPolygon-aware, but legacy mode must keep never matching one.
    const ctx = createFakeInteractionContext({ allowHoles: true })
    const container: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [0, 10],
            [10, 10],
            [10, 0],
            [0, 0],
          ],
        ],
      ],
    }
    ctx.data.add(
      new google.maps.Data.Feature({
        geometry: dataMultiPolygonFromGeoJson(container),
      }),
    )
    expect(model.onDrawFinished(drawn, ctx).kind).toBe('newFeature')
  })

  it('cuts a hole in a Polygon container added after a MultiPolygon that also contains the drawing', () => {
    // The old code (geoJsonPolygonFromDataFeature returning undefined for a
    // MultiPolygon) SKIPPED such a candidate and kept looking, rather than
    // giving up on the whole search. A fix that filtered the result after the
    // search, instead of during it, would stop at the first containing
    // feature regardless of type and turn this into a stray overlapping
    // feature instead of a hole in the Polygon.
    const ctx = createFakeInteractionContext({ allowHoles: true })
    const multiPolygonContainer: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [0, 10],
            [10, 10],
            [10, 0],
            [0, 0],
          ],
        ],
      ],
    }
    ctx.data.add(
      new google.maps.Data.Feature({
        geometry: dataMultiPolygonFromGeoJson(multiPolygonContainer),
      }),
    )
    const polygonContainer = ctx.addFeatureWithPolygon({
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
    })
    expect(model.onDrawFinished(drawn, ctx)).toEqual({
      kind: 'hole',
      target: polygonContainer,
    })
  })

  it('does not cut a hole when holes are not allowed', () => {
    const ctx = createFakeInteractionContext({ allowHoles: false })
    ctx.addFeatureWithPolygon({
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
    })
    expect(model.onDrawFinished(drawn, ctx).kind).toBe('newFeature')
  })

  it('opens a context menu only for a selected feature', () => {
    const ctx = createFakeInteractionContext()
    const feature = ctx.addFeatureWithPolygon(drawn)
    expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    setFeatureSelected(feature, true)
    expect(model.allowsContextMenu(feature, ctx)).toBe(true)
    expect(isFeatureSelected(feature)).toBe(true)
  })

  it('ignores editMode entirely for allowsContextMenu (unlike GroupedInteractionModel)', () => {
    // F2 gates GroupedInteractionModel.allowsContextMenu on editMode. Legacy's
    // gate has always been selection alone and must stay that way regardless
    // of editMode, which is always false here in practice anyway.
    const ctx = createFakeInteractionContext({ editMode: true })
    const feature = ctx.addFeatureWithPolygon(drawn)
    expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    setFeatureSelected(feature, true)
    expect(model.allowsContextMenu(feature, ctx)).toBe(true)
  })
})
