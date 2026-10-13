import { InjectionToken } from '@angular/core'

/**
 * The part of the toggle group that an option needs in order to resolve its own
 * selected state.
 *
 * This exists as a separate token so `ToggleGroupOptionDirective` can reach its
 * parent group without importing `ToggleGroupDirective`, which would create a
 * circular import between the two directives.
 */
export interface TheSeamToggleGroupParent {
  isSelected(value: string | undefined | null): boolean
}

export const THESEAM_TOGGLE_GROUP_PARENT =
  new InjectionToken<TheSeamToggleGroupParent>('TheSeamToggleGroupParent')
