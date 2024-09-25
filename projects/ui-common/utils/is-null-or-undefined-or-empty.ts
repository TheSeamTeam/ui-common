export function isNullOrUndefinedOrEmpty(value: string | null | undefined, trim: boolean = true): value is (string | null | undefined) {
  return value === undefined || value === null || (trim ? value.trim() : value).length === 0
}
