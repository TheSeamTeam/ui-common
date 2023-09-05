import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

// import { TheSeamMenuHarness } from './button.harness'
// import { animatingWait } from './utils'

import { OutlineThemeNames, ThemeNames } from '@theseam/ui-common/models'

const THEME_NAMES = [ ...ThemeNames, ...OutlineThemeNames ]
const THEME_CLASSES = THEME_NAMES.map(t => `btn-${t}`)

function getButtonThemeClass(classListString: string | null) {
  return (classListString?.split(' ') || []).find(c => THEME_CLASSES.includes(c))
}

/** A set of criteria that can be used to filter a list of `TheSeamBaseButtonComponentHarness` instances. */
export interface TheSeamBaseButtonComponentHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}

export function createBaseButtonComponentHarnessPredicate<T extends TheSeamBaseButtonComponentHarness>(
  componentHarness: ComponentHarnessConstructor<T>,
  options: TheSeamBaseButtonComponentHarnessFilters = {},
): HarnessPredicate<T> {
  return new HarnessPredicate(componentHarness, options)
    .addOption('text', options.text, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getText(), text),
    )
}

export class TheSeamBaseButtonComponentHarness extends ContentContainerComponentHarness<string> {/** The selector for the host element of a `TheSeamAnchorButtonComponent` instance. */

  /** Whether the button is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  async hasDisabledAria(): Promise<boolean> {
    const ariaValue = await (await this.host()).getAttribute('aria-disabled')
    return ariaValue === 'true'
  }

  /** Gets the text of the button item. */
  async getText(): Promise<string> {
    return (await this.host()).text()
  }

  /** Gets the theme of the button item. */
  async getTheme(): Promise<string | null> {
    return (await this.host()).getAttribute('class').then(c => getButtonThemeClass(c)?.replace('btn-', '') || null)
  }

  /** Focuses the button item. */
  // async focus(): Promise<void> {
  //   return (await this.host()).focus().then(() => animatingWait())
  // }

  /** Blurs the button item. */
  // async blur(): Promise<void> {
  //   return (await this.host()).blur().then(() => animatingWait())
  // }

  /** Whether the button item is focused. */
  // async isFocused(): Promise<boolean> {
  //   return (await this.host()).isFocused()
  // }

  /** Clicks the button item. */
  // async click(): Promise<void> {
  //   return (await this.host()).click().then(() => animatingWait())
  // }

  /** Hovers the button item. */
  // async hover(): Promise<void> {
  //   return (await this.host()).hover().then(() => animatingWait())
  // }

  /** Whether this item has a submenu. */
  // async hasSubmenu(): Promise<boolean> {
  //   return (await this.host()).matchesSelector(TheSeamMenuHarness.hostSelector)
  // }

  /** Gets the submenu associated with this button item, or null if none. */
  // async getSubmenu(): Promise<TheSeamMenuHarness | null> {
  //   if (await this.hasSubmenu()) {
  //     return new TheSeamMenuHarness(this.locatorFactory)
  //   }
  //   return null
  // }
}
