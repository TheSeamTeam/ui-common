import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import { Directive, ElementRef, Input, OnInit, Optional } from '@angular/core'

import { getClosestModal, Modal, ModalRef } from '@theseam/ui-common/modal'

@Directive({
    selector: '[seamAutoFocus]',
    exportAs: 'seamAutoFocus'
})
export class AutoFocusDirective implements OnInit {
  static ngAcceptInputType_seamAutoFocus: BooleanInput

  private _focus = true

  public modalRef: ModalRef<any> | undefined | null

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _modal: Modal,
    @Optional() private _modalRef: ModalRef<any>
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

    if (!this.modalRef) {
      if (this._focus) {
        setTimeout(() => { this.focus() })
      }
    } else {
      this.modalRef.afterOpened().subscribe(() => {
        setTimeout(() => { this.focus() })
      })
    }
  }

  @Input()
  set seamAutoFocus(condition: boolean) {
    this._focus = coerceBooleanProperty(condition) !== false
  }

  public focus() {
    this._elementRef.nativeElement.focus()
  }
}
