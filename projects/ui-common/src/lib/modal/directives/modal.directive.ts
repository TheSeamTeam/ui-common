import { Directive, TemplateRef } from '@angular/core'

import { ModalRef } from '../modal-ref'
import { Modal } from '../modal.service'

@Directive({
  selector: '[seamModal]',
  exportAs: 'seamModal'
})
export class ModalDirective {

  constructor(
    public template: TemplateRef<HTMLElement>,
    public modal: Modal
  ) { }

  open(): void {
    console.log('[ModalDirective] open')
    const ref = this.modal.openFromTemplate(this.template)
    ref.backdropClick().subscribe(e => console.log('backdropClick', e))
  }

}
