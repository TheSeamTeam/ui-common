import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms'
import { debounceTime } from 'rxjs/operators'

import { TheSeamFontLoaderService } from '@theseam/ui-common/services'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import {
  TheSeamAutoFocusDirective,
  TheSeamDisableControlDirective,
} from '@theseam/ui-common/shared'

import { SignatureInputItem } from '../signature-input-panel.models'
import { THESEAM_SIGNATURE_INPUT_CONTAINER } from '../signature-input-container.token'

export type SignatureFontState = 'loading' | 'inactive' | 'active'

const SIGNATURE_FONT_FAMILY = 'Homemade Apple'
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 127

@Component({
  selector: 'seam-signature-input-text',
  templateUrl: './signature-input-text.component.html',
  styleUrls: ['./signature-input-text.component.scss'],
  imports: [
    ReactiveFormsModule,
    TheSeamFormFieldModule,
    TheSeamAutoFocusDirective,
    TheSeamDisableControlDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TheSeamSignatureInputTextComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamSignatureInputTextComponent
  implements ControlValueAccessor, SignatureInputItem, AfterViewInit
{
  private readonly _fontLoader = inject(TheSeamFontLoaderService)
  private readonly _container = inject(THESEAM_SIGNATURE_INPUT_CONTAINER, {
    optional: true,
  })
  private readonly _destroyRef = inject(DestroyRef)

  // Optional (not required) because writeValue may be called before the
  // canvas is in the DOM — callers must null-check when reading.
  private readonly _typeCanvas =
    viewChild<ElementRef<HTMLCanvasElement>>('typeCanvas')

  readonly _nameControl = new FormControl<string | null>(null)

  private readonly _fontState = signal<SignatureFontState>('loading')
  protected readonly _fontLoading = computed(
    () => this._fontState() === 'loading',
  )
  protected readonly _fontInactive = computed(
    () => this._fontState() === 'inactive',
  )
  protected readonly _fontNotActive = computed(
    () => this._fontState() !== 'active',
  )

  private readonly _disabled = signal<boolean>(false)
  protected readonly _disabledOrFontNotActive = computed(
    () => this._disabled() || this._fontNotActive(),
  )

  protected readonly _canvasWidth = CANVAS_WIDTH
  protected readonly _canvasHeight = CANVAS_HEIGHT

  /** Current form value (rendered bitmap data URL). */
  private _value: string | null = null
  /**
   * When the user last typed a name (if any) on this instance. `null` means
   * there is no user-typed signature on this instance — the canvas should
   * keep whatever image was restored from `_value`.
   */
  private _renderedText: string | null = null

  private _onChange: (value: string | null) => void = () => undefined
  private _onTouched: () => void = () => undefined

  constructor() {
    if (this._container) {
      this._container.registerInputItem('text', this)
      this._destroyRef.onDestroy(() =>
        this._container?.unregisterInputItem('text', this),
      )
    }

    this._fontLoader
      .load({ google: { families: [SIGNATURE_FONT_FAMILY] } })
      .pipe(takeUntilDestroyed())
      .subscribe((e) => {
        if (
          e.type === 'loading' ||
          e.type === 'inactive' ||
          e.type === 'active'
        ) {
          this._fontState.set(e.type)
        }
      })

    // Debounced redraw of the user-typed name.
    this._nameControl.valueChanges
      .pipe(debounceTime(100), takeUntilDestroyed())
      .subscribe(() => this._drawTextToCanvas())

    // When the font flips to active and a name has been typed on this
    // instance, redraw the text so the now-loaded font replaces the fallback.
    // We do NOT touch the canvas otherwise — if there's a restored image but
    // no typed name, this effect must leave the image alone.
    effect(() => {
      if (this._fontState() === 'active' && this._renderedText) {
        this._drawTextToCanvas()
      }
    })
  }

  ngAfterViewInit(): void {
    // Paint any previously-written form value onto the canvas now that the
    // view is in place. writeValue may have been invoked earlier as part of
    // form-control wire-up, before the canvas existed.
    if (this._value) {
      this._drawImageToCanvas(this._value)
    }
  }

  writeValue(value: string | null): void {
    this._value = value
    this._renderedText = null
    // emitEvent: false so the debounced valueChanges subscriber doesn't fire
    // and redraw as text (which would clobber the restored image).
    this._nameControl.setValue(null, { emitEvent: false })
    this._drawImageToCanvas(value)
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
    this._clearCanvas()
    this._renderedText = null
    this._nameControl.setValue(null, { emitEvent: false })
    this._setValue(null)
  }

  protected _onKeyDownEnter(): void {
    this._drawTextToCanvas()
  }

  protected _onNameInputBlur(): void {
    this._drawTextToCanvas()
  }

  /**
   * Paint the given data URL onto the canvas as an image. Used when the
   * component mounts with a pre-existing form value — the user's typed name
   * isn't recoverable from the rendered bitmap, only the bitmap itself.
   */
  private _drawImageToCanvas(dataUrl: string | null): void {
    const canvas = this._typeCanvas()?.nativeElement
    if (!canvas) {
      return
    }
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    if (!dataUrl) {
      return
    }
    const img = new Image()
    img.onload = () => {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      context.drawImage(img, 0, 0)
    }
    img.src = dataUrl
  }

  /**
   * Render `_nameControl.value` as text onto the canvas and publish the
   * result as the form value. A null/empty name clears both.
   */
  private _drawTextToCanvas(): void {
    const canvas = this._typeCanvas()?.nativeElement
    if (!canvas) {
      return
    }
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const text = this._nameControl.value
    if (!text || text.trim().length === 0) {
      // Only clear if the user had previously rendered text on this instance.
      // Otherwise we'd wipe a restored image that writeValue just painted.
      if (this._renderedText !== null) {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        this._renderedText = null
        this._setValue(null)
      }
      return
    }

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    context.fillStyle = 'black'
    context.textBaseline = 'bottom'
    context.textAlign = 'center'
    let fontsize = 60
    do {
      fontsize--
      context.font = `${fontsize}px ${SIGNATURE_FONT_FAMILY}, cursive`
    } while (context.measureText(text).width > CANVAS_WIDTH)
    context.fillText(text, CANVAS_WIDTH / 2, 100)

    this._renderedText = text
    this._setValue(canvas.toDataURL())
  }

  private _clearCanvas(): void {
    const context = this._typeCanvas()?.nativeElement.getContext('2d')
    context?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  private _setValue(value: string | null): void {
    if (this._value === value) {
      return
    }
    this._value = value
    this._onChange(value)
    this._onTouched()
  }
}
