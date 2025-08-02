import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AlterationDisplayItem, AlterationVisualState } from '../models/alteration-display.model'
import { AlterationDisplayService } from '../services/alteration-display.service'
import { AlterationItemComponent } from '../alteration-item/alteration-item.component'

@Component({
  selector: 'seam-alterations-list',
  standalone: true,
  imports: [CommonModule, AlterationItemComponent],
  templateUrl: './alterations-list.component.html',
  styleUrls: ['./alterations-list.component.scss']
})
export class AlterationsListComponent {
  @Input() items: AlterationDisplayItem[] = []
  @Input() title?: string
  @Input() diffState?: 'current' | 'pending'
  @Input() groupByType = true
  @Input() sortWithinType = true
  @Input() compact = true

  constructor(private alterationDisplayService: AlterationDisplayService) {}

  get sortedItems(): AlterationDisplayItem[] {
    if (!this.groupByType && !this.sortWithinType) {
      return this.items
    }

    return this.alterationDisplayService.groupAndSortItems(this.items)
  }

  get hasItems(): boolean {
    return this.items && this.items.length > 0
  }

  getItemDiffState(item: AlterationDisplayItem): AlterationVisualState | undefined {
    // For now, we don't set individual item diff states in the list component
    // This will be handled by the parent diff component
    return undefined
  }

  trackByItemId(index: number, item: AlterationDisplayItem): string {
    return item.id
  }
}
