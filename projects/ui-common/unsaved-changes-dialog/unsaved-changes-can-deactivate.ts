import { Directive, HostListener, isDevMode } from '@angular/core'

@Directive()
export abstract class UnsavedChangesCanDeactivate {

  abstract unsavedChangesCanDeactivate(): boolean

    @HostListener('window:beforeunload', ['$event'])
    __unloadNotification($event: any) {
      if (isDevMode()) {
        if (!this.unsavedChangesCanDeactivate) {
          // eslint-disable-next-line no-console
          console.warn('Route Component with [UnsavedChangesDialogGuard] guard must extend [UnsavedChangesCanDeactivate] class.')
        }

        const w = window as any
        // Avoid redirect prevention in Storybook
        if (w && w.__STORYBOOK_CLIENT_API__) {
          return true
        }
      }

      if (!this.unsavedChangesCanDeactivate()) {
        // $event.returnValue = true
        $event.returnValue = 'You have unsaved changes! If you leave, your changes will be lost.'
      }
    }

}
