import { coerceNumberProperty } from '@angular/cdk/coercion'

/**
 * Use with `@Input()` to coerse the input to a number.
 *
 * Example:
 * ```ts
 * @Component({ template: '' })
 * class {
 *     @Input() @InputNumber() b: number
 * }
 * ```
 */
export function InputNumber<TFallback>(fallback?: TFallback) {
  const cachedValueKey = Symbol()
  // tslint:disable-next-line: only-arrow-functions
  return function(
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ) {
    Object.defineProperty(target, propertyKey, {
      set: function(value: number) {
        this[cachedValueKey] = coerceNumberProperty(value, fallback)
      },
      get: function() {
        return this[cachedValueKey]
      },
    })
  }
}
