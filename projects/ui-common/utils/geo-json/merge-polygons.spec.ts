import {
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson'

import { mergePolygons } from './merge-polygons'

describe('mergePolygons', () => {
  it('should not have MultiPolygon if empty', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }
    mergePolygons(featureCollection)
    expect(featureCollection.features.length).toBe(0)
  })

  it('should not have MultiPolygon if no Polygons', () => {
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
    mergePolygons(featureCollection)
    expect(featureCollection.features.length).toBe(1)
    expect(featureCollection.features[0].geometry.type).toBe('Point')
  })

  it('should merge Polygons to MultiPolygon, when only polygons', () => {
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
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
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
      ],
    }
    mergePolygons(featureCollection)
    expect(featureCollection.features.length).toBe(1)
    expect(featureCollection.features[0].geometry.type).toBe('MultiPolygon')
    expect((featureCollection.features[0].geometry as MultiPolygon).coordinates).toStrictEqual([
      polygon1.coordinates,
      polygon2.coordinates,
      polygon3.coordinates,
    ])
  })

  it('should merge Polygons to MultiPolygon, when has non-Polygon', () => {
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
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: polygon1,
          properties: { },
        },
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
          geometry: polygon2,
          properties: { },
        },
        {
          type: 'Feature',
          geometry: polygon3,
          properties: { },
        },
      ],
    }
    mergePolygons(featureCollection)
    expect(featureCollection.features.length).toBe(2)
    expect(featureCollection.features[0].geometry.type).toBe('Point')
    expect(featureCollection.features[1].geometry.type).toBe('MultiPolygon')
    expect((featureCollection.features[1].geometry as MultiPolygon).coordinates).toStrictEqual([
      polygon1.coordinates,
      polygon2.coordinates,
      polygon3.coordinates,
    ])
  })
})
