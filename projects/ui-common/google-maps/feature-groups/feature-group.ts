import { Feature, MultiPolygon, Polygon } from 'geojson'

/** A set of features that belong to the same logical thing, such as one field. */
export interface TheSeamMapFeatureGroup {
  /**
   * `properties[featureGroupProperty]`.
   *
   * Falls back to a map-assigned key for features that carry no group value —
   * always the case when no group property is configured, and for imported
   * features the consumer did not assign one to. An assigned key is
   * session-scoped: it does not survive an external value write, so it must not
   * be persisted or held across a write and passed back to `selectGroup()`.
   */
  key: string
  features: Feature<Polygon | MultiPolygon>[]
}

/** A group, plus the individual feature an interaction landed on. */
export interface TheSeamMapGroupTarget {
  group: TheSeamMapFeatureGroup
  /**
   * The polygon the interaction landed on. For a selection this is the one
   * `Delete` acts on; for a hover, the one under the cursor.
   *
   * A reference into `group.features`, not a copy.
   */
  feature: Feature<Polygon | MultiPolygon> | null
}
