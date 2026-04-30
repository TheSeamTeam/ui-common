import {
  booleanAttribute,
  computed,
  Directive,
  input,
  output,
  signal,
} from '@angular/core'

import { SeamFileRejection } from './file-item.models'
import { validateFiles } from './file-input-validation'

@Directive({
  selector: '[seamFileDropZone]',
  host: {
    '[class.seam-file-drop-zone--over]': '_isOver()',
    '(dragenter)': '_onDragEnter($event)',
    '(dragover)': '_onDragOver($event)',
    '(dragleave)': '_onDragLeave($event)',
    '(drop)': '_onDrop($event)',
  },
})
export class TheSeamFileDropZoneDirective {
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })

  readonly seamFileDrop = output<File[]>()
  readonly seamFileDropRejected = output<SeamFileRejection[]>()

  /** Counter-based dragenter/leave tracking to avoid child-element flicker. */
  private readonly _dragDepth = signal(0)

  protected readonly _isOver = computed(
    () => !this.disabled() && this._dragDepth() > 0,
  )

  protected _onDragEnter(event: DragEvent): void {
    if (this.disabled()) return
    event.preventDefault()
    this._dragDepth.update((n) => n + 1)
  }

  protected _onDragOver(event: DragEvent): void {
    if (this.disabled()) return
    // preventDefault is required for the drop event to fire.
    event.preventDefault()
  }

  protected _onDragLeave(event: DragEvent): void {
    if (this.disabled()) return
    this._dragDepth.update((n) => Math.max(0, n - 1))
  }

  protected _onDrop(event: DragEvent): void {
    if (this.disabled()) return
    event.preventDefault()
    this._dragDepth.set(0)

    const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : []
    if (files.length === 0) return

    const { accepted, rejected } = validateFiles(files, {
      accept: this.accept(),
      maxSize: this.maxSize(),
      maxFiles: this.maxFiles(),
    })

    this.seamFileDrop.emit(accepted)
    if (rejected.length > 0) this.seamFileDropRejected.emit(rejected)
  }
}
