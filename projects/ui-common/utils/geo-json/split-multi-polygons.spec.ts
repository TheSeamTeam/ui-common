import {
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson'

import { splitMultiPolygons } from './split-multi-polygons'

describe('splitMultiPolygons', () => {
  it('should not have Polygon if empty', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }
    splitMultiPolygons(featureCollection)
    expect(featureCollection.features.length).toBe(0)
  })

  it('should not have Polygon if no MultiPolygons', () => {
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
    splitMultiPolygons(featureCollection)
    expect(featureCollection.features.length).toBe(1)
    expect(featureCollection.features[0].geometry.type).toBe('Point')
  })

  it('should split MultiPolygon to Polygons, when only MultiPolygon', () => {
    const polygon1: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [ 0, 0 ],
          [ 0, 1 ],
          [ 1, 0 ],
          [ 0, 0 ],
        ],
      ],
    }
    const polygon2: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [ 1, 1 ],
          [ 1, 2 ],
          [ 2, 1 ],
          [ 1, 1 ],
        ],
      ],
    }
    const polygon3: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [ 2, 2 ],
          [ 2, 3 ],
          [ 3, 2 ],
          [ 2, 2 ],
        ],
      ],
    }
    const multiPolygon1: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        polygon1.coordinates,
        polygon2.coordinates,
        polygon3.coordinates,
      ],
    }
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: multiPolygon1,
          properties: { },
        },
      ],
    }
    splitMultiPolygons(featureCollection)
    expect(featureCollection.features.length).toBe(3)
    expect(featureCollection.features[0].geometry.type).toBe('Polygon')
    expect(featureCollection.features[1].geometry.type).toBe('Polygon')
    expect(featureCollection.features[2].geometry.type).toBe('Polygon')
    expect(featureCollection.features).toStrictEqual([
      {
        type: 'Feature',
        geometry: polygon1,
        properties: { },
      },
      {
        type: 'Feature',
        geometry: polygon2,
        properties: { },
      },
      {
        type: 'Feature',
        geometry: polygon3,
        properties: { },
      },
    ])
  })

  it('should split MultiPolygon to Polygons in-place', () => {
    const polygon1: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [ 0, 0 ],
          [ 0, 1 ],
          [ 1, 0 ],
          [ 0, 0 ],
        ],
      ],
    }
    const polygon2: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [ 1, 1 ],
          [ 1, 2 ],
          [ 2, 1 ],
          [ 1, 1 ],
        ],
      ],
    }
    const polygon3: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [ 2, 2 ],
          [ 2, 3 ],
          [ 3, 2 ],
          [ 2, 2 ],
        ],
      ],
    }
    const multiPolygon1: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        polygon1.coordinates,
        polygon2.coordinates,
        polygon3.coordinates,
      ],
    }
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
          geometry: multiPolygon1,
          properties: { },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 1, 1 ],
          },
          properties: { },
        },
      ],
    }
    splitMultiPolygons(featureCollection)
    expect(featureCollection.features.length).toBe(5)
    expect(featureCollection.features).toStrictEqual([
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
        geometry: polygon1,
        properties: { },
      },
      {
        type: 'Feature',
        geometry: polygon2,
        properties: { },
      },
      {
        type: 'Feature',
        geometry: polygon3,
        properties: { },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ 1, 1 ],
        },
        properties: { },
      },
    ])
  })
})
