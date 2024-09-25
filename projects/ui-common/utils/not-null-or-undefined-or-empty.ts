export function notNullOrUndefinedOrEmpty(value: string | null | undefined, trim: boolean = true): value is string {
  return value !== null && value !== undefined && (trim ? value.trim() : value).length > 0
}
