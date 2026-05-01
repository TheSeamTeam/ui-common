import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { take } from 'rxjs/operators'

import {
  TheSeamAnchorButtonComponent,
  TheSeamButtonComponent,
} from '@theseam/ui-common/buttons'
import { Modal, ModalConfig } from '@theseam/ui-common/modal'

import { SignatureInputPanelResult } from './signature-input-panel.models'
import { TheSeamSignatureInputPanelComponent } from './signature-input-panel/signature-input-panel.component'

/**
 * Opens the signature input panel in a modal when the host button/anchor is
 * clicked, and writes the submitted data URL back through its bound form
 * control. Implements `ControlValueAccessor` so it works with any of the form
 * binding styles (`formControl`, `formControlName`, `ngModel`).
 *
 * Usage:
 *
 * ```html
 * <button seamButton theme="primary" seamSignatureInput formControlName="signature">
 *   Sign
 * </button>
 * ```
 *
 * The selector-name input accepts a partial `ModalConfig` for cases that need
 * to tweak the modal (e.g. `disableClose`):
 *
 * ```html
 * <button
 *   seamButton
 *   [seamSignatureInput]="{ disableClose: true }"
 *   formControlName="signature"
 * >Sign</button>
 * ```
 */
@Directive({
  selector: 'button[seamSignatureInput], a[seamSignatureInput]',
  exportAs: 'seamSignatureInput',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TheSeamSignatureInputButtonDirective,
      multi: true,
    },
  ],
})
export class TheSeamSignatureInputButtonDirective
  implements ControlValueAccessor
{
  private readonly _modal = inject(Modal)
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef)
  // When the same host element also carries `seamButton`/`a[seamButton]`,
  // delegate disabled state to its `disabled` input so its host binding remains
  // the single source of truth for the `disabled` attribute — avoids a
  // tug-of-war between this directive and the button directive's CD.
  private readonly _seamButton = inject(TheSeamButtonComponent, {
    optional: true,
    self: true,
  })
  private readonly _seamAnchor = inject(TheSeamAnchorButtonComponent, {
    optional: true,
    self: true,
  })

  /**
   * Partial `ModalConfig` passthrough. Most consumers leave this unset; the
   * signature panel's styles assume the default modal size.
   */

  @Input('seamSignatureInput') modalConfig: ModalConfig | null | undefined

  /** Emits the submitted data URL when the user applies a signature. */
  @Output() signed = new EventEmitter<string>()

  /** Emits when the user dismisses the panel without submitting. */
  @Output() canceled = new EventEmitter<void>()

  private _value: string | null = null
  private _disabled = false
  private _onChange: (value: string | null) => void = () => undefined
  private _onTouched: () => void = () => undefined

  writeValue(value: string | null): void {
    this._value = value
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled
    if (this._seamButton) {
      this._seamButton.disabled = isDisabled
    } else if (this._seamAnchor) {
      this._seamAnchor.disabled = isDisabled
    } else {
      const el = this._elementRef.nativeElement
      if (isDisabled) {
        el.setAttribute('disabled', '')
      } else {
        el.removeAttribute('disabled')
      }
    }
  }

  /** @ignore */
  @HostListener('click')
  _onClick(): void {
    if (this._disabled) {
      return
    }
    const ref = this._modal.openFromComponent<
      TheSeamSignatureInputPanelComponent,
      SignatureInputPanelResult
    >(TheSeamSignatureInputPanelComponent, this.modalConfig ?? undefined)

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        this._onTouched()
        if (result?.type === 'submit') {
          this._value = result.value
          this._onChange(result.value)
          this.signed.emit(result.value)
        } else {
          this.canceled.emit()
        }
      })
  }
}
