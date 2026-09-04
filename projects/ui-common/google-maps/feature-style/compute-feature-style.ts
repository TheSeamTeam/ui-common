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
 * That chain governs the *visual* options (colours, etc.) only. The opt-out
 * flags (`editable`/`draggable`/`clickable`) resolve separately, per key: a
 * selected feature consults `styleOptionsSelected` first and falls back to
 * `styleOptions` only for a key `styleOptionsSelected` doesn't itself
 * mention — never a whole-object fallback. Otherwise a feature that declares
 * `styleOptionsSelected` for an unrelated reason, such as a different
 * selected fill colour, would silently lose an unrelated `editable: false`
 * from `styleOptions` the moment it's selected.
 *
 * The clamp is one-directional. A feature can only narrow what the context
 * permits, never widen it, so no property in an uploaded file can arm editing
 * when the mode says no.
 *
 * A declared `editable: false` also implies `draggable: false`: moving a
 * polygon changes the map's value exactly as much as reshaping it does, so a
 * feature that opts out of one opts out of the other. This implication runs
 * only one way — `draggable: false` alone does not imply `editable: false`, so
 * a feature may still opt out of dragging while remaining reshapeable via its
 * vertex handles. Resolved through the same per-key `wants()` lookup as
 * `editable` itself, so a feature that locks `editable: false` in
 * `styleOptions` cannot be dragged even if `styleOptionsSelected` declares
 * `draggable` for an unrelated reason (or not at all).
 */
export function computeFeatureStyle(
  feature: google.maps.Data.Feature,
  context: TheSeamMapFeatureStyleContext,
): google.maps.Data.StyleOptions {
  const selected = isFeatureSelected(feature)
  const baseDeclared = getStyleOptionsDefinedByFeature(feature)
  const selectedDeclared = selected
    ? getSelectedStyleOptionsDefinedByFeature(feature)
    : undefined

  const options = FEATURE_STYLE_OPTIONS_DEFAULT()
  mergeStyleOptions(options, getStyleOptionsDefinedByFeature(feature))

  if (selected) {
    mergeStyleOptions(options, FEATURE_STYLE_OPTIONS_SELECTED())
    mergeStyleOptions(options, getSelectedStyleOptionsDefinedByFeature(feature))
  }

  // Resolved per key, not per object. A feature that opts out in
  // `styleOptions` must stay opted out even when it also declares a
  // `styleOptionsSelected` for unrelated reasons such as colour — otherwise
  // the clamp stops being one-directional and a retired field becomes
  // editable the moment it is selected.
  const wants = (option: 'editable' | 'draggable' | 'clickable') =>
    (selectedDeclared?.[option] ?? baseDeclared?.[option]) !== false

  const editingArmed =
    context.editingEnabled && context.geometryEditingArmed && selected
  const wantsEditable = wants('editable')

  options.editable = wantsEditable && editingArmed
  // editable: false implies draggable: false (see the doc comment above) —
  // the reverse does not hold, so wants('draggable') is still consulted on
  // its own for a feature that opts out of dragging alone.
  options.draggable = wants('draggable') && wantsEditable && editingArmed
  options.clickable = wants('clickable') && context.clicksAllowed

  return options
}

/**
 * The hover override, merged with anything the feature declares for hover.
 *
 * `mergeStyleOptions` is shared with `computeFeatureStyle`, and
 * `SUPPORTED_PROPERTY_STYLE_OPTIONS` includes `editable`/`draggable` so a
 * feature can opt OUT of them via `styleOptions`/`styleOptionsSelected`. But
 * this override is applied via `overrideStyle`, with no clamp downstream at
 * all — unlike `computeFeatureStyle`, where the interaction clamp runs last
 * and narrows whatever came before it. So if a consumer's
 * `styleOptionsHovered` declared `editable` or `draggable`, it would apply
 * unclamped: the one path where the "clamp is one-directional and always
 * runs last" guarantee would not hold. A hover override has no business
 * touching either, so both are stripped unconditionally, regardless of what
 * `styleOptionsHovered` declares.
 */
export function computeFeatureHoverStyle(
  feature: google.maps.Data.Feature,
): google.maps.Data.StyleOptions {
  const options = mergeStyleOptions(
    FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED(),
    getHoveredStyleOptionsDefinedByFeature(feature),
  )
  delete options.editable
  delete options.draggable
  return options
}
