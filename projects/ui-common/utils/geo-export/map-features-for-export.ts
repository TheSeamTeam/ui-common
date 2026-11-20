import type { Feature, FeatureCollection, GeoJsonProperties } from 'geojson'

/**
 * Returns a new collection with each feature's properties replaced by the
 * result of `mapFn`. Features for which `mapFn` returns `null` are left out.
 * Geometry is shared by reference; the input is not modified. `index` is the
 * feature's position in the input collection.
 */
export function mapFeaturesForExport(
  collection: FeatureCollection,
  mapFn: (feature: Feature, index: number) => GeoJsonProperties | null,
): FeatureCollection {
  const features: Feature[] = []
  collection.features.forEach((feature, index) => {
    const properties = mapFn(feature, index)
    if (properties !== null) {
      features.push({ ...feature, properties })
    }
  })
  return { ...collection, features }
}
