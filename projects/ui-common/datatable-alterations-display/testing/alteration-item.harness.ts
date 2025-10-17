import { ComponentHarness } from '@angular/cdk/testing'

export class AlterationItemHarness extends ComponentHarness {
  static hostSelector = 'seam-alteration-item'

  private _getCard = this.locatorFor('.card')
  private _getTypeBadge = this.locatorFor('[data-testid^="alteration-type-"]')
  private _getIcon = this.locatorFor('[data-testid^="alteration-icon-"]')
  private _getSummary = this.locatorFor('[data-testid="alteration-summary"]')
  private _getDiffState = this.locatorForOptional(
    '[data-testid="alteration-diff-state"]',
  )
  private _getDetails = this.locatorForAll('[data-testid="alteration-detail"]')

  async getType(): Promise<string> {
    const badge = await this._getTypeBadge()
    const testId = await badge.getAttribute('data-testid')
    return testId?.replace('alteration-type-', '') || ''
  }

  async getTypeDisplayName(): Promise<string> {
    const badge = await this._getTypeBadge()
    return badge.text()
  }

  async getSummary(): Promise<string> {
    const summary = await this._getSummary()
    return summary.text()
  }

  async getDiffState(): Promise<string | null> {
    const diffElement = await this._getDiffState()
    if (!diffElement) {
      return null
    }
    const text = await diffElement.text()
    if (text.includes('+')) return 'added'
    if (text.includes('-')) return 'removed'
    if (text.includes('~')) return 'changed'
    return 'unchanged'
  }

  async getDetails(): Promise<string[]> {
    const detailElements = await this._getDetails()
    return Promise.all(detailElements.map((el) => el.text()))
  }

  async hasDetails(): Promise<boolean> {
    const details = await this._getDetails()
    return details.length > 0
  }

  async hasBorderSuccess(): Promise<boolean> {
    const card = await this._getCard()
    const classes = await card.getAttribute('class')
    return classes?.includes('border-success') || false
  }

  async hasBorderDanger(): Promise<boolean> {
    const card = await this._getCard()
    const classes = await card.getAttribute('class')
    return classes?.includes('border-danger') || false
  }

  async hasBorderWarning(): Promise<boolean> {
    const card = await this._getCard()
    const classes = await card.getAttribute('class')
    return classes?.includes('border-warning') || false
  }

  async getBadgeClass(): Promise<string> {
    const badge = await this._getTypeBadge()
    const classes = await badge.getAttribute('class')
    const badgeClasses =
      classes?.split(' ').filter((cls) => cls.startsWith('badge-')) || []
    return badgeClasses[0] || ''
  }

  async isVisible(): Promise<boolean> {
    try {
      await this._getCard()
      return true
    } catch {
      return false
    }
  }
}
