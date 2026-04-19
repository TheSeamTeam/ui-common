import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostBinding,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'
import {
  AngularSignaturePadModule,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import {
  SignatureInputItem,
  SignatureInputOptions,
} from '../signature-input-panel.models'
import { THESEAM_SIGNATURE_INPUT_CONTAINER } from '../signature-input-container.token'

const DEFAULT_OPTIONS: SignatureInputOptions = {
  canvasWidth: 500,
  canvasHeight: 150,
}

@Component({
  selector: 'seam-signature-input-pen',
  templateUrl: './signature-input-pen.component.html',
  styleUrls: ['./signature-input-pen.component.scss'],
  imports: [AngularSignaturePadModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TheSeamSignatureInputPenComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamSignatureInputPenComponent
  implements ControlValueAccessor, SignatureInputItem
{
  private readonly _container = inject(THESEAM_SIGNATURE_INPUT_CONTAINER, {
    optional: true,
  })
  private readonly _destroyRef = inject(DestroyRef)

  readonly options = input<SignatureInputOptions, SignatureInputOptions>(
    DEFAULT_OPTIONS,
    { transform: (value) => ({ ...DEFAULT_OPTIONS, ...value }) },
  )

  readonly beginDrawing = output<MouseEvent | Touch>()
  readonly endDrawing = output<MouseEvent | Touch>()

  // Optional (not required) because writeValue may be called before the view
  // is rendered — callers must null-check when reading.
  private readonly _signaturePad = viewChild<SignaturePadComponent>('sigPad')

  private readonly _value = signal<string | null>(null)
  private readonly _disabled = signal<boolean>(false)

  protected readonly _canvasWidth = computed(
    () => this.options().canvasWidth ?? DEFAULT_OPTIONS.canvasWidth,
  )
  protected readonly _canvasHeight = computed(
    () => this.options().canvasHeight ?? DEFAULT_OPTIONS.canvasHeight,
  )

  @HostBinding('style.width.px') get _styleWidth() {
    return this._canvasWidth()
  }
  @HostBinding('style.height.px') get _styleHeight() {
    return this._canvasHeight()
  }

  private _onChange: (value: string | null) => void = () => undefined
  private _onTouched: () => void = () => undefined

  constructor() {
    if (this._container) {
      this._container.registerInputItem('pen', this)
      this._destroyRef.onDestroy(() =>
        this._container?.unregisterInputItem('pen', this),
      )
    }

    // Restore any value written before the canvas was ready (the common case
    // when this component mounts via @switch with an existing form value).
    afterNextRender(() => this._applyValueToPad())
  }

  writeValue(value: string | null): void {
    this._value.set(value)
    this._applyValueToPad()
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled)
  }

  clear(): void {
    this._signaturePad()?.clear()
    this._setValue(null)
  }

  protected _drawStart(event: MouseEvent | Touch) {
    this.beginDrawing.emit(event)
  }

  protected _drawComplete(event: MouseEvent | Touch) {
    this._setValue(this._getDataURL())
    this.endDrawing.emit(event)
  }

  private _getDataURL(): string | null {
    const pad = this._signaturePad()
    if (!pad || pad.isEmpty()) {
      return null
    }
    return pad.toDataURL()
  }

  private _applyValueToPad(): void {
    const pad = this._signaturePad()
    if (!pad) {
      return
    }
    try {
      const value = this._value()
      if (value) {
        // fromDataURL is async and rejects on malformed input. Swallow errors
        // so a corrupted stored value can't crash the component — the form
        // control still retains the raw string.
        pad.fromDataURL(value).catch(() => undefined)
      } else {
        pad.clear()
      }
    } catch {
      // The SignaturePadComponent instance is available as soon as the view
      // query resolves, but its internal signature_pad isn't constructed
      // until ngAfterContentInit. writeValue can be called before that
      // (during form-control wire-up). afterNextRender re-invokes this once
      // the canvas is fully initialized.
    }
  }

  private _setValue(value: string | null): void {
    this._value.set(value)
    this._onChange(value)
    this._onTouched()
  }
}
