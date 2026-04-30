import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'

import { faUpload } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
import { validateFiles } from './file-input-validation'
import { SeamFileRejection, SeamFileRejectionReason } from './file-item.models'

@Component({
  selector: 'seam-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  imports: [TheSeamFileDropZoneDirective, TheSeamIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileInputComponent {
  readonly multiple = input(false, { transform: booleanAttribute })
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })
  readonly hideErrors = input(false, { transform: booleanAttribute })
  readonly promptText = input<string>('Choose a file')
  readonly promptSuffix = input<string>('or drag it here')

  readonly filesAdded = output<File[]>()
  readonly rejected = output<SeamFileRejection[]>()

  protected readonly _faUpload = faUpload
  protected readonly _lastRejections = signal<SeamFileRejection[]>([])
  protected readonly _effectiveMaxFiles = computed(() => {
    const explicit = this.maxFiles()
    if (!this.multiple()) {
      return explicit !== null ? Math.min(explicit, 1) : 1
    }
    return explicit
  })
  protected readonly _errorMessage = computed(() =>
    _formatErrors(
      this._lastRejections(),
      this.maxSize(),
      this._effectiveMaxFiles(),
    ),
  )

  private readonly _nativeInput =
    viewChild.required<ElementRef<HTMLInputElement>>('native')

  _openPicker(): void {
    if (this.disabled()) return
    this._nativeInput().nativeElement.click()
  }

  protected _onFilesDropped(files: File[]): void {
    this._lastRejections.set([])
    if (files.length > 0) this.filesAdded.emit(files)
  }

  protected _onRejected(rejections: SeamFileRejection[]): void {
    this._lastRejections.set(rejections)
    this.rejected.emit(rejections)
  }

  protected _onNativeChange(event: Event): void {
    const nativeInput = event.target as HTMLInputElement
    const files = nativeInput.files ? Array.from(nativeInput.files) : []
    // Clear the value so the same file can be re-selected next time.
    nativeInput.value = ''

    if (files.length === 0) return

    const { accepted, rejected } = validateFiles(files, {
      accept: this.accept(),
      maxSize: this.maxSize(),
      maxFiles: this._effectiveMaxFiles(),
    })

    if (rejected.length > 0) {
      this._lastRejections.set(rejected)
      this.rejected.emit(rejected)
    } else {
      this._lastRejections.set([])
    }

    if (accepted.length > 0) this.filesAdded.emit(accepted)
  }
}

function _formatErrors(
  rejections: SeamFileRejection[],
  maxSize: number | null,
  maxFiles: number | null,
): string | null {
  if (rejections.length === 0) return null
  const firstReason: SeamFileRejectionReason = rejections[0].reasons[0]
  switch (firstReason) {
    case 'type':
      return 'File type not accepted.'
    case 'size': {
      const mb = maxSize !== null ? (maxSize / (1024 * 1024)).toFixed(1) : null
      return mb
        ? `File exceeds the maximum size (${mb} MB).`
        : 'File exceeds the maximum size.'
    }
    case 'count':
      return maxFiles !== null
        ? `Only ${maxFiles} file(s) can be added.`
        : 'Too many files selected.'
    default:
      return 'File could not be accepted.'
  }
}
