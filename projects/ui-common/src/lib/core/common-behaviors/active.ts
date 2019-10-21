import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Constructor } from './constructor'

export interface CanBeActive {
  /** Whether the component is active. */
  active: boolean
}

export type CanBeActiveCtor = Constructor<CanBeActive>

/** Mixin to augment a directive with a `disabled` property. */
export function mixinActive<T extends Constructor<{}>>(base: T): CanBeActiveCtor & T {
  return class extends base {
    private _active = false

    get active() { return this._active }
    set active(value: any) { this._active = coerceBooleanProperty(value) }

    constructor(...args: any[]) { super(...args) }
  }
}
