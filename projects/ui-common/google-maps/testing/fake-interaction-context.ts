import { Polygon } from 'geojson'

import { FeatureGroupRegistry } from '../feature-groups/feature-group-registry'
import {
  dataPolygonFromGeoJson,
  polygonsFromDataFeature,
} from '../google-maps-feature-helpers'
import { MapInteractionContext } from '../interaction/map-interaction-model'
import { FakeData } from './fake-google-maps'

import { polygonContains } from '@theseam/ui-common/utils'

export interface FakeInteractionContext extends MapInteractionContext {
  data: FakeData
  selectGroup: jest.Mock
  startDrawing: jest.Mock
  /** Add a feature with the given geometry to the fake data layer. */
  addFeatureWithPolygon(
    polygon: Polygon,
    properties?: Record<string, any>,
  ): google.maps.Data.Feature
  /** Set what `getSelectedKey()` returns. */
  setSelectedKey(key: string | null): void
}

/**
 * A `MapInteractionContext` backed by the fake data layer, with the two
 * side-effecting methods as jest mocks so specs can assert on them.
 */
export function createFakeInteractionContext(
  overrides: Partial<{
    editingEnabled: boolean
    allowHoles: boolean
    editMode: boolean
    isDrawing: boolean
    groupProperty: string
  }> = {},
): FakeInteractionContext {
  const data = new FakeData()
  const groups = new FeatureGroupRegistry(data as any, {
    groupProperty: overrides.groupProperty,
    newGroupKeyFactory: (() => {
      let seq = 0
      return () => `new-${seq++}`
    })(),
  })

  let selectedKey: string | null = null

  const context: FakeInteractionContext = {
    data,
    groups,
    editingEnabled: overrides.editingEnabled ?? true,
    allowHoles: overrides.allowHoles ?? false,
    editMode: overrides.editMode ?? false,
    isDrawing: overrides.isDrawing ?? false,
    getSelectedKey: () => selectedKey,
    setSelectedKey: (key) => {
      selectedKey = key
    },
    selectGroup: jest.fn((key: string | null) => {
      selectedKey = key
    }),
    startDrawing: jest.fn(),
    findContainingFeature: (polygon, groupKey, accept) => {
      let match: google.maps.Data.Feature | undefined
      data.forEach((feature: any) => {
        if (match) {
          return
        }
        if (groupKey !== undefined && groups.keyOf(feature) !== groupKey) {
          return
        }
        if (accept && !accept(feature)) {
          return
        }
        const contains = polygonsFromDataFeature(feature).some((part) =>
          polygonContains(part, polygon),
        )
        if (contains) {
          match = feature
        }
      })
      return match
    },
    addFeatureWithPolygon: (polygon, properties = {}) =>
      data.add(
        new google.maps.Data.Feature({
          geometry: dataPolygonFromGeoJson(polygon),
          properties,
        }),
      ),
  }

  return context
}
