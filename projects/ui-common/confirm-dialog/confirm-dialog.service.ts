import { Injectable, TemplateRef } from '@angular/core'

import { Modal, ModalRef } from '@theseam/ui-common/modal'
import { ThemeTypes } from '@theseam/ui-common/models'

import { ConfirmDialogComponent } from './confirm-dialog.component'

@Injectable()
export class SeamConfirmDialogService {

  constructor(
    private modal: Modal
  ) { }

  public open(
    message?: string,
    alert?: string | { message: string, type: ThemeTypes },
    template?: TemplateRef<any> | { template: TemplateRef<any>, context: any }
  ): ModalRef<ConfirmDialogComponent, 'confirm' | undefined> {
    const modalRef = this.modal.openFromComponent(ConfirmDialogComponent)

    if (!modalRef.componentInstance) {
      throw new Error('ConfirmDialogComponent not created.')
    }

    const comp: ConfirmDialogComponent = modalRef.componentInstance

    if (message) {
      comp.message = message
    }

    if (alert) {
      if (typeof alert === 'string') {
        comp.alertMessage = alert
      } else if (alert.message && alert.type) {
        comp.alertMessage = alert.message
        comp.alertType = alert.type
      } else {
        throw new Error('Invalid alert argument.')
      }
    }

    if (template) {
      comp.template = template
    }

    return modalRef
  }

}
