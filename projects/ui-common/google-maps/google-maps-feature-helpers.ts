import { coerceBooleanProperty } from '@angular/cdk/coercion'

import booleanContains from '@turf/boolean-contains'
import {
  multiPolygon as turfjsMultiPolygon,
  polygon as turfjsPolygon,
} from '@turf/helpers'

const APP_FEATURE_PROPERTY_PREFIX = '__app__'
const APP_FEATURE_SELECTED_PROPERTY = 'isSelected'

export function getSeamFeaturePropertyName(name: string): string {
  return `${APP_FEATURE_PROPERTY_PREFIX}${name}`
}

export function getSeamFeatureProperty(feature: google.maps.Data.Feature, name: string): any {
  return feature.getProperty(getSeamFeaturePropertyName(name))
}

export function setSeamFeatureProperty(feature: google.maps.Data.Feature, name: string, value: any): void {
  feature.setProperty(getSeamFeaturePropertyName(name), value)
}

export function isFeatureSelected(feature: google.maps.Data.Feature): boolean {
  const isSelected = getSeamFeatureProperty(feature, APP_FEATURE_SELECTED_PROPERTY)
  return coerceBooleanProperty(isSelected)
}

export function setFeatureSelected(feature: google.maps.Data.Feature, isSelected: boolean): void {
  setSeamFeatureProperty(feature, APP_FEATURE_SELECTED_PROPERTY, isSelected)
}

/**
 * Searches for a Feature in Data that contains the provided Feature and can use
 * it as a cutout area.
 */
export function getPossibleExteriorFeature(
  data: google.maps.Data,
  feature: google.maps.Data.Feature
): google.maps.Data.Feature | undefined {
  let exteriorPolygonFeature: google.maps.Data.Feature | undefined
  data.forEach(f => {
    if (f !== feature && (f.getGeometry().getType() === 'Polygon' && featureContains(f, feature))) {
      exteriorPolygonFeature = f
    }
  })
  return exteriorPolygonFeature
}

export function addInnerFeatureCutoutToExteriorFeature(
  exteriorFeature: google.maps.Data.Feature,
  innerFeature: google.maps.Data.Feature
): void {
  // NOTE: Other geometries may support cutouts, but our map shapes editor only
  // supports polygons currently, so we will need to handle other geometry types
  // here if we start allowing users to draw shapes other than polygon.
  if (exteriorFeature.getGeometry().getType() !== 'Polygon' || innerFeature.getGeometry().getType() !== 'Polygon') {
    throw Error(`Inner cutout is only supported by Polygon gemoetry.`)
  }

  const featurePolygon = innerFeature.getGeometry() as google.maps.Data.Polygon
  const exteriorPolygon = exteriorFeature.getGeometry() as google.maps.Data.Polygon
  exteriorFeature.setGeometry(new google.maps.Data.Polygon([
    ...exteriorPolygon.getArray(),
    featurePolygon.getAt(0).getArray().reverse()
  ]))
}

/**
 * Google maps paths don't always start and stop at the exact same position, so
 * this will fix that for turfjs.
 */
export function fixPathDifferentStartingAndEndingPoint(coordinates: number[][]): void {
  if (coordinates.length <= 1) {
    return
  }

  const start = coordinates[0]
  const end = coordinates[coordinates.length - 1]
  if (start[0] === end[0] && start[1] === end[1]) {
    return
  }

  coordinates.push(coordinates[0])
}

export function polygonCoordinates(polygon: google.maps.Data.Polygon): number[][][] {
  return polygon.getArray().map(linRing => {
    const coords = linRing.getArray().map(x => [ x.lng(), x.lat() ])
    fixPathDifferentStartingAndEndingPoint(coords)
    return coords
  })
}

export function multiPolygonCoordinates(multiPolygon: google.maps.Data.MultiPolygon): number[][][][] {
  return multiPolygon.getArray().map(x => polygonCoordinates(x))
}

export function toTurfJsPolygon(polygon: google.maps.Data.Polygon) {
  return turfjsPolygon(polygonCoordinates(polygon))
}

export function toTurfJsMultiPolygon(multiPolygon: google.maps.Data.MultiPolygon) {
  return turfjsMultiPolygon(multiPolygonCoordinates(multiPolygon))
}

export function toTurfJsFeature(googleFeature: google.maps.Data.Feature) {
  if (googleFeature.getGeometry().getType() === 'Polygon') {
    return toTurfJsPolygon(googleFeature.getGeometry() as google.maps.Data.Polygon)
  } else if (googleFeature.getGeometry().getType() === 'MultiPolygon') {
    return toTurfJsMultiPolygon(googleFeature.getGeometry() as google.maps.Data.MultiPolygon)
  }

  throw Error(`Unexpected geometry.`)
}

export function featureContains(featureA: google.maps.Data.Feature, featureB: google.maps.Data.Feature): boolean {
  const polygonA = toTurfJsFeature(featureA)
  const polygonB = toTurfJsFeature(featureB)
  return booleanContains(polygonA, polygonB)
}

export function createDataFeatureFromPolygon(polygon: google.maps.Polygon): google.maps.Data.Feature {
  const arr = polygon.getPath().getArray()
  return new google.maps.Data.Feature({
    geometry: new google.maps.Data.Polygon([ arr ])
  })
}
