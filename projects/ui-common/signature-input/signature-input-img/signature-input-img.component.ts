import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms'
import { from, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { TheSeamFileDropZoneDirective } from '@theseam/ui-common/file-input'
import { readFileAsDataUrlAsync } from '@theseam/ui-common/utils'

import { SignatureInputItem } from '../signature-input-panel.models'
import { THESEAM_SIGNATURE_INPUT_CONTAINER } from '../signature-input-container.token'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

const maxFileSizeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value
  if (!(value instanceof File)) {
    return null
  }
  return value.size > MAX_FILE_SIZE_BYTES ? { maxFileSize: {} } : null
}

@Component({
  selector: 'seam-signature-input-img',
  templateUrl: './signature-input-img.component.html',
  styleUrls: ['./signature-input-img.component.scss'],
  imports: [TheSeamFileDropZoneDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TheSeamSignatureInputImgComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamSignatureInputImgComponent
  implements ControlValueAccessor, SignatureInputItem
{
  static readonly MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES

  private readonly _container = inject(THESEAM_SIGNATURE_INPUT_CONTAINER, {
    optional: true,
  })
  private readonly _destroyRef = inject(DestroyRef)

  protected readonly _fileControl = new FormControl<File | null>(null, {
    validators: [maxFileSizeValidator],
  })

  private readonly _fileStatus = toSignal(this._fileControl.statusChanges, {
    initialValue: this._fileControl.status,
  })

  protected readonly _sizeError = computed<string | null>(() => {
    this._fileStatus()
    return this._fileControl.getError('maxFileSize')
      ? 'File size has exceeded 2MB.'
      : null
  })

  private readonly _value = signal<string | null>(null)
  protected readonly _previewDataUrl = computed(() => this._value())
  protected readonly _previewBackgroundImage = computed(() => {
    const url = this._value()
    return url ? `url("${url}")` : null
  })

  private readonly _nativeInput =
    viewChild.required<ElementRef<HTMLInputElement>>('filesInput')

  private _onChange: (value: string | null) => void = () => undefined
  private _onTouched: () => void = () => undefined

  constructor() {
    if (this._container) {
      this._container.registerInputItem('img', this)
      this._destroyRef.onDestroy(() =>
        this._container?.unregisterInputItem('img', this),
      )
    }

    this._fileControl.valueChanges
      .pipe(
        switchMap(() => {
          const file = this._fileControl.value
          if (!file || this._fileControl.invalid) {
            return of<string | null>(null)
          }
          return from(readFileAsDataUrlAsync(file))
        }),
        takeUntilDestroyed(),
      )
      .subscribe((dataUrl) => this._setValue(dataUrl))
  }

  writeValue(value: string | null): void {
    this._value.set(value)
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    if (this._fileControl.disabled === isDisabled) return
    if (isDisabled) this._fileControl.disable()
    else this._fileControl.enable()
  }

  clear(): void {
    this._fileControl.setValue(null)
  }

  openFileBrowse(): void {
    this._nativeInput().nativeElement.click()
  }

  protected _onFilesDropped(files: File[]): void {
    if (files.length > 0) this._fileControl.setValue(files[0])
  }

  protected _onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this._fileControl.setValue(input.files[0])
    }
    input.value = ''
  }

  private _setValue(value: string | null): void {
    this._value.set(value)
    this._onChange(value)
    this._onTouched()
  }
}
