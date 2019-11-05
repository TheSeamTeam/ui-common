import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit, Optional } from '@angular/core'

import { ModalRef } from '../modal-ref'
import { getClosestModal } from '../modal-utils'
import { Modal } from '../modal.service'

@Directive({
  selector: 'button[seamModalClose]',
  exportAs: 'seamModalClose'
})
export class ModalCloseDirective implements OnInit {

  public modalRef: ModalRef<any> | undefined | null

  // @HostBinding('class.close') _closeCss = true

  @HostBinding('attr.type')
  get _attrType() { return this.type }

  @Input() type = 'button'

  @HostBinding('attr.aria-label')
  get _attrAriaLabel() { return this.ariaLabel || null }

  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string

  @Input() seamModalClose: any

  // NOTE: This will most likely be temporary.
  @Input() seamModalNext: any
  @Input() seamModalNextConfig: any

  @HostListener('click')
  _onClick() {
    if (this.modalRef) {
      if (this.seamModalNext) {
        this.modalRef.afterClosed().subscribe(() => {
          if (typeof this.seamModalNext === 'string') {
            this._modal.openFromLazyComponent(this.seamModalNext, this.seamModalNextConfig).subscribe()
          } else {
            this._modal.openFromComponent(this.seamModalNext, this.seamModalNextConfig)
          }
        })
      }
      this.modalRef.close(this.seamModalClose)
    }
  }

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _modal: Modal,
    @Optional() private _modalRef?: ModalRef<any>
  ) {
    this.modalRef = _modalRef
  }

  ngOnInit() {
    if (!this.modalRef) {
      // When this directive is included in a dialog via TemplateRef (rather than being
      // in a Component), the DialogRef isn't available via injection because embedded
      // views cannot be given a custom injector. Instead, we look up the DialogRef by
      // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
      // be resolved at constructor time.
      this.modalRef = getClosestModal(this._elementRef, this._modal.openDialogs)
    }
  }

}
