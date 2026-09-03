import { Polygon } from 'geojson'

import {
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
})
