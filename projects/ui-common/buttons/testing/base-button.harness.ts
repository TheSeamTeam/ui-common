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
  text?: string | RegExp
  type?: 'button' | 'submit' | 'reset'
}

export function createBaseButtonComponentHarnessPredicate<T extends TheSeamBaseButtonComponentHarness>(
  componentHarness: ComponentHarnessConstructor<T>,
  options: TheSeamBaseButtonComponentHarnessFilters = {},
): HarnessPredicate<T> {
  return new HarnessPredicate(componentHarness, options)
    .addOption('text', options.text, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getText(), text),
    )
    .addOption('type', options.type, (harness, type) =>
      HarnessPredicate.stringMatches(harness.getType(), type),
    )
}

export class TheSeamBaseButtonComponentHarness extends ContentContainerComponentHarness<string> {

  /** Whether the button is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  async hasDisabledAria(): Promise<boolean> {
    const ariaValue = await (await this.host()).getAttribute('aria-disabled')
    return ariaValue === 'true'
  }

  async getType(): Promise<string | null> {
    return (await this.host()).getAttribute('type')
  }

  /** Gets the text of the button item. */
  async getText(): Promise<string> {
    return (await this.host()).text()
  }

  /** Gets the theme of the button item. */
  async getTheme(): Promise<string | null> {
    return (await this.host()).getAttribute('class').then(c => getButtonThemeClass(c)?.replace('btn-', '') || null)
  }

  async click(): Promise<void> {
    return (await this.host()).click()
  }
}
