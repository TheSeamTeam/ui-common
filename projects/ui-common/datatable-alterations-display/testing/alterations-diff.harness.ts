import { ComponentHarness } from '@angular/cdk/testing'
import { AlterationsListHarness } from './alterations-list.harness'

export class AlterationsDiffHarness extends ComponentHarness {
  static hostSelector = 'seam-alterations-diff'

  private _getDiffSummary = this.locatorForOptional('[data-testid="diff-summary"]')
  private _getCurrentList = this.locatorForOptional('[data-testid="current-alterations-list"]')
  private _getPendingList = this.locatorForOptional('[data-testid="pending-alterations-list"]')
  private _getCurrentListMobile = this.locatorForOptional('[data-testid="current-alterations-list-mobile"]')
  private _getPendingListMobile = this.locatorForOptional('[data-testid="pending-alterations-list-mobile"]')
  private _getDesktopLayout = this.locatorForOptional('[data-testid="desktop-layout"]')
  private _getMobileLayout = this.locatorForOptional('[data-testid="mobile-layout"]')

  async hasDiffSummary(): Promise<boolean> {
    const summary = await this._getDiffSummary()
    return summary !== null
  }

  async getDiffSummaryText(): Promise<string | null> {
    const summary = await this._getDiffSummary()
    return summary ? summary.text() : null
  }

  async isDesktopLayout(): Promise<boolean> {
    const desktop = await this._getDesktopLayout()
    return desktop !== null
  }

  async isMobileLayout(): Promise<boolean> {
    const mobile = await this._getMobileLayout()
    return mobile !== null
  }

  async getCurrentList(): Promise<AlterationsListHarness | null> {
    try {
      // Try desktop layout first
      return await this.locatorFor(AlterationsListHarness)()
    } catch {
      return null
    }
  }

  async getPendingList(): Promise<AlterationsListHarness | null> {
    try {
      // Try to get the second list (pending)
      const lists = await this.locatorForAll(AlterationsListHarness)()
      return lists.length > 1 ? lists[1] : null
    } catch {
      return null
    }
  }

  async getCurrentItemCount(): Promise<number> {
    const currentList = await this.getCurrentList()
    return currentList ? currentList.getItemCount() : 0
  }

  async getPendingItemCount(): Promise<number> {
    const pendingList = await this.getPendingList()
    return pendingList ? pendingList.getItemCount() : 0
  }

  async hasCurrentEmptyState(): Promise<boolean> {
    const currentList = await this.getCurrentList()
    return currentList ? currentList.hasEmptyState() : false
  }

  async hasPendingEmptyState(): Promise<boolean> {
    const pendingList = await this.getPendingList()
    return pendingList ? pendingList.hasEmptyState() : false
  }
}
