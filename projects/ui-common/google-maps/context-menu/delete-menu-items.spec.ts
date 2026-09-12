import { TheSeamMapGroupTarget } from '../feature-groups/feature-group'
import {
  buildDeleteMenuItems,
  TheSeamMapDeleteMenuContext,
} from './delete-menu-items'

function target(key: string, featureCount: number): TheSeamMapGroupTarget {
  const features = Array.from({ length: featureCount }, () => ({
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [] },
  }))
  return { group: { key, features }, feature: features[0] ?? null }
}

function context(
  overrides: Partial<TheSeamMapDeleteMenuContext> = {},
): TheSeamMapDeleteMenuContext {
  return {
    mode: 'grouped',
    editingEnabled: true,
    target: target('A', 2),
    canDeleteFocusedFeature: () => true,
    canDeleteGroup: () => true,
    canDeleteSelection: () => true,
    deleteFocusedFeature: () => undefined,
    deleteGroup: () => undefined,
    deleteSelection: () => undefined,
    ...overrides,
  }
}

describe('buildDeleteMenuItems', () => {
  it('offers nothing when editing is disabled', () => {
    expect(buildDeleteMenuItems(context({ editingEnabled: false }))).toEqual([])
  })

  it('offers both items for a multi-polygon group', () => {
    const items = buildDeleteMenuItems(context())
    expect(items.map((i) => i.label)).toEqual([
      'Delete Polygon',
      'Delete Field',
    ])
  })

  it('offers only Delete Field for a single-polygon group', () => {
    // The two would be the same act, and only one of them names it.
    const items = buildDeleteMenuItems(context({ target: target('B', 1) }))
    expect(items.map((i) => i.label)).toEqual(['Delete Field'])
  })

  it('hides Delete Polygon when the focused polygon may not be deleted', () => {
    const items = buildDeleteMenuItems(
      context({ canDeleteFocusedFeature: () => false }),
    )
    expect(items.map((i) => i.label)).toEqual(['Delete Field'])
  })

  it('hides Delete Field when the group may not be deleted', () => {
    const items = buildDeleteMenuItems(context({ canDeleteGroup: () => false }))
    expect(items.map((i) => i.label)).toEqual(['Delete Polygon'])
  })

  it('offers nothing when every delete is refused', () => {
    const items = buildDeleteMenuItems(
      context({
        canDeleteFocusedFeature: () => false,
        canDeleteGroup: () => false,
      }),
    )
    expect(items).toEqual([])
  })

  it('offers nothing in grouped mode with no target', () => {
    expect(buildDeleteMenuItems(context({ target: null }))).toEqual([])
  })

  it('offers a single Delete in legacy mode', () => {
    const items = buildDeleteMenuItems(context({ mode: 'legacy' }))
    expect(items.map((i) => i.label)).toEqual(['Delete'])
  })

  it('offers nothing in legacy mode when the selection may not be deleted', () => {
    const items = buildDeleteMenuItems(
      context({ mode: 'legacy', canDeleteSelection: () => false }),
    )
    expect(items).toEqual([])
  })

  it('wires each item to its own command', () => {
    const calls: string[] = []
    const items = buildDeleteMenuItems(
      context({
        deleteFocusedFeature: () => calls.push('focused'),
        deleteGroup: (key) => calls.push(`group:${key}`),
      }),
    )
    items.forEach((item) => item.action())
    expect(calls).toEqual(['focused', 'group:A'])
  })
})
