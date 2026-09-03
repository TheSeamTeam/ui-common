import { Polygon } from 'geojson'

import { createFakeInteractionContext } from '../testing/fake-interaction-context'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import { GroupedInteractionModel } from './grouped-interaction-model'

const big: Polygon = {
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
}

const small: Polygon = {
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

const far: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [50, 50],
      [50, 51],
      [51, 51],
      [51, 50],
      [50, 50],
    ],
  ],
}

describe('GroupedInteractionModel', () => {
  let model: GroupedInteractionModel

  beforeEach(() => {
    installFakeGoogleMaps()
    model = new GroupedInteractionModel()
  })
  afterEach(() => uninstallFakeGoogleMaps())

  describe('edit mode off', () => {
    it('selects the clicked feature group', () => {
      const ctx = createFakeInteractionContext({ groupProperty: 'fieldId' })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      model.onFeatureClick(feature, ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith('A', feature)
    })

    it('clears selection on a map click', () => {
      const ctx = createFakeInteractionContext()
      model.onMapClick(ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith(null, null)
      expect(ctx.startDrawing).not.toHaveBeenCalled()
    })

    it('allows clicks and does not arm geometry editing', () => {
      const ctx = createFakeInteractionContext({ groupProperty: 'fieldId' })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.featureFlags(feature, ctx)).toEqual({
        geometryEditingArmed: false,
        clicksAllowed: true,
      })
    })
  })

  describe('edit mode on, nothing selected', () => {
    it('starts a draw on a map click', () => {
      const ctx = createFakeInteractionContext({ editMode: true })
      model.onMapClick(ctx)
      expect(ctx.startDrawing).toHaveBeenCalled()
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })

    it('makes every feature ignore clicks', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.featureFlags(feature, ctx).clicksAllowed).toBe(false)
    })

    it('creates a new group when a draw finishes', () => {
      const ctx = createFakeInteractionContext({ editMode: true })
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'newFeature',
        groupKey: null,
      })
    })

    it('does not cut a hole in an unrelated field', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        allowHoles: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      // `small` is inside `big`, but nothing is selected, so the containment
      // search must not run at all.
      expect(model.onDrawFinished(small, ctx).kind).toBe('newFeature')
    })
  })

  describe('edit mode on, a group selected', () => {
    it('arms geometry editing for the selected group only', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const selected = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      const other = ctx.addFeatureWithPolygon(far, { fieldId: 'B' })
      ctx.setSelectedKey('A')

      expect(model.featureFlags(selected, ctx)).toEqual({
        geometryEditingArmed: true,
        clicksAllowed: true,
      })
      expect(model.featureFlags(other, ctx).clicksAllowed).toBe(false)
    })

    it('disarms geometry editing while drawing but keeps the group selected-styled', () => {
      // F3: the selected group is the target a drawn polygon will join, so it
      // stays visibly selected mid-draw (clicksAllowed follows selection, not
      // isDrawing) — but its vertex/midpoint handles are disarmed so they
      // don't compete with Terra Draw for pointer events near the polygon.
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
        isDrawing: true,
      })
      const selected = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')

      expect(model.featureFlags(selected, ctx)).toEqual({
        geometryEditingArmed: false,
        clicksAllowed: true,
      })
    })

    it('joins a drawn polygon to the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(far, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'newFeature',
        groupKey: 'A',
      })
    })

    it('cuts a hole when the drawing is inside the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        allowHoles: true,
        groupProperty: 'fieldId',
      })
      const container = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'hole',
        target: container,
      })
    })

    it('does not cut a hole into a different group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        allowHoles: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'B' })
      ctx.addFeatureWithPolygon(far, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.onDrawFinished(small, ctx)).toEqual({
        kind: 'newFeature',
        groupKey: 'A',
      })
    })

    it('updates the focused feature when clicking within the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      model.onFeatureClick(feature, ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith('A', feature)
    })

    it('ignores clicks on features outside the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      const other = ctx.addFeatureWithPolygon(far, { fieldId: 'B' })
      ctx.setSelectedKey('A')
      model.onFeatureClick(other, ctx)
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })
  })

  describe('allowsContextMenu', () => {
    it('does not allow the context menu outside edit mode', () => {
      const ctx = createFakeInteractionContext({
        editMode: false,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    })

    it('allows the context menu in edit mode', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.allowsContextMenu(feature, ctx)).toBe(true)
    })
  })
})
