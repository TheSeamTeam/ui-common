/**
 * A single sort clause in HotChocolate's order format.
 * Each object has exactly one key: the field name, with a value of 'ASC' or 'DESC'.
 *
 * @example { memberOrganizationName: 'ASC' }
 */
export type SortClause = Record<string, 'ASC' | 'DESC'>

/**
 * Sorts an array by a HotChocolate-style `order` argument.
 *
 * Earlier entries in the array take higher sort precedence. When two records
 * are equal on all sort clauses they retain their original relative order
 * (stable sort).
 *
 * Handles strings (locale-aware), numbers/dates, booleans, and null/undefined
 * values (nulls sort last for both ASC and DESC).
 *
 * @example
 * sortItems(records, [{ name: 'ASC' }, { id: 'DESC' }])
 */
export function sortItems<T>(items: T[], order: SortClause[]): T[] {
  if (!order || order.length === 0) {
    return items
  }

  return [...items].sort((a, b) => {
    for (const clause of order) {
      const entries = Object.entries(clause)
      if (entries.length === 0) {
        continue
      }

      const [field, direction] = entries[0]
      const aVal = (a as any)[field]
      const bVal = (b as any)[field]

      const comparison = _compareValues(aVal, bVal)
      if (comparison !== 0) {
        return direction === 'DESC' ? -comparison : comparison
      }
    }

    return 0
  })
}

function _compareValues(a: any, b: any): number {
  // Nulls/undefined sort last regardless of direction (caller negates if DESC)
  const aNull = a == null
  const bNull = b == null
  if (aNull && bNull) return 0
  if (aNull) return 1
  if (bNull) return -1

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b)
  }

  if (a < b) return -1
  if (a > b) return 1
  return 0
}
