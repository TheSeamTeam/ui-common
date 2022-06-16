import { Constructor, HasElementRef } from '@theseam/ui-common/core'
import { OutlineThemeTypes, ThemePrefixes, ThemeTypes } from '@theseam/ui-common/models'

import { TheSeamMapControlMenuControlManifest } from './map-controls-menu-control'

export interface IsMapControlsMenuControl {
  manifest: TheSeamMapControlMenuControlManifest
}

export type IsMapControlsMenuControlCtor = Constructor<IsMapControlsMenuControl>

/** Mixin to augment a directive with a `theme` property. */
export function mixinTheme<T extends Constructor<HasElementRef>>(
    base: T, manifest: TheSeamMapControlMenuControlManifest): IsMapControlsMenuControlCtor & T {
  return class extends base {

    readonly manifest: TheSeamMapControlMenuControlManifest = manifest

    // get manifest(): TheSeamMapControlMenuControlManifest { return this._manifest }
    // set manifest(value: TheSeamMapControlMenuControlManifest) {
    //   const themePalette = value || defaultTheme

    //   if (themePalette !== this._manifest) {
    //     if (this._manifest) {
    //       this._elementRef.nativeElement.classList.remove(`${themePrefix}-${this._manifest}`)
    //     }
    //     if (themePalette) {
    //       this._elementRef.nativeElement.classList.add(`${themePrefix}-${themePalette}`)
    //     }

    //     this._manifest = themePalette
    //   }
    // }

    constructor(...args: any[]) { super(...args) }
  }
}
