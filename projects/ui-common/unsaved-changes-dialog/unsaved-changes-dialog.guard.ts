import { isDevMode } from '@angular/core'
import { CanDeactivateFn } from '@angular/router'

import { UnsavedChangesCanDeactivate } from './unsaved-changes-can-deactivate'

export const UnsavedChangesDialogGuard: CanDeactivateFn<
  UnsavedChangesCanDeactivate
> = (component, currentRoute, currentState, nextState) => {
  if (isDevMode()) {
    if (!component.unsavedChangesCanDeactivate) {
      console.warn(
        'Route Component with `UnsavedChangesDialogGuard` guard must extend `UnsavedChangesCanDeactivate` class.',
      )
    }
  }

  const w = window as any
  // Avoid redirect prevention in Storybook
  if (w && w.__STORYBOOK_CLIENT_API__) {
    return true
  }

  if (!component.unsavedChangesCanDeactivate()) {
    return confirm(
      'You have unsaved changes! If you leave, your changes will be lost.',
    )
  }

  return true
}
