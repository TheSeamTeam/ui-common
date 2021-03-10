import { SizePrefixes, SizeTypes } from '@lib/ui-common/models'

import { Constructor } from './constructor'
import { HasElementRef } from './element-ref'

export interface CanSize {
  size: SizeTypes | undefined
}

export type CanSizeCtor = Constructor<CanSize>

/** Mixin to augment a directive with a `size` property. */
export function mixinSize<T extends Constructor<HasElementRef>>(
    base: T, sizePrefix: SizePrefixes, defaultSize?: SizeTypes): CanSizeCtor & T {
  return class extends base {
    private _size: SizeTypes | undefined

    get size(): SizeTypes | undefined { return this._size }
    set size(value: SizeTypes | undefined) {
      const themePalette = value || defaultSize

      if (themePalette !== this._size) {
        if (this._size) {
          this._elementRef.nativeElement.classList.remove(`${sizePrefix}-${this._size}`)
        }
        if (themePalette) {
          this._elementRef.nativeElement.classList.add(`${sizePrefix}-${themePalette}`)
        }

        this._size = themePalette
      }
    }

    constructor(...args: any[]) {
      super(...args)

      // Set the default size that can be specified from the mixin.
      this.size = defaultSize
    }
  }
}
