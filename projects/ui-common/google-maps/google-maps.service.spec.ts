import { NgZone, ViewContainerRef } from '@angular/core'
import { Polygon } from 'geojson'

import {
  dataPolygonFromGeoJson,
  setFeatureSelected,
} from './google-maps-feature-helpers'
import { GoogleMapsService } from './google-maps.service'
import { MapValueManagerService } from './map-value-manager.service'
import {
  FakeMap,
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from './testing/fake-google-maps'

const square: Polygon = {
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

/** Runs callbacks straight through; the service only uses these two methods. */
const zone = {
  run: (fn: any) => fn(),
  runOutsideAngular: (fn: any) => fn(),
} as unknown as NgZone

function createService(): {
  service: GoogleMapsService
  map: FakeMap
} {
  const service = new GoogleMapsService(
    new MapValueManagerService(),
    zone,
    {} as ViewContainerRef,
  )
  const map = new FakeMap()
  service.setMap(map as unknown as google.maps.Map)
  return { service, map }
}

/** Add a feature to the map's data layer and return it. */
function addFeature(map: FakeMap, properties: Record<string, any>): any {
  return map.data.add(
    new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
      properties,
    }),
  )
}

/**
 * Add a feature whose geometry is neither `Polygon` nor `MultiPolygon` — the
 * one thing `geoJsonFeatureFromDataFeature` rejects. Such a feature still
 * renders and still occupies its group (`featuresIn` finds it), but
 * `groupWithSources` drops it, so it appears in neither `sources` nor the
 * emitted `group.features` a consumer ever sees.
 */
function addUnsupportedGeometryFeature(
  map: FakeMap,
  properties: Record<string, any>,
): any {
  const point = {
    getType: () => 'Point',
    forEachLatLng: () => undefined,
  }
  return map.data.add(
    new google.maps.Data.Feature({
      geometry: point as any,
      properties,
    }),
  )
}

/** Every feature currently on the data layer, unsupported geometry included. */
function allFeatures(map: FakeMap): any[] {
  const features: any[] = []
  map.data.forEach((f) => features.push(f))
  return features
}

describe('GoogleMapsService', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  describe('setGroupLabel', () => {
    it('writes the label onto every feature in the group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      const a1 = addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })
      const a2 = addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })

      expect(service.setGroupLabel('A', 'North 40')).toBe(true)

      expect(a1.getProperty('FIELD_NAME')).toBe('North 40')
      expect(a2.getProperty('FIELD_NAME')).toBe('North 40')
    })

    it('leaves other groups alone', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })
      const b = addFeature(map, { fieldId: 'B', FIELD_NAME: 'Untouched' })

      service.setGroupLabel('A', 'North 40')

      expect(b.getProperty('FIELD_NAME')).toBe('Untouched')
    })

    it('returns false for a key no feature carries', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'Old' })

      expect(service.setGroupLabel('NOPE', 'North 40')).toBe(false)
    })

    it('returns false when no featureLabelProperty is configured', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      const a = addFeature(map, { fieldId: 'A' })

      expect(service.setGroupLabel('A', 'North 40')).toBe(false)
      expect(a.getProperty('FIELD_NAME')).toBeUndefined()
    })

    it('raises no setproperty for a label that is already correct', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'North 40' })

      const events: any[] = []
      map.data.addListener('setproperty', (event: any) => events.push(event))

      expect(service.setGroupLabel('A', 'North 40')).toBe(true)
      expect(events).toHaveLength(0)
    })

    it('raises one setproperty per feature that actually changes', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setLabelProperty('FIELD_NAME')
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'North 40' })
      addFeature(map, { fieldId: 'A', FIELD_NAME: 'Stale' })

      const events: any[] = []
      map.data.addListener('setproperty', (event: any) => events.push(event))

      service.setGroupLabel('A', 'North 40')
      expect(events).toHaveLength(1)
    })
  })

  describe('delete commands (characterization)', () => {
    it('deleteGroup removes every feature in the group and nothing else', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })

      service.deleteGroup('A')

      expect(service.getGroups().map((g) => g.key)).toEqual(['B'])
    })

    it('deleteGroup clears the selection when it deleted the selected group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      service.selectGroup('A')

      service.deleteGroup('A')

      expect(service.getSelectedFeature()).toBeNull()
    })

    it('deleteGroup leaves an unrelated selection and context-menu target untouched', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const a = addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })
      service.selectGroup('A')
      // Establish a context-menu target the way a right-click does.
      service['_setContextMenuTarget'](a)

      service.deleteGroup('B')

      expect(service.getSelectedFeature()).toBe(a)
      expect(service['_contextMenuTargetSubject'].value?.group.key).toBe('A')
    })

    it('deleteGroup clears the context-menu target when it names the deleted group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      const b = addFeature(map, { fieldId: 'B' })
      service.selectGroup('A')
      // Establish a context-menu target on the group that is about to be
      // deleted, distinct from the current selection.
      service['_setContextMenuTarget'](b)

      service.deleteGroup('B')

      expect(service['_contextMenuTargetSubject'].value).toBeNull()
      // The selection is untouched: only the context-menu-target branch
      // should have fired.
      expect(service.getSelectedFeature()).not.toBeNull()
    })

    it('deleteSelection removes the selected features', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })
      service.selectGroup('A')

      service.deleteSelection()

      expect(service.getGroups().map((g) => g.key)).toEqual(['B'])
    })

    it('deleteSelection unconditionally clears the selection and the focused feature', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      service.selectGroup('A')

      service.deleteSelection()

      expect(service.getSelectedFeature()).toBeNull()
      expect(service['_focusedFeature']).toBeNull()
    })

    it('deleteSelection with nothing selected removes nothing', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      addFeature(map, { fieldId: 'A' })

      service.deleteSelection()

      expect(service.getGroups().map((g) => g.key)).toEqual(['A'])
    })

    it('deleteFocusedFeature falls back to the selection when nothing is focused', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })
      service.selectGroup('A')
      // selectGroup focuses the group's first feature; clear it so the
      // fallback path is the one under test.
      service['_focusedFeature'] = null

      service.deleteFocusedFeature()

      expect(service.getGroups().map((g) => g.key)).toEqual(['B'])
    })

    it('deleteFocusedFeature removes only the focused polygon of a multi-polygon group', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const a1 = addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A' })
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      service.deleteFocusedFeature()

      const groups = service.getGroups()
      expect(groups).toHaveLength(1)
      expect(groups[0].features).toHaveLength(1)
      // Distinctive behaviour vs. _removeSelection: the group's remaining
      // polygon stays selected, and the focused feature (now removed) is
      // cleared rather than the whole selection.
      expect(service.getSelectedFeature()).not.toBeNull()
      expect(service['_focusedFeature']).toBeNull()
    })
  })

  describe('delete gating', () => {
    /** A grouped-mode service with field A (two polygons) and field B (one). */
    function grouped() {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const a1 = addFeature(map, { fieldId: 'A' })
      const a2 = addFeature(map, { fieldId: 'A' })
      const b = addFeature(map, { fieldId: 'B' })
      return { service, map, a1, a2, b }
    }

    it('allows every delete when no predicate is set', () => {
      const { service } = grouped()
      service.selectGroup('A')
      expect(service.canDeleteGroup('A')).toBe(true)
      expect(service.canDeleteFocusedFeature()).toBe(true)
      expect(service.canDeleteSelection()).toBe(true)
    })

    it('refuses a group delete the predicate rejects', () => {
      const { service } = grouped()
      service.setCanDelete(() => false)
      service.selectGroup('A')

      expect(service.canDeleteGroup('A')).toBe(false)
      service.deleteGroup('A')
      expect(
        service
          .getGroups()
          .map((g) => g.key)
          .sort(),
      ).toEqual(['A', 'B'])
    })

    it('refuses a focused-feature delete the predicate rejects', () => {
      const { service, a1 } = grouped()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      service.setCanDelete(() => false)
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      expect(service.canDeleteFocusedFeature()).toBe(false)
      service.deleteFocusedFeature()
      expect(
        service.getGroups().find((g) => g.key === 'A')?.features,
      ).toHaveLength(2)
      // `deleteBlocked$` is the design's only feedback channel for a refused
      // delete, so every command must signal on it, not just `deleteGroup`.
      expect(blocked).toHaveLength(1)
      expect(blocked[0].group.key).toBe('A')
      expect(blocked[0].feature).not.toBeNull()
    })

    it('refuses a selection delete the predicate rejects', () => {
      const { service } = grouped()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      service.setCanDelete(() => false)
      service.selectGroup('A')

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()
      expect(
        service
          .getGroups()
          .map((g) => g.key)
          .sort(),
      ).toEqual(['A', 'B'])
      // The legacy `Delete`-key path signals too.
      expect(blocked).toHaveLength(1)
      expect(blocked[0].group.key).toBe('A')
      // The selection covers all of A, so this is a group delete.
      expect(blocked[0].feature).toBeNull()
    })

    it('consults a whole-group delete with feature: null', () => {
      const { service } = grouped()
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.canDeleteGroup('A')

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('A')
      expect(seen[0].feature).toBeNull()
    })

    it('consults a polygon delete with that polygon, when the group survives', () => {
      const { service, a1 } = grouped()
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      service.canDeleteFocusedFeature()

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('A')
      expect(seen[0].feature).not.toBeNull()
    })

    it('consults the last polygon of a group as a group delete', () => {
      const { service, b } = grouped()
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.selectGroup('B')
      service['_focusedFeature'] = b

      service.canDeleteFocusedFeature()

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('B')
      // B has one polygon, so removing it empties the group: this is a group
      // delete however it was asked for.
      expect(seen[0].feature).toBeNull()
    })

    it('refuses to delete a feature that declares editable: false', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const retired = addFeature(map, {
        fieldId: 'R',
        styleOptions: { editable: false },
      })
      service.selectGroup('R')
      service['_focusedFeature'] = retired

      expect(service.canDeleteFocusedFeature()).toBe(false)
      expect(service.canDeleteGroup('R')).toBe(false)

      service.deleteGroup('R')
      expect(service.getGroups().map((g) => g.key)).toEqual(['R'])
    })

    it('refuses a group delete when any one member is locked', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A', styleOptions: { editable: false } })

      expect(service.canDeleteGroup('A')).toBe(false)
    })

    it('still allows deleting an unlocked sibling of a locked feature', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const open = addFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'A', styleOptions: { editable: false } })
      service.selectGroup('A')
      service['_focusedFeature'] = open

      expect(service.canDeleteFocusedFeature()).toBe(true)
    })

    it('applies the lock in legacy mode too', () => {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      const retired = addFeature(map, {
        fieldId: 'R',
        styleOptions: { editable: false },
      })
      service.selectGroup('R')
      service['_focusedFeature'] = retired

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()
      expect(service.getGroups().map((g) => g.key)).toEqual(['R'])
    })

    it('emits deleteBlocked once per refused command', () => {
      const { service } = grouped()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      service.setCanDelete(() => false)
      service.selectGroup('A')

      service.deleteGroup('A')

      expect(blocked).toHaveLength(1)
      expect(blocked[0].group.key).toBe('A')
      expect(blocked[0].feature).toBeNull()
    })

    it('never emits deleteBlocked from a query', () => {
      const { service } = grouped()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      service.setCanDelete(() => false)
      service.selectGroup('A')

      service.canDeleteGroup('A')
      service.canDeleteFocusedFeature()
      service.canDeleteSelection()

      expect(blocked).toHaveLength(0)
    })

    it('leaves the selection and the context-menu target untouched when refused', () => {
      const { service, a1 } = grouped()
      service.selectGroup('A')
      service['_focusedFeature'] = a1
      // Establish a context-menu target the way a right-click would, before
      // the predicate starts refusing.
      service['_setContextMenuTarget'](a1)
      const targetBefore = service['_contextMenuTargetSubject'].value
      service.setCanDelete(() => false)

      service.deleteFocusedFeature()

      expect(service.getSelectedFeature()).not.toBeNull()
      expect(service['_focusedFeature']).toBe(a1)
      // A refused delete removed nothing, so the open menu's target is not
      // dangling and must survive — unlike after a successful delete, which
      // clears it.
      expect(service['_contextMenuTargetSubject'].value).toBe(targetBefore)
    })

    it('does not consult the predicate, or emit, when there is nothing to delete', () => {
      const { service } = createService()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      const predicate = jest.fn(() => false)
      service.setCanDelete(predicate)

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()

      expect(predicate).not.toHaveBeenCalled()
      expect(blocked).toHaveLength(0)
    })

    it('deleteSelection falls through to the remover when there is nothing to delete, clearing _focusedFeature', () => {
      // Distinguishes falling through to _removeSelection() from an early
      // return: both leave the predicate uncalled and emit nothing, but only
      // falling through reaches _removeSelection() -> clearSelection() ->
      // _applySelection(null, null), which clears _focusedFeature. An early
      // return would leave it untouched.
      const { service, map } = createService()
      const feature = addFeature(map, { fieldId: 'A' })
      service['_focusedFeature'] = feature

      expect(service.canDeleteSelection()).toBe(false)
      service.deleteSelection()

      expect(service['_focusedFeature']).toBeNull()
    })

    it('finds nothing to delete when the raw selection flag is off despite a selected group', () => {
      // Reproduces the divergence startDrawing() can create: it raw-deselects
      // every feature via setFeatureSelected without touching
      // _selectionSubject, so the subject can hold a group key while no
      // feature in it carries the raw selected flag. _selectionDeletion()
      // must find nothing to remove here, the same as it reads the data
      // layer's raw flags rather than looking the key up via featuresIn().
      const { service, a1, a2 } = grouped()
      service.selectGroup('A')
      setFeatureSelected(a1, false)
      setFeatureSelected(a2, false)
      const predicate = jest.fn(() => false)
      service.setCanDelete(predicate)

      expect(service.canDeleteSelection()).toBe(false)
      expect(predicate).not.toHaveBeenCalled()
    })

    /**
     * A group holding one ordinary polygon plus one feature with unsupported
     * geometry, with the latter focused — the state a right-click on it
     * produces, since `_applySelection` sets the raw selected flag on every
     * feature in `featuresIn(key)` and `allowsContextMenu` therefore passes.
     */
    function withUnnamableFocus() {
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const a1 = addFeature(map, { fieldId: 'A' })
      const odd = addUnsupportedGeometryFeature(map, { fieldId: 'A' })
      service.selectGroup('A')
      service['_focusedFeature'] = odd
      return { service, map, a1, odd }
    }

    it('refuses a non-emptying delete of an unsupported-geometry feature when a predicate is set', () => {
      const { service, map, odd } = withUnnamableFocus()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))
      // Permissive on purpose: the refusal below is not the predicate's
      // answer, it is the gate declining to ask a dishonest question. The
      // only target it could hand over is `feature: null`, which promises the
      // whole group is going — untrue here, since a1 survives.
      const predicate = jest.fn(() => true)
      service.setCanDelete(predicate)

      expect(service.canDeleteFocusedFeature()).toBe(false)
      service.deleteFocusedFeature()

      expect(predicate).not.toHaveBeenCalled()
      expect(allFeatures(map)).toHaveLength(2)
      expect(allFeatures(map)).toContain(odd)
      // Refused like any other refusal: signalled, and nothing changed.
      expect(blocked).toHaveLength(1)
      expect(blocked[0].group.key).toBe('A')
    })

    it('leaves that same delete alone when no predicate is set', () => {
      // Nobody to lie to, so nothing to protect — and refusing here would
      // change 'legacy' behaviour for unsupported-geometry features, which
      // must not drift.
      const { service, map, a1, odd } = withUnnamableFocus()
      const blocked: any[] = []
      service.deleteBlocked$.subscribe((target) => blocked.push(target))

      expect(service.canDeleteFocusedFeature()).toBe(true)
      service.deleteFocusedFeature()

      expect(allFeatures(map)).toEqual([a1])
      expect(allFeatures(map)).not.toContain(odd)
      expect(blocked).toHaveLength(0)
    })

    it('consults an emptying delete of an unsupported-geometry feature with feature: null', () => {
      // `feature: null` is honest whenever the group is emptied, whatever the
      // group holds — so this case is never refused.
      const { service, map } = createService()
      service.setGroupOptions({ groupProperty: 'fieldId' })
      service.setInteractionMode('grouped')
      const odd = addUnsupportedGeometryFeature(map, { fieldId: 'A' })
      addFeature(map, { fieldId: 'B' })
      const seen: any[] = []
      service.setCanDelete((target) => {
        seen.push(target)
        return true
      })
      service.selectGroup('A')
      service['_focusedFeature'] = odd

      expect(service.canDeleteFocusedFeature()).toBe(true)

      expect(seen).toHaveLength(1)
      expect(seen[0].group.key).toBe('A')
      expect(seen[0].feature).toBeNull()
    })

    it('reports false from every query before the map is ready', () => {
      const service = new GoogleMapsService(
        new MapValueManagerService(),
        zone,
        {} as ViewContainerRef,
      )
      expect(service.canDeleteSelection()).toBe(false)
      expect(service.canDeleteGroup('A')).toBe(false)
      expect(service.canDeleteFocusedFeature()).toBe(false)
    })
  })
})
