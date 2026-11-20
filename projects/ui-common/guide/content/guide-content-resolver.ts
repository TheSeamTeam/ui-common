import {
  TheSeamGuideContent,
  TheSeamGuideContentData,
  TheSeamGuideContentSpec,
  TheSeamGuideResolvedSlot,
} from '../models/guide-content'

/** The three layers for one popover slot. */
export interface TheSeamGuideContentLayers {
  provider?: TheSeamGuideContent | null
  session?: TheSeamGuideContent | null
  step?: TheSeamGuideContent | null
}

/** A bare string is sugar for `{ text }`. */
function normalize(
  value: TheSeamGuideContent | null | undefined,
): TheSeamGuideContentSpec | null | undefined {
  if (value === undefined || value === null) {
    return value
  }
  return typeof value === 'string' ? { text: value } : value
}

/**
 * Resolves one popover slot from its three layers. `null` means the slot is
 * absent and nothing is rendered for it.
 *
 * Presence and content are decided separately: only the step and session
 * layers can make a slot present, but once it is, all three layers contribute
 * the renderer, the text, and the data. That is what lets a step say
 * `title: 'Step One'` and still get the application's title component.
 */
export function resolveGuideContentSlot(
  layers: TheSeamGuideContentLayers,
): TheSeamGuideResolvedSlot | null {
  const presence = layers.step !== undefined ? layers.step : layers.session
  if (presence === undefined || presence === null) {
    return null
  }

  const provider = normalize(layers.provider)
  const session = normalize(layers.session)
  const step = normalize(layers.step)

  const nearestFirst = [step, session, provider]
  const outermostFirst = [provider, session, step]

  // One search for the renderer, not one per kind: the nearest layer naming
  // either wins outright, so a step's template beats a session's component.
  const renderer = nearestFirst.find(
    (layer) => layer?.template != null || layer?.component != null,
  )
  const text = nearestFirst.find((layer) => layer?.text !== undefined)?.text

  const data: TheSeamGuideContentData = {}
  for (const layer of outermostFirst) {
    if (layer?.data !== undefined) {
      Object.assign(data, layer.data)
    }
  }

  if (renderer?.template != null) {
    return { kind: 'template', template: renderer.template, text, data }
  }
  if (renderer?.component != null) {
    return { kind: 'component', component: renderer.component, text, data }
  }
  return text === undefined ? null : { kind: 'text', text }
}
