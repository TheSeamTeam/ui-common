import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core'

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { iconForMime } from './file-item.utils'
import { SeamFileItem, SeamFileTileVariant } from './file-item.models'

@Component({
  selector: 'seam-file-tile',
  templateUrl: './file-tile.component.html',
  styleUrls: ['./file-tile.component.scss'],
  imports: [TheSeamIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileTileComponent {
  readonly item = input.required<SeamFileItem>()
  readonly variant = input<SeamFileTileVariant>('row')
  readonly showName = input(true, { transform: booleanAttribute })
  readonly showMeta = input(true, { transform: booleanAttribute })
  readonly removable = input(true, { transform: booleanAttribute })
  readonly disabled = input(false, { transform: booleanAttribute })

  readonly remove = output<SeamFileItem>()

  protected readonly _faTimes = faTimes

  protected readonly _mimeIcon = computed(() => iconForMime(this.item().type))
  protected readonly _metaLine = computed(() => _formatMeta(this.item()))
  protected readonly _showRemoveBtn = computed(
    () => this.removable() && !this.disabled(),
  )

  /**
   * Thumbnail URL for image items. Tracked across item changes so object
   * URLs are revoked when the item changes or the component is destroyed.
   */
  private _ownedObjectUrl: string | null = null
  private _pendingObjectUrl: string | null = null

  protected readonly _thumbUrl = computed(() => {
    const item = this.item()

    if (item.thumbnailUrl) return item.thumbnailUrl

    const isImage = _isImageMime(item.type)

    if (
      (item.source.kind === 'file' || item.source.kind === 'blob') &&
      isImage
    ) {
      const blob =
        item.source.kind === 'file' ? item.source.file : item.source.blob
      const url = URL.createObjectURL(blob)
      this._pendingObjectUrl = url
      return url
    }

    if (item.source.kind === 'url' && _looksLikeImage(item)) {
      return item.source.url
    }

    return null
  })

  constructor() {
    // When _thumbUrl changes, revoke the previous owned URL (if any).
    effect(() => {
      // Read the signal so this effect re-runs when the thumbnail changes.
      this._thumbUrl()
      const previous = this._ownedObjectUrl
      this._ownedObjectUrl = this._pendingObjectUrl
      this._pendingObjectUrl = null
      if (previous && previous !== this._ownedObjectUrl) {
        URL.revokeObjectURL(previous)
      }
    })
    // Destroy cleanup: revoke the last owned URL.
    effect((onCleanup) => {
      onCleanup(() => {
        if (this._ownedObjectUrl) {
          URL.revokeObjectURL(this._ownedObjectUrl)
          this._ownedObjectUrl = null
        }
      })
    })
  }

  protected _onRemove(event: MouseEvent): void {
    event.stopPropagation()
    this.remove.emit(this.item())
  }
}

function _formatMeta(item: SeamFileItem): string {
  const parts: string[] = []
  if (item.size !== undefined) parts.push(_formatBytes(item.size))
  if (item.type) parts.push(item.type)
  return parts.join(' · ')
}

function _formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function _isImageMime(type: string | undefined): boolean {
  return !!type && type.toLowerCase().startsWith('image/')
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i

function _looksLikeImage(item: SeamFileItem): boolean {
  if (_isImageMime(item.type)) return true
  if (item.source.kind === 'url' && IMAGE_EXT.test(item.source.url)) return true
  return false
}
