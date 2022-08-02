import { FeatureCollection } from 'geojson'

import { isOnlyGeometryTypes } from './is-only-geometry-types'

describe('isOnlyGeometryTypes', () => {
  it('should be true if no features and no types', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }
    expect(isOnlyGeometryTypes(featureCollection, [])).toBe(true)
  })

  it('should be true if no features and 1 type', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }
    expect(isOnlyGeometryTypes(featureCollection, [ 'Point' ])).toBe(true)
  })

  it('should be true if 1 feature, with specified type, and 1 type', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 0, 0 ],
          },
          properties: { },
        },
      ],
    }
    expect(isOnlyGeometryTypes(featureCollection, [ 'Point' ])).toBe(true)
  })

  it('should be false if 1 feature, with not specified type, and 1 type', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 0, 0 ],
          },
          properties: { },
        },
      ],
    }
    expect(isOnlyGeometryTypes(featureCollection, [ 'Polygon' ])).toBe(false)
  })

  it('should be false if 2 features, with one specified type, and 1 type', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 0, 0 ],
          },
          properties: { },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [ 0, 0 ],
                [ 0, 1 ],
                [ 1, 1 ],
                [ 1, 0 ],
                [ 0, 0 ],
              ]
            ],
          },
          properties: { },
        },
      ],
    }
    expect(isOnlyGeometryTypes(featureCollection, [ 'Point' ])).toBe(false)
  })

  it('should be true if 2 features, with specified type, and 2 types', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 0, 0 ],
          },
          properties: { },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [ 0, 0 ],
                [ 0, 1 ],
                [ 1, 1 ],
                [ 1, 0 ],
                [ 0, 0 ],
              ]
            ],
          },
          properties: { },
        },
      ],
    }
    expect(isOnlyGeometryTypes(featureCollection, [ 'Point', 'Polygon' ])).toBe(true)
  })

  it('should be true if 1 feature, with specified type, and 2 types', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 0, 0 ],
          },
          properties: { },
        },
      ],
    }
    expect(isOnlyGeometryTypes(featureCollection, [ 'Point', 'Polygon' ])).toBe(true)
  })
})
