import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { NgZone } from '@angular/core'
import { Polygon } from 'geojson'
import { Observable } from 'rxjs'

import { closePolygons, notNullOrUndefined } from '@theseam/ui-common/utils'

export enum AppFeaturePropertyName {
  IsSelected = `__app__isSelected`,
}

export function isAppFeatureProperty(
  propertyName: string,
): propertyName is AppFeaturePropertyName {
  return (
    Object.values(AppFeaturePropertyName).findIndex(
      (value) => value === propertyName,
    ) !== -1
  )
}

export function isFeatureSelected(feature: google.maps.Data.Feature): boolean {
  const isSelected = feature.getProperty(AppFeaturePropertyName.IsSelected)
  return coerceBooleanProperty(isSelected)
}

export function setFeatureSelected(
  feature: google.maps.Data.Feature,
  isSelected: boolean,
): void {
  feature.setProperty(AppFeaturePropertyName.IsSelected, isSelected)
}

const EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_PROPERTY_NAME = 'styleOptions'
const EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_HOVERED_PROPERTY_NAME =
  'styleOptionsHovered'
const EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_SELECTED_PROPERTY_NAME =
  'styleOptionsSelected'

export function getStyleOptionsDefinedByFeature(
  feature: google.maps.Data.Feature,
): google.maps.Data.StyleOptions | undefined {
  return (
    (feature.getProperty(
      EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_PROPERTY_NAME,
    ) as google.maps.Data.StyleOptions) || undefined
  )
}

export function getHoveredStyleOptionsDefinedByFeature(
  feature: google.maps.Data.Feature,
): google.maps.Data.StyleOptions | undefined {
  return (
    (feature.getProperty(
      EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_HOVERED_PROPERTY_NAME,
    ) as google.maps.Data.StyleOptions) || undefined
  )
}

export function getSelectedStyleOptionsDefinedByFeature(
  feature: google.maps.Data.Feature,
): google.maps.Data.StyleOptions | undefined {
  return (
    (feature.getProperty(
      EXTERNAL_FEATURE_DEFINED_STYLE_OPTIONS_SELECTED_PROPERTY_NAME,
    ) as google.maps.Data.StyleOptions) || undefined
  )
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

export function polygonHasValidPathsLengths(
  polygon: google.maps.Polygon,
  minPointsInValidPath: number = 3,
): boolean {
  const paths = polygon.getPaths().getArray()
  for (const path of paths) {
    if (path.getLength() < minPointsInValidPath) {
      return false
    }
  }
  return true
}

export function polygonCoordinates(
  polygon: google.maps.Data.Polygon,
): number[][][] {
  const polygonGeoJson: Polygon = {
    type: 'Polygon',
    coordinates: polygon
      .getArray()
      .map((linRing) => linRing.getArray().map((x) => [x.lng(), x.lat()])),
  }
  closePolygons(polygonGeoJson)
  return polygonGeoJson.coordinates
}

/** Build a google.maps.Data.Polygon from a GeoJSON Polygon (lng/lat order). */
export function dataPolygonFromGeoJson(
  polygon: Polygon,
): google.maps.Data.Polygon {
  const rings = polygon.coordinates.map((ring) =>
    ring.map(([lng, lat]) => ({ lat, lng }) as google.maps.LatLngLiteral),
  )
  return new google.maps.Data.Polygon(rings)
}

/**
 * Read an existing feature's Polygon geometry as a closed GeoJSON Polygon.
 * Returns undefined for non-Polygon geometries. Does not mutate the feature.
 */
export function geoJsonPolygonFromDataFeature(
  feature: google.maps.Data.Feature,
): Polygon | undefined {
  const geometry = feature.getGeometry()
  if (geometry === null || geometry.getType() !== 'Polygon') {
    return undefined
  }
  const polygon: Polygon = {
    type: 'Polygon',
    coordinates: polygonCoordinates(geometry as google.maps.Data.Polygon),
  }
  closePolygons(polygon)
  return polygon
}

export function multiPolygonCoordinates(
  multiPolygon: google.maps.Data.MultiPolygon,
): number[][][][] {
  return multiPolygon.getArray().map((x) => polygonCoordinates(x))
}

export function getBoundsWithAllFeatures(
  data: google.maps.Data,
): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds()

  data.forEach((feature) => {
    const geometry = feature.getGeometry()
    if (geometry === null) {
      throw Error(`Geometry not found.`)
    }
    geometry.forEachLatLng((latLng) => {
      bounds.extend(latLng)
    })
  })

  return bounds
}

export function getFeatureBounds(
  feature: google.maps.Data.Feature,
): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds()

  const geometry = feature.getGeometry()
  if (geometry === null) {
    throw Error(`Geometry not found.`)
  }
  geometry.forEachLatLng((latLng) => {
    bounds.extend(latLng)
  })

  return bounds
}

export function getFeatureCenter(
  feature: google.maps.Data.Feature,
): google.maps.LatLng {
  return getFeatureBounds(feature).getCenter()
}

export function removeAllFeatures(data: google.maps.Data): void {
  data.forEach((f) => data.remove(f))
}

export function getFeaturesCount(data: google.maps.Data): number {
  let count = 0
  data.forEach(() => count++)
  return count
}

/**
 * NOTE: Original events are not emitted, because filtering may omit events.
 */
export function createFeatureChangeObservable(
  data: google.maps.Data,
  ngZone: NgZone,
): Observable<void> {
  return new Observable<void>((subscriber) => {
    const listeners: google.maps.MapsEventListener[] = []

    ngZone.runOutsideAngular(() => {
      listeners.push(
        data.addListener(
          'setgeometry',
          (event: google.maps.Data.SetGeometryEvent) => {
            ngZone.run(() => {
              subscriber.next(undefined)
            })
          },
        ),
      )

      listeners.push(
        data.addListener(
          'addfeature',
          (event: google.maps.Data.AddFeatureEvent) => {
            ngZone.run(() => {
              subscriber.next(undefined)
            })
          },
        ),
      )

      listeners.push(
        data.addListener(
          'removefeature',
          (event: google.maps.Data.RemoveFeatureEvent) => {
            ngZone.run(() => {
              subscriber.next(undefined)
            })
          },
        ),
      )

      listeners.push(
        data.addListener(
          'setproperty',
          (event: google.maps.Data.SetPropertyEvent) => {
            if (!isAppFeatureProperty(event.name)) {
              ngZone.run(() => {
                subscriber.next(undefined)
              })
            }
          },
        ),
      )

      listeners.push(
        data.addListener(
          'removeproperty',
          (event: google.maps.Data.RemovePropertyEvent) => {
            if (!isAppFeatureProperty(event.name)) {
              ngZone.run(() => {
                subscriber.next(undefined)
              })
            }
          },
        ),
      )
    })

    return () => {
      listeners.forEach(google.maps.event.removeListener)
    }
  })
}
