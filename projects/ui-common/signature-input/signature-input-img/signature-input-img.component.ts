import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
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

import {
  FileSystemFileEntry,
  NgxFileDropEntry,
  NgxFileDropModule,
} from 'ngx-file-drop'
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
  imports: [NgxFileDropModule],
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

  /**
   * The File is only needed for validation at selection time. Once it's been
   * converted to a data URL and stored in the form value, we don't need the
   * File again — so there's no point trying to round-trip it through
   * writeValue / form state. The preview renders off the current form value.
   */
  protected readonly _fileControl = new FormControl<File | null>(null, {
    validators: [maxFileSizeValidator],
  })

  private readonly _fileStatus = toSignal(this._fileControl.statusChanges, {
    initialValue: this._fileControl.status,
  })

  protected readonly _sizeError = computed<string | null>(() => {
    // Touch the status signal so this re-runs on validity changes.
    this._fileStatus()
    return this._fileControl.getError('maxFileSize')
      ? 'File size has exceeded 2MB.'
      : null
  })

  /**
   * Single source of truth for both the form value and the preview image.
   * External writes (writeValue) and successful uploads both funnel through
   * here, so switching tabs and coming back always shows the last committed
   * signature.
   */
  private readonly _value = signal<string | null>(null)
  protected readonly _previewDataUrl = computed(() => this._value())
  protected readonly _previewBackgroundImage = computed(() => {
    const url = this._value()
    return url ? `url("${url}")` : null
  })

  private _onChange: (value: string | null) => void = () => undefined
  private _onTouched: () => void = () => undefined

  constructor() {
    if (this._container) {
      this._container.registerInputItem('img', this)
      this._destroyRef.onDestroy(() =>
        this._container?.unregisterInputItem('img', this),
      )
    }

    // Valid file uploads convert to a data URL and become both the preview
    // and the form value. Invalid (too large) files clear both.
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
    // valueChanges subscription propagates this to `_value` (null) and to the
    // form value.
    this._fileControl.setValue(null)
  }

  openFileBrowse(): void {
    const fileInput = document.createElement('input')
    fileInput.setAttribute('type', 'file')

    const cleanup = () => {
      // Give the 'change' event a moment to fire before assuming the user
      // canceled the dialog.
      setTimeout(() => {
        fileInput.removeEventListener('change', onFileChange)
        document.body.removeEventListener('focus', onFocusReturned)
        window.removeEventListener('focus', onFocusReturned)
      }, 1000)
    }

    const onFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files && input.files.length > 0) {
        this._fileControl.setValue(input.files[0])
      }
      cleanup()
    }
    fileInput.addEventListener('change', onFileChange)

    // Detect file browser canceled without making a selection.
    const onFocusReturned = () => cleanup()
    document.body.addEventListener('focus', onFocusReturned)
    window.addEventListener('focus', onFocusReturned)

    fileInput.click()
  }

  protected _onFileDropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry
        fileEntry.file((file) => this._fileControl.setValue(file))
        break
      }
    }
  }

  private _setValue(value: string | null): void {
    this._value.set(value)
    this._onChange(value)
    this._onTouched()
  }
}
