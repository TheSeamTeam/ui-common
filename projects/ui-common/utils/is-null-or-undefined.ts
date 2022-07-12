export function isNullOrUndefined<T>(value: T | null | undefined): value is (null | undefined) {
  return value === undefined || value === null
}
