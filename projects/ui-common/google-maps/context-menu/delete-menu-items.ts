import { TheSeamMapGroupTarget } from '../feature-groups/feature-group'
import { TheSeamMapInteractionMode } from '../interaction/interaction-mode'

/** One entry in the map's feature context menu. */
export interface TheSeamMapContextMenuItem {
  label: string
  action: () => void
}

/**
 * What the menu needs from the map service to decide what to offer.
 *
 * Narrowed to the query/command pairs so the decision stays a pure function
 * and can be tested without a rendered map.
 */
export interface TheSeamMapDeleteMenuContext {
  mode: TheSeamMapInteractionMode
  editingEnabled: boolean
  /** The group the menu is opening for, or null when nothing is targeted. */
  target: TheSeamMapGroupTarget | null

  canDeleteFocusedFeature(): boolean
  canDeleteGroup(key: string): boolean
  canDeleteSelection(): boolean

  deleteFocusedFeature(): void
  deleteGroup(key: string): void
  deleteSelection(): void
}

/**
 * The delete items the feature context menu offers.
 *
 * A refused item is not rendered at all. The caller is expected to hide the
 * menu entirely for an empty list, so a consumer that refuses everything gets
 * no menu rather than an empty one.
 */
export function buildDeleteMenuItems(
  context: TheSeamMapDeleteMenuContext,
): TheSeamMapContextMenuItem[] {
  const items: TheSeamMapContextMenuItem[] = []

  if (!context.editingEnabled) {
    return items
  }

  if (context.mode !== 'grouped') {
    if (context.canDeleteSelection()) {
      items.push({ label: 'Delete', action: () => context.deleteSelection() })
    }
    return items
  }

  const target = context.target
  if (!target) {
    return items
  }
  const key = target.group.key

  // On a one-polygon field, "Delete Polygon" and "Delete Field" are the same
  // act — the first empties the group without saying so. Offer only the one
  // that names what happens.
  if (target.group.features.length <= 1) {
    if (context.canDeleteGroup(key)) {
      items.push({
        label: 'Delete Field',
        action: () => context.deleteGroup(key),
      })
    }
    return items
  }

  if (context.canDeleteFocusedFeature()) {
    items.push({
      label: 'Delete Polygon',
      action: () => context.deleteFocusedFeature(),
    })
  }
  if (context.canDeleteGroup(key)) {
    items.push({
      label: 'Delete Field',
      action: () => context.deleteGroup(key),
    })
  }
  return items
}
