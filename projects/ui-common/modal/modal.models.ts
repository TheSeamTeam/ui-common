import { OverlayRef } from '@angular/cdk/overlay'
import { EventEmitter, InjectionToken } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'

export interface IModalContainer {

  /**
   * Modal will close if a key is pressed with any of these key codes.
   *
   * default: [ 27 ] // 27 = ESCAPE
   */
  closeOnKeyPressed: number[]

  /** Emits when the modal has closed. */
  modalClosed: EventEmitter<void>

  /** Reference to the cdk OverlayRef. */
  _overlayRef?: OverlayRef

  /** Makes the modal container a form with this formGroup. */
  form: UntypedFormGroup | undefined | null

  /** Emit the `(ngSubmit)` event. NOTE: Only if `form` is defined. */
  formSubmit: EventEmitter<void>

  /** Opens the modal. */
  open(): void

  /** Closes the modal. */
  close(): void

}

export const THESEAM_MODAL_CONTAINER = new InjectionToken<IModalContainer>('seamModalContainer')
