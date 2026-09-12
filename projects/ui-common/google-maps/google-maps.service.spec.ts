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
})
