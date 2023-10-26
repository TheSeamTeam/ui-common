import { BaseHarnessFilters, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamLoadingTheme } from '../loading.models'
import { primaryThemeConfig } from '../loading-themes'

/** A set of criteria that can be used to filter a list of `TheSeamLoadingComponentHarness` instances. */
export interface TheSeamLoadingComponentHarnessFilters extends BaseHarnessFilters { }

export class TheSeamLoadingComponentHarness extends ContentContainerComponentHarness<string> {

  /** The selector for the host element of a `TheSeamLoadingComponent` instance. */
  static hostSelector = 'seam-loading'

  private readonly _backdropElement = this.locatorFor('.backdrop')

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamLoadingComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamLoadingComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  /** Gets the theme. */
  async getTheme(): Promise<TheSeamLoadingTheme> {
    const backdrop = await this._backdropElement()
    const backgroundColor = await backdrop.getCssValue('background-color')
    return backgroundColor.replace(/\s/g, '') === primaryThemeConfig.backdropBackgroundColour ? 'primary' : 'default'
  }
}
