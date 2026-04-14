/**
 * Extract the state FIPS prefix from a county FIPS code.
 *
 * County codes are either 4- or 5-digit numeric ids (as strings or numbers
 * depending on the source). The state portion is everything except the last
 * three digits — i.e. 1 or 2 characters.
 */
export function stateIdFromCountyId(countyId: string | number): string {
  const asString = `${countyId}`
  return asString.slice(0, asString.length - 3)
}

/**
 * Whether the given county id appears in the selection list.
 *
 * Comparison is numeric so that `1001` and `"01001"` are treated as equal,
 * matching the historical behavior of the Cotton app component.
 */
export function isCountySelected(
  countyId: string | number,
  selectedCountyIds: readonly (string | number)[] | null | undefined,
): boolean {
  if (!selectedCountyIds || selectedCountyIds.length === 0) {
    return false
  }
  const target = Number(countyId)
  for (const id of selectedCountyIds) {
    if (Number(id) === target) {
      return true
    }
  }
  return false
}
