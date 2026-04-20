import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { TheSeamFileInputComponent } from './file-input.component'
import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem, SeamFileRejection } from './file-item.models'
import { seamFileItemFromFile } from './file-item.utils'

@Component({
  selector: 'seam-file-field',
  templateUrl: './file-field.component.html',
  styleUrls: ['./file-field.component.scss'],
  imports: [TheSeamFileInputComponent, TheSeamFileTileComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TheSeamFileFieldComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileFieldComponent implements ControlValueAccessor {
  readonly multiple = input(false, { transform: booleanAttribute })
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })
  readonly previewMode = input(false, { transform: booleanAttribute })
  readonly showTileName = input(true, { transform: booleanAttribute })
  readonly promptText = input<string>('Choose a file')
  readonly promptSuffix = input<string>('or drag it here')
  readonly replaceText = input<string>('choose a different file')
  readonly hideErrors = input(false, { transform: booleanAttribute })

  readonly rejected = output<SeamFileRejection[]>()

  protected readonly _items = signal<SeamFileItem[]>([])
  protected readonly _cvaDisabled = signal(false)

  protected readonly _effectiveDisabled = computed(
    () => this.disabled() || this._cvaDisabled(),
  )

  protected readonly _hasFile = computed(
    () => !this.multiple() && this._items().length > 0,
  )

  protected readonly _remainingMaxFiles = computed(() => {
    const max = this.maxFiles()
    if (!this.multiple()) {
      // Single-mode: cap at 1 always. If explicit lower, honor.
      return max !== null ? Math.min(max, 1) : 1
    }
    if (max === null) return null
    return Math.max(0, max - this._items().length)
  })

  protected readonly _tileVariant = computed(() =>
    this.previewMode() ? 'preview' : 'row',
  )

  private _onChange: (value: SeamFileItem[]) => void = () => undefined
  private _onTouched: () => void = () => undefined

  writeValue(value: SeamFileItem[] | null): void {
    this._items.set(value ?? [])
  }

  registerOnChange(fn: (value: SeamFileItem[]) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled)
  }

  protected _onFilesAdded(files: File[]): void {
    if (files.length === 0) return
    const added = files.map((f) => seamFileItemFromFile(f))
    if (!this.multiple()) {
      this._items.set(added.slice(0, 1))
    } else {
      this._items.update((prev) => [...prev, ...added])
    }
    this._emit()
  }

  protected _onRejected(rejections: SeamFileRejection[]): void {
    this.rejected.emit(rejections)
  }

  protected _onTileRemove(item: SeamFileItem): void {
    this._items.update((prev) => prev.filter((i) => i !== item))
    this._emit()
  }

  private _emit(): void {
    this._onChange(this._items())
    this._onTouched()
  }
}
