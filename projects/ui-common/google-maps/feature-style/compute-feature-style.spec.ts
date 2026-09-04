import { setFeatureSelected } from '../google-maps-feature-helpers'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import {
  computeFeatureHoverStyle,
  computeFeatureStyle,
  TheSeamMapFeatureStyleContext,
} from './compute-feature-style'

const armed: TheSeamMapFeatureStyleContext = {
  editingEnabled: true,
  geometryEditingArmed: true,
  clicksAllowed: true,
}

function makeFeature(properties: Record<string, any> = {}) {
  return new google.maps.Data.Feature({ geometry: null, properties })
}

describe('computeFeatureStyle', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('is not editable or draggable when unselected', () => {
    const style = computeFeatureStyle(makeFeature(), armed)
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(false)
  })

  it('arms editing when selected and everything allows it', () => {
    const feature = makeFeature()
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(true)
    expect(style.draggable).toBe(true)
  })

  it('applies styleOptions from the feature', () => {
    const feature = makeFeature({ styleOptions: { fillColor: 'gray' } })
    expect(computeFeatureStyle(feature, armed).fillColor).toBe('gray')
  })

  it('keeps styleOptions when the feature is selected', () => {
    const feature = makeFeature({ styleOptions: { visible: false } })
    setFeatureSelected(feature, true)
    // Regression: the selected branch used to replace the options wholesale,
    // discarding the consumer's styleOptions merge entirely.
    expect(computeFeatureStyle(feature, armed).visible).toBe(false)
  })

  it('applies styleOptionsSelected, not styleOptionsHovered, when selected', () => {
    const feature = makeFeature({
      styleOptionsSelected: { fillColor: 'gold' },
      styleOptionsHovered: { fillColor: 'red' },
    })
    setFeatureSelected(feature, true)
    // Regression: the selected branch used to merge the hovered options.
    expect(computeFeatureStyle(feature, armed).fillColor).toBe('gold')
  })

  it('lets a feature opt out of editing while selected, and implies draggable: false too', () => {
    // A declared editable: false also clamps draggable: false — dragging the
    // whole polygon changes the map's value exactly as much as reshaping it
    // does, so a "locked" feature that could still be dragged would not
    // actually be locked. See the doc comment on computeFeatureStyle.
    const feature = makeFeature({ styleOptions: { editable: false } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(false)
  })

  it('lets a feature opt out of dragging alone, while staying editable', () => {
    // The implication is one-directional: draggable: false does NOT imply
    // editable: false, so a feature may opt out of dragging while remaining
    // reshapeable via its vertex handles.
    const feature = makeFeature({ styleOptions: { draggable: false } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(true)
    expect(style.draggable).toBe(false)
  })

  it('never lets a feature opt IN beyond what the context allows', () => {
    const feature = makeFeature({ styleOptions: { editable: true } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, {
      ...armed,
      editingEnabled: false,
    })
    expect(style.editable).toBe(false)
  })

  it('disarms editing when the model has not armed geometry editing', () => {
    const feature = makeFeature()
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, {
      ...armed,
      geometryEditingArmed: false,
    })
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(false)
  })

  it('lets the model force a feature to ignore clicks', () => {
    const feature = makeFeature({ styleOptions: { clickable: true } })
    const style = computeFeatureStyle(feature, {
      ...armed,
      clicksAllowed: false,
    })
    expect(style.clickable).toBe(false)
  })

  it('keeps an editable: false opt-out when styleOptionsSelected declares an unrelated key', () => {
    // Regression: the opt-out flags used to resolve styleOptionsSelected as a
    // whole object, falling back to styleOptions only when
    // styleOptionsSelected was entirely absent. That silently opted a
    // retired field back IN the moment it was selected, purely because it
    // also wanted a different selected fill colour — the clamp is meant to
    // be one-directional (opt out only), so this must not happen.
    const feature = makeFeature({
      styleOptions: { editable: false },
      styleOptionsSelected: { fillColor: 'gray' },
    })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(false)
    expect(style.fillColor).toBe('gray')
  })

  it('lets styleOptionsSelected opt out on its own, for a key it does declare', () => {
    const feature = makeFeature({ styleOptionsSelected: { editable: false } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(false)
  })
})

describe('computeFeatureHoverStyle', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('never carries editable or draggable, even when styleOptionsHovered declares them', () => {
    // Regression: mergeStyleOptions is shared with computeFeatureStyle, and
    // SUPPORTED_PROPERTY_STYLE_OPTIONS includes editable/draggable so a
    // feature can opt OUT via styleOptions. computeFeatureHoverStyle's result
    // is applied via overrideStyle with no clamp downstream at all, unlike
    // computeFeatureStyle's interaction clamp — so a consumer opting IN via
    // styleOptionsHovered would apply completely unclamped. A hover override
    // must never be able to touch either flag.
    const feature = makeFeature({
      styleOptionsHovered: { editable: true, draggable: true },
    })
    const style = computeFeatureHoverStyle(feature)
    expect(style.editable).toBeUndefined()
    expect(style.draggable).toBeUndefined()
  })

  it('still applies other styleOptionsHovered properties', () => {
    const feature = makeFeature({
      styleOptionsHovered: { strokeColor: 'purple' },
    })
    expect(computeFeatureHoverStyle(feature).strokeColor).toBe('purple')
  })
})
