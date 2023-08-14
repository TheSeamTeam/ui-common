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
  const cachedValueKey = Symbol('Cached input number value')
  return function(
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ) {
    Object.defineProperty(target, propertyKey, {
      set(value: number) {
        this[cachedValueKey] = coerceNumberProperty(value, fallback)
      },
      get() {
        return this[cachedValueKey]
      },
    })
  }
}
