import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { NgZone } from '@angular/core'
import { Observable } from 'rxjs'

import { notNullOrUndefined } from '@theseam/ui-common/utils'
import booleanContains from '@turf/boolean-contains'
import {
  multiPolygon as turfjsMultiPolygon,
  polygon as turfjsPolygon,
} from '@turf/helpers'

export enum AppFeaturePropertyName {
  IsSelected = `__app__isSelected`,
}

export function isAppFeatureProperty(propertyName: string): propertyName is AppFeaturePropertyName {
  return Object.values(AppFeaturePropertyName)
    .findIndex(value => value === propertyName) !== -1
}

export function isFeatureSelected(feature: google.maps.Data.Feature): boolean {
  const isSelected = feature.getProperty(AppFeaturePropertyName.IsSelected)
  return coerceBooleanProperty(isSelected)
}

export function setFeatureSelected(feature: google.maps.Data.Feature, isSelected: boolean): void {
  feature.setProperty(AppFeaturePropertyName.IsSelected, isSelected)
}

const EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_PROPERTY_NAME = 'styleOptions'
const EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_HOVERED_PROPERTY_NAME = 'styleOptionsHovered'
const EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_SELECTED_PROPERTY_NAME = 'styleOptionsSelected'

export function getStyleOptionsDefinedByFeature(feature: google.maps.Data.Feature): google.maps.Data.StyleOptions | undefined {
  return feature.getProperty(EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_PROPERTY_NAME) as google.maps.Data.StyleOptions || undefined
}

export function getHoveredStyleOptionsDefinedByFeature(feature: google.maps.Data.Feature): google.maps.Data.StyleOptions | undefined {
  return feature.getProperty(EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_HOVERED_PROPERTY_NAME) as google.maps.Data.StyleOptions || undefined
}

export function getSelectedStyleOptionsDefinedByFeature(feature: google.maps.Data.Feature): google.maps.Data.StyleOptions | undefined {
  return feature.getProperty(EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_SELECTED_PROPERTY_NAME) as google.maps.Data.StyleOptions || undefined
}

// TODO: Check performance of cloning a google.maps.Data instance, so the
// properties can be removed with the google maps api, instead of on the
// resulting json.
export function stripAppFeaturePropertiesFromJson(json: any) {
  if (notNullOrUndefined(json) && Array.isArray(json?.features)) {
    for (const feature of json.features) {
      if (notNullOrUndefined(feature?.properties)) {
        for (const k of Object.keys(feature.properties)) {
          if (isAppFeatureProperty(k)) {
            feature.properties[k] = undefined
            delete feature.properties[k]
          }
        }
      }
    }
  }
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
    if (f === feature) {
      return
    }

    const geometry = f.getGeometry()
    if (geometry === null) {
      throw Error(`Geometry not found.`)
    }
    if (geometry.getType() === 'Polygon' && featureContains(f, feature)) {
      exteriorPolygonFeature = f
    }
  })
  return exteriorPolygonFeature
}

export function addInnerFeatureCutoutToExteriorFeature(
  exteriorFeature: google.maps.Data.Feature,
  innerFeature: google.maps.Data.Feature
): void {
  const exteriorGeometry = exteriorFeature.getGeometry()
  if (exteriorGeometry === null) {
    throw Error(`Geometry not found.`)
  }
  const innerGeometry = innerFeature.getGeometry()
  if (innerGeometry === null) {
    throw Error(`Geometry not found.`)
  }
  // NOTE: Other geometries may support cutouts, but our map shapes editor only
  // supports polygons currently, so we will need to handle other geometry types
  // here if we start allowing users to draw shapes other than polygon.
  if (exteriorGeometry.getType() !== 'Polygon' || innerGeometry.getType() !== 'Polygon') {
    throw Error(`Inner cutout is only supported by Polygon gemoetry.`)
  }

  const featurePolygon = innerGeometry as google.maps.Data.Polygon
  const exteriorPolygon = exteriorGeometry as google.maps.Data.Polygon
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

export function polygonHasValidPathsLengths(polygon: google.maps.Polygon, minPointsInValidPath: number = 3): boolean {
  const paths = polygon.getPaths().getArray()
  for (const path of paths) {
    if (path.getLength() < minPointsInValidPath) {
      return false
    }
  }
  return true
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
  const geometry = googleFeature.getGeometry()
  if (geometry === null) {
    throw Error(`Geometry not found.`)
  }
  if (geometry.getType() === 'Polygon') {
    return toTurfJsPolygon(geometry as google.maps.Data.Polygon)
  } else if (geometry.getType() === 'MultiPolygon') {
    return toTurfJsMultiPolygon(geometry as google.maps.Data.MultiPolygon)
  }

  throw Error(`Unexpected geometry.`)
}

export function featureContains(featureA: google.maps.Data.Feature, featureB: google.maps.Data.Feature): boolean {
  const polygonA = toTurfJsFeature(featureA)
  const polygonB = toTurfJsFeature(featureB)
  return booleanContains(polygonA, polygonB)
}

export function createDataFeatureFromPolygon(polygon: google.maps.Polygon): google.maps.Data.Feature {
  const arr = polygon.getPaths().getArray().map(x => x.getArray())
  return new google.maps.Data.Feature({
    geometry: new google.maps.Data.Polygon(arr)
  })
}

export function getBoundsWithAllFeatures(data: google.maps.Data): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds()

  data.forEach(feature => {
    const geometry = feature.getGeometry()
    if (geometry === null) {
      throw Error(`Geometry not found.`)
    }
    geometry.forEachLatLng(latLng => {
      bounds.extend(latLng)
    })
  })

  return bounds
}

export function getFeatureBounds(feature: google.maps.Data.Feature): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds()

  const geometry = feature.getGeometry()
  if (geometry === null) {
    throw Error(`Geometry not found.`)
  }
  geometry.forEachLatLng(latLng => {
    bounds.extend(latLng)
  })

  return bounds
}

export function getFeatureCenter(feature: google.maps.Data.Feature): google.maps.LatLng {
  return getFeatureBounds(feature).getCenter()
}

export function removeAllFeatures(data: google.maps.Data): void {
  data.forEach(f => data.remove(f))
}

export function getFeaturesCount(data: google.maps.Data): number {
  let count = 0
  data.forEach(() => count++)
  return count
}

/**
 * NOTE: Original events are not emitted, because filtering may omit events.
 */
export function createFeatureChangeObservable(data: google.maps.Data, ngZone: NgZone): Observable<void> {
  return new Observable<void>(subscriber => {
    const listeners: google.maps.MapsEventListener[] = []

    ngZone.runOutsideAngular(() => {
      listeners.push(data.addListener('setgeometry', (event: google.maps.Data.SetGeometryEvent) => {
        ngZone.run(() => { subscriber.next(undefined) })
      }))

      listeners.push(data.addListener('addfeature', (event: google.maps.Data.AddFeatureEvent) => {
        ngZone.run(() => { subscriber.next(undefined) })
      }))

      listeners.push(data.addListener('removefeature', (event: google.maps.Data.RemoveFeatureEvent) => {
        ngZone.run(() => { subscriber.next(undefined) })
      }))

      listeners.push(data.addListener('setproperty', (event: google.maps.Data.SetPropertyEvent) => {
        if (!isAppFeatureProperty(event.name)) {
          ngZone.run(() => { subscriber.next(undefined) })
        }
      }))

      listeners.push(data.addListener('removeproperty', (event: google.maps.Data.RemovePropertyEvent) => {
        if (!isAppFeatureProperty(event.name)) {
          ngZone.run(() => { subscriber.next(undefined) })
        }
      }))
    })

    return () => {
      listeners.forEach(google.maps.event.removeListener)
    }
  })
}
