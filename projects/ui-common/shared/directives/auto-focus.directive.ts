import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core'

import { getClosestModal, Modal, ModalRef } from '@theseam/ui-common/modal'

/**
 * Directive that will focus the element when initialized.
 *
 * If the element is inside a modal, it will wait until the modal is opened before focusing.
 *
 * If the element will be initialized multiple times or while a form is being filled out
 * don't use this directive.
 *
 * Usage:
 * ```html
 * <input type="text" seamAutoFocus />
 * ```
 */
@Directive({
  selector: '[seamAutoFocus]',
  exportAs: 'seamAutoFocus',
})
export class TheSeamAutoFocusDirective implements OnInit {
  static ngAcceptInputType_seamAutoFocus: BooleanInput

  private readonly _elementRef = inject(ElementRef<HTMLElement>)
  private readonly _modal = inject(Modal, { optional: true })
  private readonly _modalRef = inject(ModalRef, { optional: true })

  private _focus = true

  public modalRef: ModalRef<any> | undefined | null = this._modalRef

  @Input()
  set seamAutoFocus(condition: boolean) {
    this._focus = coerceBooleanProperty(condition) !== false
  }

  ngOnInit() {
    if (!this.modalRef && this._modal) {
      // When this directive is included in a dialog via TemplateRef (rather than being
      // in a Component), the DialogRef isn't available via injection because embedded
      // views cannot be given a custom injector. Instead, we look up the DialogRef by
      // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
      // be resolved at constructor time.
      this.modalRef = getClosestModal(this._elementRef, this._modal.openDialogs)
    }

    if (!this.modalRef) {
      if (this._focus) {
        setTimeout(() => {
          this.focus()
        })
      }
    } else {
      this.modalRef.afterOpened().subscribe(() => {
        setTimeout(() => {
          this.focus()
        })
      })
    }
  }

  public focus() {
    this._elementRef.nativeElement.focus()
  }
}
