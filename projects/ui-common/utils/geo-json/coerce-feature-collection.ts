import { FeatureCollection } from 'geojson'

// TODO: Make this more thorough and maybe error on unrecognized.
export function coerceFeatureCollection(value: any): FeatureCollection | null {
  return parseValue(value)
}

/**
 * Parses the value to a FeatureCollection object or null if it is not a
 * FeatureCollection.
 */
function parseValue(value: any): FeatureCollection | null {
  const _value = parseStringValue(value)
  if (isFeatureCollectionValue(_value)) {
    return _value
  }
  return null
}

/**
 * Tries to parse the value to an object, in case the value is a stringified
 * json.
 */
function parseStringValue(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return value
}

/**
 * Checks if the value is a FeatureCollection.
 *
 * NOTE: This is not a thorough FeatureCollection check. It only checks that the
 * value is an object resembling a GeoJSON.FeatureCollection, enough for the
 * validator.
 */
function isFeatureCollectionValue(value: any): value is FeatureCollection {
  if (value === undefined || value === null) {
    return false
  }
  return value.type === 'FeatureCollection' && Array.isArray(value.features)
}
