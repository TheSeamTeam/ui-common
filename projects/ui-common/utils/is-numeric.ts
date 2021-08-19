export function isNumeric(value: any): boolean {
  return !isNaN(Number(value) - parseFloat(value))
}
