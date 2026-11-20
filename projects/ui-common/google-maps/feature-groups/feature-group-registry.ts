import {
  AppFeaturePropertyName,
  geoJsonFeatureFromDataFeature,
  isAppFeatureProperty,
} from '../google-maps-feature-helpers'
import { TheSeamMapFeatureGroup } from './feature-group'

declare const ngDevMode: boolean | undefined

export interface FeatureGroupRegistryOptions {
  /**
   * Name of the GeoJSON property that groups features. When unset, every
   * feature is its own group.
   */
  groupProperty?: string | null
  /** Generates the key written for a newly created group. */
  newGroupKeyFactory?: () => string
}

const isDevMode = () => typeof ngDevMode === 'undefined' || !!ngDevMode

/**
 * Resolves which group each feature on the data layer belongs to, and assigns
 * keys to features the map itself creates.
 *
 * Keys resolve from `properties[groupProperty]` when present, and otherwise
 * from an internal `__app__groupKey`, which is stripped from serialized output
 * and does not trigger value changes.
 */
export class FeatureGroupRegistry {
  private _assignedSeq = 0
  private _warnedAboutMissingGroupValues = false
  private _warnedAboutUnsupportedGeometry = false

  constructor(
    private readonly _data: google.maps.Data,
    private _options: FeatureGroupRegistryOptions = {},
  ) {}

  setOptions(options: FeatureGroupRegistryOptions): void {
    this._options = options
  }

  /**
   * The group key for a feature, assigning an internal one if it has neither a
   * group property value nor a previously assigned key.
   *
   * Assigning here mutates the feature, but only via an `__app__` property,
   * which neither serializes nor raises a value change.
   */
  keyOf(feature: google.maps.Data.Feature): string {
    const declared = this._declaredKey(feature)
    if (declared !== undefined) {
      return declared
    }

    const assigned = feature.getProperty(AppFeaturePropertyName.GroupKey)
    if (typeof assigned === 'string' && assigned.length > 0) {
      return assigned
    }

    this._warnAboutMissingGroupValue()
    const key = `__assigned__${this._assignedSeq++}`
    feature.setProperty(AppFeaturePropertyName.GroupKey, key)
    return key
  }

  /** Every feature on the data layer belonging to `key`. */
  featuresIn(key: string): google.maps.Data.Feature[] {
    const features: google.maps.Data.Feature[] = []
    this._data.forEach((feature) => {
      if (this.keyOf(feature) === key) {
        features.push(feature)
      }
    })
    return features
  }

  /** The group a feature belongs to, as emittable GeoJSON. */
  groupOf(
    feature: google.maps.Data.Feature,
  ): TheSeamMapFeatureGroup | undefined {
    return this.group(this.keyOf(feature))
  }

  /** The group for a key, or undefined when no feature carries it. */
  group(key: string): TheSeamMapFeatureGroup | undefined {
    return this.groupWithSources(key)?.group
  }

  /**
   * A group alongside the `Data.Feature` each emitted GeoJSON feature came
   * from, index-aligned.
   *
   * Callers that need to map a `Data.Feature` back to its emitted counterpart
   * must use this rather than indexing `group.features` against
   * `featuresIn(key)` — a feature with unsupported geometry is dropped from
   * the emitted list, which would shift every index after it.
   */
  groupWithSources(
    key: string,
  ):
    | { group: TheSeamMapFeatureGroup; sources: google.maps.Data.Feature[] }
    | undefined {
    const candidates = this.featuresIn(key)
    if (candidates.length === 0) {
      return undefined
    }

    const sources: google.maps.Data.Feature[] = []
    const features: TheSeamMapFeatureGroup['features'] = []
    for (const candidate of candidates) {
      const geoJson = geoJsonFeatureFromDataFeature(
        candidate,
        isAppFeatureProperty,
      )
      if (geoJson === undefined) {
        this._warnAboutUnsupportedGeometry()
        continue
      }
      sources.push(candidate)
      features.push(geoJson)
    }

    return { group: { key, features }, sources }
  }

  /** Every group currently on the data layer. */
  groups(): TheSeamMapFeatureGroup[] {
    const keys = new Set<string>()
    this._data.forEach((feature) => keys.add(this.keyOf(feature)))
    return [...keys]
      .map((key) => this.group(key))
      .filter((g): g is TheSeamMapFeatureGroup => g !== undefined)
  }

  /**
   * Start a new group on a feature the map created, writing a real group
   * property when one is configured so the grouping survives serialization.
   */
  assignNewKey(feature: google.maps.Data.Feature): string {
    const key = this._options.newGroupKeyFactory?.() ?? defaultGroupKey()
    if (isDevMode() && this.featuresIn(key).length > 0) {
      console.warn(
        `[seam-google-maps] newGroupKeyFactory produced the key "${key}", ` +
          `which is already in use. The drawn feature joins that group. ` +
          `The factory is responsible for producing unique keys.`,
      )
    }
    this.assignKey(feature, key)
    return key
  }

  /** Put a feature into an existing group. */
  assignKey(feature: google.maps.Data.Feature, key: string): void {
    const groupProperty = this._options.groupProperty
    if (groupProperty) {
      feature.setProperty(groupProperty, key)
      feature.removeProperty(AppFeaturePropertyName.GroupKey)
      return
    }
    feature.setProperty(AppFeaturePropertyName.GroupKey, key)
  }

  private _declaredKey(feature: google.maps.Data.Feature): string | undefined {
    const groupProperty = this._options.groupProperty
    if (!groupProperty) {
      return undefined
    }
    const value = feature.getProperty(groupProperty)
    if (value === null || value === undefined || value === '') {
      return undefined
    }
    return String(value)
  }

  private _warnAboutUnsupportedGeometry(): void {
    if (!isDevMode() || this._warnedAboutUnsupportedGeometry) {
      return
    }
    this._warnedAboutUnsupportedGeometry = true
    console.warn(
      `[seam-google-maps] a feature's geometry is neither Polygon nor ` +
        `MultiPolygon. It still renders, but is excluded from groups, ` +
        `outputs, and labels.`,
    )
  }

  private _warnAboutMissingGroupValue(): void {
    if (
      !isDevMode() ||
      !this._options.groupProperty ||
      this._warnedAboutMissingGroupValues
    ) {
      return
    }
    this._warnedAboutMissingGroupValues = true
    console.warn(
      `[seam-google-maps] featureGroupProperty is ` +
        `"${this._options.groupProperty}", but at least one feature has no ` +
        `value for it. Each becomes its own group under a session-scoped key ` +
        `that is not serialized. Assign the property during import.`,
    )
  }
}

function defaultGroupKey(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `group-${Date.now()}-${Math.random()}`
  )
}
