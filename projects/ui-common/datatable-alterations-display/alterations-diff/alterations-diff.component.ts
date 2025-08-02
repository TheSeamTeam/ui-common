import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'

import { TheSeamLayoutService } from '@theseam/ui-common/layout'

import { AlterationDisplayItem, AlterationDiffState, AlterationDiffMode, AlterationVisualState } from '../models/alteration-display.model'
import { AlterationDisplayService } from '../services/alteration-display.service'
import { AlterationsListComponent } from '../alterations-list/alterations-list.component'

@Component({
  selector: 'seam-alterations-diff',
  standalone: true,
  imports: [CommonModule, AlterationsListComponent],
  templateUrl: './alterations-diff.component.html',
  styleUrls: ['./alterations-diff.component.scss']
})
export class AlterationsDiffComponent implements OnInit, OnDestroy {
  @Input() currentItems: AlterationDisplayItem[] = []
  @Input() pendingItems: AlterationDisplayItem[] = []
  @Input() diffMode: AlterationDiffMode = 'auto'
  @Input() initialDiffState?: AlterationDiffState
  @Input() compact = true

  isMobile = false
  diffState: AlterationDiffState | null = null

  private destroy$ = new Subject<void>()

  constructor(
    private layoutService: TheSeamLayoutService,
    private alterationDisplayService: AlterationDisplayService
  ) {}

  ngOnInit(): void {
    // Subscribe to mobile breakpoint changes
    this.layoutService.observe('lt-md')
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile
      })

    // Calculate diff state
    this.calculateDiffState()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get currentItemsWithDiffState(): AlterationDisplayItem[] {
    if (!this.diffState) {
      return this.currentItems
    }

    return this.currentItems.map(item => ({
      ...item,
      _diffState: this.getItemDiffState(item, 'current')
    }))
  }

  get pendingItemsWithDiffState(): AlterationDisplayItem[] {
    if (!this.diffState) {
      return this.pendingItems
    }

    return this.pendingItems.map(item => ({
      ...item,
      _diffState: this.getItemDiffState(item, 'pending')
    }))
  }

  get hasDifferences(): boolean {
    if (!this.diffState) {
      return false
    }

    return (
      this.diffState.added.length > 0 ||
      this.diffState.removed.length > 0 ||
      this.diffState.changed.length > 0
    )
  }

  get differenceSummary(): string {
    if (!this.diffState) {
      return 'No differences calculated'
    }

    const parts: string[] = []

    if (this.diffState.added.length > 0) {
      parts.push(`${this.diffState.added.length} added`)
    }

    if (this.diffState.removed.length > 0) {
      parts.push(`${this.diffState.removed.length} removed`)
    }

    if (this.diffState.changed.length > 0) {
      parts.push(`${this.diffState.changed.length} changed`)
    }

    if (parts.length === 0) {
      return 'No differences'
    }

    return parts.join(', ')
  }

  private calculateDiffState(): void {
    if (this.diffMode === 'manual' && this.initialDiffState) {
      this.diffState = this.initialDiffState
    } else {
      this.diffState = this.alterationDisplayService.calculateDiff(
        this.currentItems,
        this.pendingItems
      )
    }
  }

  private getItemDiffState(item: AlterationDisplayItem, context: 'current' | 'pending'): AlterationVisualState | undefined {
    if (!this.diffState) {
      return undefined
    }

    const itemId = item.id

    if (this.diffState.added.some(addedItem => addedItem.id === itemId)) {
      return context === 'pending' ? 'added' : undefined
    }

    if (this.diffState.removed.some(removedItem => removedItem.id === itemId)) {
      return context === 'current' ? 'removed' : undefined
    }

    if (this.diffState.changed.some(changedItem => changedItem.id === itemId)) {
      return 'changed'
    }

    return 'unchanged'
  }
}
