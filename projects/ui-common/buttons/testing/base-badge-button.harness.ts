import { ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing'

import { OutlineThemeNames, ThemeNames } from '@theseam/ui-common/models'
import { TheSeamBaseButtonComponentHarness, TheSeamBaseButtonComponentHarnessFilters, createBaseButtonComponentHarnessPredicate } from './base-button.harness'

const THEME_NAMES = [ ...ThemeNames, ...OutlineThemeNames ]
const THEME_CLASSES = THEME_NAMES.map(t => `badge-${t}`)

function getbadgeThemeClass(classListString: string | null) {
  return (classListString?.split(' ') || []).find(c => THEME_CLASSES.includes(c))
}

/** A set of criteria that can be used to filter a list of `TheSeamBaseBadgeButtonComponentHarness` instances. */
export interface TheSeamBaseBadgeButtonComponentHarnessFilters extends TheSeamBaseButtonComponentHarnessFilters { }

export function createBaseBadgeButtonComponentHarnessPredicate<T extends TheSeamBaseBadgeButtonComponentHarness>(
  componentHarness: ComponentHarnessConstructor<T>,
  options: TheSeamBaseBadgeButtonComponentHarnessFilters = {},
): HarnessPredicate<T> {
  return createBaseButtonComponentHarnessPredicate(componentHarness, options)
}

export class TheSeamBaseBadgeButtonComponentHarness extends TheSeamBaseButtonComponentHarness {

  private readonly _badgeElement = this.locatorFor('.badge')

  /** Gets the text of the button item. */
  async getText(): Promise<string> {
    return (await this.host()).text({ exclude: '.badge' })
  }

  /** Gets the text of the badge. */
  async getBadgeText(): Promise<string> {
    return (await this._badgeElement()).text()
  }

  /** Gets the theme of the badge. */
  async getBadgeTheme(): Promise<string | null> {
    return (await this._badgeElement()).getAttribute('class').then(c => getbadgeThemeClass(c)?.replace('badge-', '') || null)
  }
}
