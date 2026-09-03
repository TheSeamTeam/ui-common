import {
  getHoveredStyleOptionsDefinedByFeature,
  getSelectedStyleOptionsDefinedByFeature,
  getStyleOptionsDefinedByFeature,
  isFeatureSelected,
} from '../google-maps-feature-helpers'

export const FEATURE_STYLE_OPTIONS_DEFAULT =
  (): google.maps.Data.StyleOptions => ({
    clickable: true,
    visible: true,
    draggable: false,
    editable: false,
    fillColor: 'teal',
    fillOpacity: 0.3,
    strokeColor: 'blue',
    strokeOpacity: 1,
    strokeWeight: 2,
  })

export const FEATURE_STYLE_OPTIONS_SELECTED =
  (): google.maps.Data.StyleOptions => ({
    fillColor: 'green',
    fillOpacity: 0.7,
    strokeColor: 'limegreen',
    strokeOpacity: 1,
    strokeWeight: 2,
  })

export const FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED =
  (): google.maps.Data.StyleOptions => ({
    strokeColor: 'black',
    strokeOpacity: 1,
    strokeWeight: 4,
  })

/**
 * Style options a feature may set through its GeoJSON properties.
 *
 * `editable`, `draggable`, and `clickable` are here so a feature can opt OUT —
 * a retired field stays unreshapeable while its neighbours do not. They cannot
 * opt in: the clamp in `computeFeatureStyle` runs last and only ever narrows.
 */
export const SUPPORTED_PROPERTY_STYLE_OPTIONS: (keyof google.maps.Data.StyleOptions)[] =
  [
    'fillColor',
    'fillOpacity',
    'strokeColor',
    'strokeOpacity',
    'strokeWeight',
    'label',
    'opacity',
    'icon',
    'clickable',
    'visible',
    'editable',
    'draggable',
  ]

/** What the interaction model and the global gate permit for a feature. */
export interface TheSeamMapFeatureStyleContext {
  /** The `editingEnabled` input. */
  editingEnabled: boolean
  /** Whether the model currently arms geometry editing at all. */
  geometryEditingArmed: boolean
  /** Whether the model lets this feature receive clicks. */
  clicksAllowed: boolean
}

/** Merge only the supported subset of one options object into another. */
export function mergeStyleOptions(
  target: google.maps.Data.StyleOptions,
  source: google.maps.Data.StyleOptions | undefined,
): google.maps.Data.StyleOptions {
  if (!source || Object.keys(source).length === 0) {
    return target
  }
  for (const option of SUPPORTED_PROPERTY_STYLE_OPTIONS) {
    if (Object.prototype.hasOwnProperty.call(source, option)) {
      target[option] = source[option] as any
    }
  }
  return target
}

/**
 * The style for a feature, in a fixed precedence order:
 *
 *   defaults
 *     -> properties.styleOptions
 *     -> selected defaults          (when selected)
 *     -> properties.styleOptionsSelected  (when selected)
 *     -> interaction clamp          (always last)
 *
 * The clamp is one-directional. A feature can only narrow what the context
 * permits, never widen it, so no property in an uploaded file can arm editing
 * when the mode says no.
 */
export function computeFeatureStyle(
  feature: google.maps.Data.Feature,
  context: TheSeamMapFeatureStyleContext,
): google.maps.Data.StyleOptions {
  const selected = isFeatureSelected(feature)
  const declared = selected
    ? (getSelectedStyleOptionsDefinedByFeature(feature) ??
      getStyleOptionsDefinedByFeature(feature))
    : getStyleOptionsDefinedByFeature(feature)

  const options = FEATURE_STYLE_OPTIONS_DEFAULT()
  mergeStyleOptions(options, getStyleOptionsDefinedByFeature(feature))

  if (selected) {
    mergeStyleOptions(options, FEATURE_STYLE_OPTIONS_SELECTED())
    mergeStyleOptions(options, getSelectedStyleOptionsDefinedByFeature(feature))
  }

  const wants = (option: 'editable' | 'draggable' | 'clickable') =>
    declared?.[option] !== false

  const geometryEditable =
    wants('editable') &&
    context.editingEnabled &&
    context.geometryEditingArmed &&
    selected

  options.editable = geometryEditable
  options.draggable =
    wants('draggable') &&
    context.editingEnabled &&
    context.geometryEditingArmed &&
    selected
  options.clickable = wants('clickable') && context.clicksAllowed

  return options
}

/** The hover override, merged with anything the feature declares for hover. */
export function computeFeatureHoverStyle(
  feature: google.maps.Data.Feature,
): google.maps.Data.StyleOptions {
  return mergeStyleOptions(
    FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED(),
    getHoveredStyleOptionsDefinedByFeature(feature),
  )
}
