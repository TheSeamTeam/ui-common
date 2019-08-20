import { ElementRef } from '@angular/core'
import { ModalRef } from './modal-ref'

/**
 * Finds the closest MatDialogRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a dialog.
 * @param openDialogs References to the currently-open dialogs.
 */
export function getClosestModal(element: ElementRef<HTMLElement>, openDialogs: ModalRef<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement

  while (parent && !parent.classList.contains('seam-modal-container')) {
    parent = parent.parentElement
  }

  const parentId = parent ? parent.id : null
  return parentId ? openDialogs.find(dialog => dialog.id === parentId) : null
}
