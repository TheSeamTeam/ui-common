import { BooleanInput } from '@angular/cdk/coercion'
import { Directive, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output, TemplateRef } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'
import { ModalRef } from '@theseam/ui-common/modal'
import { ThemeTypes } from '@theseam/ui-common/models'

import { ConfirmDialogComponent } from './confirm-dialog.component'
import { SeamConfirmDialogService } from './confirm-dialog.service'

@Directive({
  selector: '[seamConfirmClick]',
  exportAs: 'seamConfirmClick'
})
export class ConfirmClickDirective implements OnDestroy {
  static ngAcceptInputType_seamConfirmDisabled: BooleanInput

  private _modalRef: ModalRef<ConfirmDialogComponent, 'confirm' | undefined> | undefined

  @Input() seamConfirmMsg: string | undefined | null
  @Input() seamConfirmAlert: string | { message: string, type: ThemeTypes } | undefined | null
  @Input() seamConfirmTpl: TemplateRef<any> | { template: TemplateRef<any>, context: any } | undefined | null
  @Input() @InputBoolean() seamConfirmDisabled = false

  @Output() seamConfirmClick = new EventEmitter<'confirm'>()

  @HostBinding('class.lib-confirm-click-active')
  get _confirmClickActiveCss() { return !!this._modalRef }

  @HostListener('click', [ '$event' ])
  _onClick(event: any) {
    if (this.seamConfirmDisabled) {
      if (this._modalRef) {
        this._modalRef.close()
        this._modalRef = undefined
      }
    }

    if (this._modalRef) { return }

    this._modalRef = this._confirmService.open(this.seamConfirmMsg || '', this.seamConfirmAlert || undefined, this.seamConfirmTpl || undefined)

    this._modalRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.seamConfirmClick.emit(result)
      }

      this._modalRef = undefined
    })
  }

  constructor(private _confirmService: SeamConfirmDialogService) { }

  ngOnDestroy() {
    if (this._modalRef) {
      this._modalRef.close()
    }
  }

  get modalRef() { return this._modalRef }

  public close() {
    if (this._modalRef) {
      this._modalRef.close()
    }
  }

}
