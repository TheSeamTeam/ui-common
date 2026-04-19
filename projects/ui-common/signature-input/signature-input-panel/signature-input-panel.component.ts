import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  inject,
  isDevMode,
  output,
  signal,
} from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { combineLatest, map, switchMap } from 'rxjs'

import {
  faKeyboard,
  faSignature,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLayoutService } from '@theseam/ui-common/layout'
import { ModalRef } from '@theseam/ui-common/modal'
import { TheSeamAutoFocusDirective } from '@theseam/ui-common/shared'
import {
  observeControlValid,
  observeControlValue,
} from '@theseam/ui-common/utils'

import {
  SignatureInputContainer,
  SignatureInputItem,
  SignatureInputPanelResult,
  SignatureInputResetType,
  SignatureInputType,
} from '../signature-input-panel.models'
import { THESEAM_SIGNATURE_INPUT_CONTAINER } from '../signature-input-container.token'
import { TheSeamSignatureInputImgComponent } from '../signature-input-img/signature-input-img.component'
import { TheSeamSignatureInputPenComponent } from '../signature-input-pen/signature-input-pen.component'
import { TheSeamSignatureInputTextComponent } from '../signature-input-text/signature-input-text.component'

interface SignatureInputPanelForm {
  pen: FormControl<string | null>
  text: FormControl<string | null>
  img: FormControl<string | null>
}

const isValueEmpty = (value: unknown): boolean =>
  typeof value !== 'string' || value.trim().length === 0

@Component({
  selector: 'seam-signature-input-panel',
  templateUrl: './signature-input-panel.component.html',
  styleUrls: ['./signature-input-panel.component.scss'],
  imports: [
    A11yModule,
    ReactiveFormsModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    TheSeamAutoFocusDirective,
    TheSeamSignatureInputPenComponent,
    TheSeamSignatureInputTextComponent,
    TheSeamSignatureInputImgComponent,
  ],
  providers: [
    {
      provide: THESEAM_SIGNATURE_INPUT_CONTAINER,
      useExisting: TheSeamSignatureInputPanelComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    /**
     * Allow focusing the host element via `focus()` without it being part of the
     * tab order (the inner inputs handle keyboard navigation).
     */
    '[attr.tabIndex]': '-1',
  },
})
export class TheSeamSignatureInputPanelComponent
  implements SignatureInputContainer
{
  private readonly _layout = inject(TheSeamLayoutService)
  private readonly _modalRef = inject<ModalRef<SignatureInputPanelResult>>(
    ModalRef,
    { optional: true },
  )

  /** Emitted when the panel is submitted or canceled. */
  readonly result = output<SignatureInputPanelResult>()

  protected readonly _faSignature = faSignature
  protected readonly _faUpload = faUpload
  protected readonly _faKeyboard = faKeyboard

  protected readonly _activeType = signal<SignatureInputType>('pen')
  protected readonly _resetType = computed<SignatureInputResetType>(() =>
    this._activeType() === 'img' ? 'delete' : 'cancel',
  )

  readonly _form = new FormGroup<SignatureInputPanelForm>({
    pen: new FormControl<string | null>(null),
    text: new FormControl<string | null>(null),
    img: new FormControl<string | null>(null),
  })

  private readonly _registeredInputItems = new Map<string, SignatureInputItem>()

  // Observables are used here because the active control changes, which makes
  // a pure-signal approach awkward (signals don't naturally switch between
  // observable sources). We derive the active control, its value, and its
  // validity via rxjs, then expose the results as signals for the template.
  private readonly _activeControl$ = toObservable(this._activeType).pipe(
    map((type) => this._form.controls[type]),
  )

  private readonly _activeValue$ = this._activeControl$.pipe(
    switchMap((control) => observeControlValue<string | null>(control)),
    map((value) => (isValueEmpty(value) ? null : (value as string))),
  )

  private readonly _canSubmit$ = combineLatest([
    this._activeControl$.pipe(switchMap((c) => observeControlValid(c))),
    this._activeValue$,
  ]).pipe(map(([valid, value]) => valid && value !== null))

  protected readonly _value = toSignal(this._activeValue$, {
    initialValue: null,
  })
  protected readonly _valueEmpty = computed(() => this._value() === null)
  protected readonly _canSubmit = toSignal(this._canSubmit$, {
    initialValue: false,
  })

  protected readonly _isSm = toSignal(this._layout.observe('sm'), {
    initialValue: false,
  })

  showType(type: SignatureInputType) {
    this._activeType.set(type)
  }

  registerInputItem(type: string, item: SignatureInputItem): boolean {
    if (this._registeredInputItems.has(type)) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn(
          `[TheSeamSignatureInputPanelComponent] Input item '${type}' is already registered.`,
        )
      }
      return false
    }
    this._registeredInputItems.set(type, item)
    return true
  }

  unregisterInputItem(type: string, item: SignatureInputItem): boolean {
    const registered = this._registeredInputItems.get(type)
    if (!registered) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn(
          `[TheSeamSignatureInputPanelComponent] Input item '${type}' can't be unregistered.`,
        )
      }
      return false
    }
    if (isDevMode() && registered !== item) {
      // eslint-disable-next-line no-console
      console.warn(
        `[TheSeamSignatureInputPanelComponent] Registered item for type '${type}' doesn't match the item being unregistered.`,
      )
    }
    this._registeredInputItems.delete(type)
    return true
  }

  reset() {
    this._form.reset({ pen: null, text: null, img: null })
  }

  protected _onClearBtnClick(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    this._registeredInputItems.get(this._activeType())?.clear()
  }

  protected _onCancelBtnClick(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    this.reset()
    this._emit({ type: 'cancel' })
  }

  protected _onSubmitBtnClick(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    if (!this._canSubmit()) {
      return
    }
    const value = this._value()
    if (value === null) {
      return
    }
    this._emit({ type: 'submit', value })
  }

  private _emit(result: SignatureInputPanelResult) {
    this.result.emit(result)
    this._modalRef?.close(result)
  }
}
