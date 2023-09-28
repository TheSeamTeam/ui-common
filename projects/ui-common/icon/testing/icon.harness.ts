import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { IconDefinition, IconLookup } from '@fortawesome/fontawesome-svg-core'
import { SeamIcon } from '@theseam/ui-common/icon'
import { hasProperty } from '@theseam/ui-common/utils'

/**
 * Returns only IconLookup for FontAwesome icons
 */
export type TestSeamIcon = string | IconLookup

export function toIconLookup(icon: IconDefinition): IconLookup {
  if (isIconLookup(icon)) {
    return { prefix: icon.prefix, iconName: icon.iconName }
  }

  throw new Error(`Invalid icon type: ${typeof icon}`)
}

function isIconLookup(icon: any): icon is IconLookup {
  return hasProperty(icon, 'prefix') && hasProperty(icon, 'iconName')
}

/** A set of criteria that can be used to filter a list of `TheSeamIconComponentHarness` instances. */
export interface TheSeamIconComponentHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  icon?: string | RegExp | SeamIcon;
}

export class TheSeamIconComponentHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `TheSeamIconComponent` instance. */
  static hostSelector = 'seam-icon'

  private readonly _imgElement = this.locatorForOptional('img')
  private readonly _svgElement = this.locatorForOptional('fa-icon svg')

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamIconComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamIconComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('icon', options.icon, async (harness, icon) => {
        const _icon = await harness.getIcon()
        if (_icon === undefined) {
          return false
        }

        if (typeof _icon === 'string' && (typeof icon === 'string' || icon instanceof RegExp)) {
          return HarnessPredicate.stringMatches(_icon, icon)
        } else if (isIconLookup(_icon) && isIconLookup(icon)) {
          return _icon.prefix === icon.prefix && _icon.iconName === icon.iconName
        }

        return false
      })
  }

  /** Whether the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('class')
      .then(c => c === null ? false : c.indexOf('disabled') !== -1)
    return coerceBooleanProperty(await disabled)
  }

  /** Get icon image. */
  async getIcon(): Promise<TestSeamIcon | undefined> {
    const img = await this._imgElement()
    const svg = await this._svgElement()
    if (img === null && svg === null) { return undefined }

    if (img !== null) {
      const src = await img.getAttribute('src')
      return typeof src === 'string' ? src : undefined
    } else if (svg !== null) {
      const prefix = await svg.getAttribute('data-prefix')
      const icon = await svg.getAttribute('data-icon')
      if (prefix === null || icon === null) {
        return undefined
      }
      return { prefix, iconName: icon } as IconLookup
    }
  }

  /** Get icon type. */
  async getIconType(): Promise<string | undefined> {
    const iconType = await (await this.host()).getAttribute('icon-type')
    return typeof iconType === 'string' ? iconType : undefined
  }

}
