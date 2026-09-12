import { NgZone, ViewContainerRef } from '@angular/core'
import { Polygon } from 'geojson'

import { dataPolygonFromGeoJson } from './google-maps-feature-helpers'
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
      service.setCanDelete(() => false)
      service.selectGroup('A')
      service['_focusedFeature'] = a1

      expect(service.canDeleteFocusedFeature()).toBe(false)
      service.deleteFocusedFeature()
      expect(
        service.getGroups().find((g) => g.key === 'A')?.features,
      ).toHaveLength(2)
    })

    it('refuses a selection delete the predicate rejects', () => {
      const { service } = grouped()
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
