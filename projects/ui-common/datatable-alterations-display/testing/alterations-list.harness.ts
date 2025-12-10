import { ComponentHarness } from '@angular/cdk/testing'
import { AlterationItemHarness } from './alteration-item.harness'

export class AlterationsListHarness extends ComponentHarness {
  static hostSelector = 'seam-alterations-list'

  private _getTitle = this.locatorForOptional(
    '[data-testid="alterations-list-title"]',
  )
  private _getCount = this.locatorForOptional(
    '[data-testid="alterations-list-count"]',
  )
  private _getEmptyState = this.locatorForOptional(
    '[data-testid="alterations-list-empty"]',
  )
  private _getItems = this.locatorForAll(AlterationItemHarness)

  async getTitle(): Promise<string | null> {
    const titleElement = await this._getTitle()
    return titleElement ? titleElement.text() : null
  }

  async getCount(): Promise<string | null> {
    const countElement = await this._getCount()
    return countElement ? countElement.text() : null
  }

  async hasEmptyState(): Promise<boolean> {
    const emptyState = await this._getEmptyState()
    return emptyState !== null
  }

  async getEmptyStateText(): Promise<string | null> {
    const emptyState = await this._getEmptyState()
    return emptyState ? emptyState.text() : null
  }

  async getItems(): Promise<AlterationItemHarness[]> {
    return this._getItems()
  }

  async getItemCount(): Promise<number> {
    const items = await this.getItems()
    return items.length
  }

  async getItemByType(type: string): Promise<AlterationItemHarness | null> {
    const items = await this.getItems()
    for (const item of items) {
      const itemType = await item.getType()
      if (itemType === type) {
        return item
      }
    }
    return null
  }

  async getItemTypes(): Promise<string[]> {
    const items = await this.getItems()
    const types: string[] = []
    for (const item of items) {
      const type = await item.getType()
      types.push(type)
    }
    return types
  }

  async hasItems(): Promise<boolean> {
    const items = await this.getItems()
    return items.length > 0
  }
}
