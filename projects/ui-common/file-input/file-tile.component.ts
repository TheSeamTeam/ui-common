import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
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
