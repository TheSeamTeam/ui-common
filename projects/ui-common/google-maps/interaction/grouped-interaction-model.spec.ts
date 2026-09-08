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

    it('does nothing on a map click while already drawing', () => {
      // F4: onMapClick calling startDrawing() again would reset Terra Draw's
      // in-progress path via setMode('polyline'). The service already guards
      // its map 'click' listener on isDrawing(), but this is the model's own
      // defence against the same thing.
      const ctx = createFakeInteractionContext({
        editMode: true,
        isDrawing: true,
      })
      model.onMapClick(ctx)
      expect(ctx.startDrawing).not.toHaveBeenCalled()
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })

    it('still allows clicks and does not arm geometry editing', () => {
      // No draw is in progress, so there is no ambiguity between "select
      // this" and "place a vertex" — clicksAllowed follows isDrawing, not
      // selection, so a feature with nothing selected stays clickable too.
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.featureFlags(feature, ctx)).toEqual({
        geometryEditingArmed: false,
        clicksAllowed: true,
      })
    })

    it('selects the clicked feature group', () => {
      // Generalised onFeatureClick: with edit mode on and nothing selected, a
      // click still selects — it no longer takes leaving edit mode first.
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      model.onFeatureClick(feature, ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith('A', feature)
    })

    it('does nothing on a feature click while already drawing', () => {
      // Defensive guard mirroring onMapClick's: the service's data 'click'
      // listener already guards on isDrawing() before calling in here, but
      // this model does not rely solely on that guard.
      const ctx = createFakeInteractionContext({
        editMode: true,
        isDrawing: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      model.onFeatureClick(feature, ctx)
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })

    it('makes every feature ignore clicks while a draw is in progress', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        isDrawing: true,
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
    it('arms geometry editing for the selected group only, but leaves every group clickable', () => {
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
      // Not drawing, so B stays clickable too — only geometry editing is
      // restricted to the selected group.
      expect(model.featureFlags(other, ctx)).toEqual({
        geometryEditingArmed: false,
        clicksAllowed: true,
      })
    })

    it('disarms geometry editing while drawing and stops taking clicks', () => {
      // F3: geometryEditingArmed is disarmed for the selected group during a
      // draw so its vertex/midpoint handles don't compete with Terra Draw for
      // pointer events near the polygon. clicksAllowed follows isDrawing, not
      // selection, so it is suppressed here too — the draw itself is what
      // makes a click ambiguous, regardless of which group it would land in.
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
        isDrawing: true,
      })
      const selected = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')

      expect(model.featureFlags(selected, ctx)).toEqual({
        geometryEditingArmed: false,
        clicksAllowed: false,
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

    it('selects a different group when clicking outside the selected group', () => {
      // Clicking B while A is selected switches the selection to B — the
      // whole point of this change: no need to leave edit mode first.
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      const other = ctx.addFeatureWithPolygon(far, { fieldId: 'B' })
      ctx.setSelectedKey('A')
      model.onFeatureClick(other, ctx)
      expect(ctx.selectGroup).toHaveBeenCalledWith('B', other)
    })

    it('ignores a click on any feature while a draw is in progress', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
        isDrawing: true,
      })
      const selected = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      model.onFeatureClick(selected, ctx)
      expect(ctx.selectGroup).not.toHaveBeenCalled()
    })
  })

  describe('allowsContextMenu', () => {
    it('does not allow the context menu outside edit mode, even when the feature is selected', () => {
      const ctx = createFakeInteractionContext({
        editMode: false,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    })

    it('does not allow the context menu in edit mode when nothing is selected', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    })

    it('does not allow the context menu in edit mode for a feature outside the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('B')
      expect(model.allowsContextMenu(feature, ctx)).toBe(false)
    })

    it('allows the context menu in edit mode for a feature in the selected group', () => {
      const ctx = createFakeInteractionContext({
        editMode: true,
        groupProperty: 'fieldId',
      })
      const feature = ctx.addFeatureWithPolygon(big, { fieldId: 'A' })
      ctx.setSelectedKey('A')
      expect(model.allowsContextMenu(feature, ctx)).toBe(true)
    })
  })
})
