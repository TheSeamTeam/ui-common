import { setFeatureSelected } from '../google-maps-feature-helpers'
import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import {
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

  it('lets a feature opt out of editing while selected', () => {
    const feature = makeFeature({ styleOptions: { editable: false } })
    setFeatureSelected(feature, true)
    const style = computeFeatureStyle(feature, armed)
    expect(style.editable).toBe(false)
    expect(style.draggable).toBe(true)
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
})
