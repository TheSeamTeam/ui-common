import { ComponentHarness, HarnessPredicate, BaseHarnessFilters, ElementDimensions } from '@angular/cdk/testing'

export interface TheSeamTooltipHarnessFilters extends BaseHarnessFilters {
  // Empty - use selector-based filtering
}

/**
 * Harness for interacting with tooltip directives in tests
 */
export class TheSeamTooltipHarness extends ComponentHarness {
  static hostSelector = '[seamTooltip]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tooltip with specific attributes
   */
  static with(options: TheSeamTooltipHarnessFilters = {}): HarnessPredicate<TheSeamTooltipHarness> {
    return new HarnessPredicate(TheSeamTooltipHarness, options)
  }

  /** Hovers over the element to show the tooltip */
  async hover(): Promise<void> {
    return (await this.host()).hover()
  }

  /** Moves the mouse away from the element to hide the tooltip */
  async mouseAway(): Promise<void> {
    return (await this.host()).mouseAway()
  }

  /** Focuses the element to show the tooltip */
  async focus(): Promise<void> {
    return (await this.host()).focus()
  }

  /** Blurs the element to hide the tooltip */
  async blur(): Promise<void> {
    return (await this.host()).blur()
  }

  /** Clicks the element */
  async click(): Promise<void> {
    return (await this.host()).click()
  }

  /** Gets whether the tooltip is currently visible */
  async isTooltipVisible(): Promise<boolean> {
    const tooltipId = await this._getTooltipId()
    if (!tooltipId) {
      return false
    }
    const tooltip = await this.documentRootLocatorFactory().locatorForOptional(`#${tooltipId}.tooltip.show`)()
    return tooltip !== null
  }

  /** Gets the visible tooltip text content */
  async getVisibleTooltipText(): Promise<string | null> {
    const tooltipId = await this._getTooltipId()
    if (!tooltipId) {
      return null
    }
    const tooltipInner = await this.documentRootLocatorFactory().locatorForOptional(`#${tooltipId} .tooltip-inner`)()
    if (!tooltipInner) {
      return null
    }
    return tooltipInner.text()
  }

  /** Gets the visible tooltip classes */
  async getVisibleTooltipClasses(): Promise<string[]> {
    const tooltipId = await this._getTooltipId()
    if (!tooltipId) {
      return []
    }
    const tooltip = await this.documentRootLocatorFactory().locatorForOptional(`#${tooltipId}.tooltip.show`)()
    if (!tooltip) {
      return []
    }
    const classAttr = await tooltip.getAttribute('class')
    return classAttr ? classAttr.split(' ').filter(c => c.trim()) : []
  }

  /** Gets the tooltip ID from the aria-describedby attribute */
  private async _getTooltipId(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-describedby')
  }

  /** Waits for the tooltip to appear */
  async waitForTooltipToShow(timeout: number = 1000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await this.isTooltipVisible()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    throw new Error(`Tooltip did not appear within ${timeout}ms`)
  }

  /** Waits for the tooltip to disappear */
  async waitForTooltipToHide(timeout: number = 1000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (!(await this.isTooltipVisible())) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    throw new Error(`Tooltip did not hide within ${timeout}ms`)
  }

  async getTriggerDimensions(): Promise<ElementDimensions | null> {
    const host = await this.host()
    return host.getDimensions()
  }

  async getTooltipDimensions(): Promise<ElementDimensions | null> {
    const tooltipId = await this._getTooltipId()
    if (!tooltipId) {
      return null
    }
    const tooltip = await this.documentRootLocatorFactory().locatorForOptional(`#${tooltipId}.tooltip.show`)()
    if (!tooltip) {
      return null
    }
    return tooltip.getDimensions()
  }
}
