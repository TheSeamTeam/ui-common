import { ThemePrefixes } from '../../models/theme-prefixes'
import { ThemeTypes } from '../../models/theme-types'
import { Constructor } from './constructor'
import { HasElementRef } from './element-ref'

export interface CanTheme {
  /** Theme palette for the component. */
  theme: ThemeTypes | undefined
}

export type CanThemeCtor = Constructor<CanTheme>

/** Mixin to augment a directive with a `theme` property. */
export function mixinTheme<T extends Constructor<HasElementRef>>(
    base: T, themePrefix: ThemePrefixes, defaultTheme?: ThemeTypes): CanThemeCtor & T {
  return class extends base {
    private _theme: ThemeTypes | undefined

    get theme(): ThemeTypes | undefined { return this._theme }
    set theme(value: ThemeTypes | undefined) {
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
