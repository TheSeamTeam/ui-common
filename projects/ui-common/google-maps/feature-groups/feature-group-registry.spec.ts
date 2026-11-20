import { Polygon } from 'geojson'

import { dataPolygonFromGeoJson } from '../google-maps-feature-helpers'
import {
  FakeData,
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import { FeatureGroupRegistry } from './feature-group-registry'

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

function makeFeature(properties: Record<string, any> = {}) {
  return new google.maps.Data.Feature({
    geometry: dataPolygonFromGeoJson(square),
    properties,
  })
}

describe('FeatureGroupRegistry', () => {
  let data: any

  beforeEach(() => {
    installFakeGoogleMaps()
    data = new FakeData()
  })
  afterEach(() => uninstallFakeGoogleMaps())

  it('groups features sharing the configured property value', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    const a1 = data.add(makeFeature({ fieldId: 'A' }))
    const a2 = data.add(makeFeature({ fieldId: 'A' }))
    const b1 = data.add(makeFeature({ fieldId: 'B' }))

    expect(registry.keyOf(a1)).toBe('A')
    expect(registry.keyOf(a2)).toBe('A')
    expect(registry.featuresIn('A')).toEqual([a1, a2])
    expect(registry.featuresIn('B')).toEqual([b1])
    expect(
      registry
        .groups()
        .map((g) => g.key)
        .sort(),
    ).toEqual(['A', 'B'])
  })

  it('gives each feature its own key when no group property is configured', () => {
    const registry = new FeatureGroupRegistry(data, {})
    const f1 = data.add(makeFeature())
    const f2 = data.add(makeFeature())

    expect(registry.keyOf(f1)).not.toBe(registry.keyOf(f2))
    expect(registry.groups()).toHaveLength(2)
  })

  it('keeps an assigned key stable across repeated reads', () => {
    const registry = new FeatureGroupRegistry(data, {})
    const feature = data.add(makeFeature())
    expect(registry.keyOf(feature)).toBe(registry.keyOf(feature))
  })

  it('falls back to an assigned key when the group property is absent', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    const grouped = data.add(makeFeature({ fieldId: 'A' }))
    const ungrouped = data.add(makeFeature())

    expect(registry.keyOf(grouped)).toBe('A')
    expect(registry.keyOf(ungrouped)).not.toBe('A')
    expect(ungrouped.getProperty('fieldId')).toBeUndefined()
  })

  it('writes the group property when assigning a new key', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
      newGroupKeyFactory: () => 'pending-1',
    })
    const feature = data.add(makeFeature())
    expect(registry.assignNewKey(feature)).toBe('pending-1')
    expect(feature.getProperty('fieldId')).toBe('pending-1')
  })

  it('writes only the app property when no group property is configured', () => {
    const registry = new FeatureGroupRegistry(data, {
      newGroupKeyFactory: () => 'pending-1',
    })
    const feature = data.add(makeFeature())
    registry.assignNewKey(feature)
    expect(feature.getProperty('__app__groupKey')).toBeDefined()
  })

  it('joins a feature to an existing group by writing that key', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    data.add(makeFeature({ fieldId: 'A' }))
    const drawn = data.add(makeFeature())

    registry.assignKey(drawn, 'A')

    expect(drawn.getProperty('fieldId')).toBe('A')
    expect(registry.featuresIn('A')).toHaveLength(2)
  })

  it('emits a group as GeoJSON without internal properties', () => {
    const registry = new FeatureGroupRegistry(data, {
      groupProperty: 'fieldId',
    })
    const feature = data.add(makeFeature({ fieldId: 'A' }))
    feature.setProperty('__app__isSelected', true)

    const group = registry.groupOf(feature)

    expect(group?.key).toBe('A')
    expect(group?.features).toHaveLength(1)
    expect(group?.features[0].properties).toEqual({ fieldId: 'A' })
  })
})
