import { ComponentHarness, HarnessPredicate, BaseHarnessFilters } from '@angular/cdk/testing'

export interface TooltipHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the tooltip content text */
  content?: string | RegExp
  /** Filters based on the tooltip placement */
  placement?: string
}

/**
 * Harness for interacting with tooltip directives in tests
 */
export class TooltipHarness extends ComponentHarness {
  static hostSelector = '[seamTooltip]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tooltip with specific attributes
   */
  static with(options: TooltipHarnessFilters = {}): HarnessPredicate<TooltipHarness> {
    return new HarnessPredicate(TooltipHarness, options)
      .addOption('content', options.content, (harness, content) =>
        HarnessPredicate.stringMatches(harness.getTooltipContent(), content)
      )
      .addOption('placement', options.placement, (harness, placement) =>
        harness.getPlacement().then(p => p === placement)
      )
  }

  /** Gets the tooltip content */
  async getTooltipContent(): Promise<string> {
    const content = await (await this.host()).getAttribute('seamTooltip')
    return content || ''
  }

  /** Gets the tooltip placement */
  async getPlacement(): Promise<string> {
    const placement = await (await this.host()).getAttribute('placement')
    return placement || 'top'
  }

  /** Gets whether the tooltip is disabled */
  async isDisabled(): Promise<boolean> {
    const disabled = await (await this.host()).getAttribute('disableTooltip')
    return disabled === 'true'
  }

  /** Gets the show delay */
  async getShowDelay(): Promise<number> {
    const delay = await (await this.host()).getAttribute('showDelay')
    return delay ? parseInt(delay, 10) : 500
  }

  /** Gets the hide delay */
  async getHideDelay(): Promise<number> {
    const delay = await (await this.host()).getAttribute('hideDelay')
    return delay ? parseInt(delay, 10) : 0
  }

  /** Gets the trigger type */
  async getTrigger(): Promise<string> {
    const trigger = await (await this.host()).getAttribute('trigger')
    return trigger || 'both'
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
    // Check if tooltip overlay exists in the DOM
    const tooltips = await this.documentRootLocatorFactory().locatorForAll('.tooltip.show')()
    return tooltips.length > 0
  }

  /** Gets the visible tooltip text content */
  async getVisibleTooltipText(): Promise<string | null> {
    const tooltips = await this.documentRootLocatorFactory().locatorForAll('.tooltip.show .tooltip-inner')()
    if (tooltips.length === 0) {
      return null
    }
    return tooltips[0].text()
  }

  /** Gets the visible tooltip classes */
  async getVisibleTooltipClasses(): Promise<string[]> {
    const tooltips = await this.documentRootLocatorFactory().locatorForAll('.tooltip.show')()
    if (tooltips.length === 0) {
      return []
    }
    const classAttr = await tooltips[0].getAttribute('class')
    return classAttr ? classAttr.split(' ').filter(c => c.trim()) : []
  }

  /** Waits for the tooltip to appear */
  async waitForTooltipToShow(timeout: number = 1000): Promise<void> {
    await this.waitForTasksOutsideAngular()
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
    await this.waitForTasksOutsideAngular()
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (!(await this.isTooltipVisible())) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    throw new Error(`Tooltip did not hide within ${timeout}ms`)
  }
}
