// Source: https://stackoverflow.com/a/59361497/7926298
export function hasProperty<T extends object, K extends keyof T>(
  style: T,
  prop: K
// ): style is T & { [P in K]-?: Exclude<T[K], undefined> } {
): style is T & Required<Record<K, Exclude<T[K], undefined>>> {
  return Object.prototype.hasOwnProperty.call(style, prop) && style[prop] !== undefined
}
