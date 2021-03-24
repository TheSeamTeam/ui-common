import { Injectable, isDevMode } from '@angular/core'
import { CanDeactivate } from '@angular/router'

import { UnsavedChangesCanDeactivate } from './unsaved-changes-can-deactivate'

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesDialogGuard implements CanDeactivate<UnsavedChangesCanDeactivate> {

  /**
   * NOTE: Must be synchronous for now to allow `window:beforeunload` event support.
   */
  canDeactivate(component: UnsavedChangesCanDeactivate): boolean {
    if (isDevMode()) {
      if (!component.unsavedChangesCanDeactivate) {
        console.warn('Route Component with [UnsavedChangesDialogGuard] guard must extend [UnsavedChangesCanDeactivate] class.')
      }

      const w = window as any
      // Avoid redirect prevention in Storybook
      if (w && w.__STORYBOOK_CLIENT_API__) {
        return true
      }
    }

    if (!component.unsavedChangesCanDeactivate()) {
      if (confirm('You have unsaved changes! If you leave, your changes will be lost.')) {
        return true
      } else {
        return false
      }
    }
    return true
  }

}
