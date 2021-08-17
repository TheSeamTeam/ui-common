// Source: https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts#L16
export function isEmptyInputValue(value: any): boolean {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0
}
