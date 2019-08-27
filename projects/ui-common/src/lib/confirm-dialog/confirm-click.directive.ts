import { Directive, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output } from '@angular/core'

import { ThemeTypes } from '../models/index'
import { ModalRef } from './../modal/modal-ref'

import { ConfirmDialogComponent } from './confirm-dialog.component'
import { SeamConfirmDialogService } from './confirm-dialog.service'

@Directive({
  selector: '[seamConfirmClick]',
  exportAs: 'seamConfirmClick'
})
export class ConfirmClickDirective implements OnDestroy {

  private _modalRef: ModalRef<ConfirmDialogComponent, 'confirm' | undefined> | undefined

  @Input() libConfirmMsg: string
  @Input() libConfirmAlert: string | { message: string, type: ThemeTypes }
  @Input() libConfirmDisabled = false

  @Output() seamConfirmClick = new EventEmitter<'confirm'>()

  @HostBinding('class.lib-confirm-click-active')
  get _confirmClickActiveCss() { return !!this._modalRef }

  @HostListener('click', [ '$event' ])
  _onClick(event: any) {
    if (this.libConfirmDisabled) {
      if (!!this._modalRef) {
        this._modalRef.close()
        this._modalRef = undefined
      }
    }

    if (!!this._modalRef) { return }

    this._modalRef = this._confirmService.open(this.libConfirmMsg, this.libConfirmAlert)

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
