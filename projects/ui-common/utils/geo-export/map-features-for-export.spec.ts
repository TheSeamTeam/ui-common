import type { Feature, FeatureCollection } from 'geojson'
import { mapFeaturesForExport } from './map-features-for-export'

function feature(id: number): Feature {
  return {
    type: 'Feature',
    properties: { id, extra: 'x' },
    geometry: { type: 'Point', coordinates: [id, id] },
  }
}

describe('mapFeaturesForExport', () => {
  const input: FeatureCollection = {
    type: 'FeatureCollection',
    features: [feature(0), feature(1), feature(2)],
  }

  it('drops features mapped to null and replaces properties', () => {
    const out = mapFeaturesForExport(input, (f, i) =>
      i === 1 ? null : { n: i },
    )
    expect(out.type).toBe('FeatureCollection')
    expect(out.features.map((f) => f.properties)).toEqual([{ n: 0 }, { n: 2 }])
    expect(out.features[0].geometry).toBe(input.features[0].geometry)
  })

  it('passes the input index', () => {
    const seen: number[] = []
    mapFeaturesForExport(input, (f, i) => {
      seen.push(i)
      return null
    })
    expect(seen).toEqual([0, 1, 2])
  })

  it('leaves the input unchanged', () => {
    const before = JSON.parse(JSON.stringify(input))
    mapFeaturesForExport(input, () => ({ a: 1 }))
    expect(input).toEqual(before)
  })
})
