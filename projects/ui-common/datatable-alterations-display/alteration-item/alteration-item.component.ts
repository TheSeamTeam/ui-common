import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

import { faSort, faArrowsAlt, faEyeSlash, faArrowsAltH, faFilter, faCog } from '@fortawesome/free-solid-svg-icons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { AlterationDisplayItem, AlterationVisualState } from '../models/alteration-display.model'
import { AlterationDisplayService } from '../services/alteration-display.service'

@Component({
  selector: 'seam-alteration-item',
  standalone: true,
  imports: [CommonModule, TheSeamIconModule],
  templateUrl: './alteration-item.component.html',
  styleUrls: ['./alteration-item.component.scss']
})
export class AlterationItemComponent {
  @Input() item!: AlterationDisplayItem
  @Input() compact = true

  // FontAwesome icons
  private readonly typeIcons = {
    'sort': faSort,
    'order': faArrowsAlt,
    'hide-column': faEyeSlash,
    'width': faArrowsAltH,
    'filter': faFilter,
    'default': faCog
  }

  constructor(private alterationDisplayService: AlterationDisplayService) {}

  get typeDisplayName(): string {
    return this.alterationDisplayService.getTypeDisplayName(this.item.type)
  }

  get typeIcon() {
    return this.typeIcons[this.item.type as keyof typeof this.typeIcons] || this.typeIcons.default
  }

  get borderClass(): string {
    switch (this.item.diffState) {
      case 'added':
        return 'border-success'
      case 'removed':
        return 'border-danger'
      case 'changed':
        return 'border-warning'
      default:
        return ''
    }
  }

  get badgeClass(): string {
    switch (this.item.type) {
      case 'sort':
        return 'badge-primary'
      case 'order':
        return 'badge-info'
      case 'hide-column':
        return 'badge-secondary'
      case 'width':
        return 'badge-dark'
      case 'filter':
        return 'badge-warning'
      default:
        return 'badge-secondary'
    }
  }
}
