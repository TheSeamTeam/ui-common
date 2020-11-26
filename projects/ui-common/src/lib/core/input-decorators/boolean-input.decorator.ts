import { coerceBooleanProperty } from '@angular/cdk/coercion'

/**
 * Use with `@Input()` to coerse the input to a boolean.1
 *
 * Example:
 * ```ts
 * @Component({ template: '' })
 * class {
 *     @BooleanInput() @Input() b: boolean
 * }
 * ```
 */
export function BooleanInput() {
  const cachedValueKey = Symbol()
  // tslint:disable-next-line: only-arrow-functions
  return function(
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ) {
    Object.defineProperty(target, propertyKey, {
      set: function(value: boolean) {
        this[cachedValueKey] = coerceBooleanProperty(value)
      },
      get: function() {
        return this[cachedValueKey]
      },
    })
  }
}
