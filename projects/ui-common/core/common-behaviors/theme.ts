import { OutlineThemeTypes, ThemePrefixes, ThemeTypes } from '@theseam/ui-common/models'

import { Constructor } from './constructor'
import { HasElementRef } from './element-ref'

export interface CanTheme {
  /** Theme palette for the component. */
  theme: ThemeTypes | OutlineThemeTypes | undefined
}

export type CanThemeCtor = Constructor<CanTheme>

/** Mixin to augment a directive with a `theme` property. */
export function mixinTheme<T extends Constructor<HasElementRef>>(
    base: T, themePrefix: ThemePrefixes, defaultTheme?: ThemeTypes | OutlineThemeTypes): CanThemeCtor & T {
  return class extends base {
    private _theme: ThemeTypes | OutlineThemeTypes | undefined

    get theme(): ThemeTypes | OutlineThemeTypes | undefined { return this._theme }
    set theme(value: ThemeTypes | OutlineThemeTypes | undefined) {
      const themePalette = value || defaultTheme

      if (themePalette !== this._theme) {
        if (this._theme) {
          this._elementRef.nativeElement.classList.remove(`${themePrefix}-${this._theme}`)
        }
        if (themePalette) {
          this._elementRef.nativeElement.classList.add(`${themePrefix}-${themePalette}`)
        }

        this._theme = themePalette
      }
    }

    constructor(...args: any[]) {
      super(...args)

      // Set the default theme that can be specified from the mixin.
      this.theme = defaultTheme
    }
  }
}
