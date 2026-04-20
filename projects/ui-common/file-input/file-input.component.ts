import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core'

import { faUpload } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
import { SeamFileRejection } from './file-item.models'

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

  private readonly _nativeInput =
    viewChild.required<ElementRef<HTMLInputElement>>('native')

  protected _openPicker(): void {
    if (this.disabled()) return
    this._nativeInput().nativeElement.click()
  }

  protected _onFilesDropped(files: File[]): void {
    this.filesAdded.emit(files)
  }

  protected _onRejected(rejections: SeamFileRejection[]): void {
    this.rejected.emit(rejections)
  }

  protected _onNativeChange(_event: Event): void {
    // Implemented in Task 10.
  }
}
