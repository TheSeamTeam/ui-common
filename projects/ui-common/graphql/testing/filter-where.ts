export type WhereArg = Record<string, any>

/**
 * The set of leaf-level operator keys used by HotChocolate filter inputs
 * (e.g. StringOperationFilterInput, ComparableInt32OperationFilterInput).
 * Any key not in this set is treated as a field name, causing the evaluator
 * to recurse into `value[key]`.
 */
const OPERATOR_KEYS = new Set([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'ngt',
  'ngte',
  'nlt',
  'nlte',
  'in',
  'nin',
  'contains',
  'ncontains',
  'startsWith',
  'nstartsWith',
  'endsWith',
  'nendsWith',
  'objectContains',
])

function applyOperator(operator: string, value: any, operand: any): boolean {
  switch (operator) {
    case 'eq':
      return value === operand
    case 'neq':
      return value !== operand
    case 'gt':
      return value > operand
    case 'gte':
      return value >= operand
    case 'lt':
      return value < operand
    case 'lte':
      return value <= operand
    // Negated comparisons — logical complements of the above
    case 'ngt':
      return !(value > operand) // equivalent to lte
    case 'ngte':
      return !(value >= operand) // equivalent to lt
    case 'nlt':
      return !(value < operand) // equivalent to gte
    case 'nlte':
      return !(value <= operand) // equivalent to gt
    case 'in':
      return Array.isArray(operand) && operand.includes(value)
    case 'nin':
      return Array.isArray(operand) && !operand.includes(value)
    case 'contains':
      return (
        typeof value === 'string' &&
        typeof operand === 'string' &&
        value.includes(operand)
      )
    case 'ncontains':
      return (
        typeof value === 'string' &&
        typeof operand === 'string' &&
        !value.includes(operand)
      )
    case 'startsWith':
      return (
        typeof value === 'string' &&
        typeof operand === 'string' &&
        value.startsWith(operand)
      )
    case 'nstartsWith':
      return (
        typeof value === 'string' &&
        typeof operand === 'string' &&
        !value.startsWith(operand)
      )
    case 'endsWith':
      return (
        typeof value === 'string' &&
        typeof operand === 'string' &&
        value.endsWith(operand)
      )
    case 'nendsWith':
      return (
        typeof value === 'string' &&
        typeof operand === 'string' &&
        !value.endsWith(operand)
      )
    case 'objectContains': {
      // Custom Seam/HotChocolate operator: convert the field value to a string
      // and check if it contains the operand (case-insensitive, matching search UX).
      const strValue = value == null ? '' : String(value)
      const strOperand = operand == null ? '' : String(operand)
      return strValue.toLowerCase().includes(strOperand.toLowerCase())
    }
    default:
      throw new Error(`Unknown filter operator: "${operator}"`)
  }
}

/**
 * Recursively evaluates a HotChocolate-style filter against a value.
 *
 * Rules:
 * - `and` array: all sub-filters must pass (AND logic)
 * - `or` array: at least one sub-filter must pass (OR logic)
 * - Known operator keys (`eq`, `contains`, `gt`, ...): apply the operator to
 *   the current `value`
 * - Any other key: treat as a field name; recurse with `value[key]` and the
 *   nested filter
 * - All non-`and`/`or` conditions are implicitly ANDed together
 */
function evaluateCondition(value: any, filter: any): boolean {
  if (filter === null || filter === undefined) {
    return true
  }

  if (Array.isArray(filter.and)) {
    if (!filter.and.every((f: any) => evaluateCondition(value, f))) {
      return false
    }
  }

  if (Array.isArray(filter.or)) {
    if (!filter.or.some((f: any) => evaluateCondition(value, f))) {
      return false
    }
  }

  for (const key of Object.keys(filter)) {
    if (key === 'and' || key === 'or') {
      continue
    }

    if (OPERATOR_KEYS.has(key)) {
      if (!applyOperator(key, value, filter[key])) {
        return false
      }
    } else {
      if (!evaluateCondition(value?.[key], filter[key])) {
        return false
      }
    }
  }

  return true
}

/**
 * Filters an array using a HotChocolate-style where clause.
 *
 * Top-level field conditions are implicitly ANDed. Use `and`/`or` arrays for
 * explicit logical grouping.
 *
 * @example
 * filterWhere(records, { name: { contains: 'foo' }, id: { gt: 5 } })
 * filterWhere(records, { or: [{ name: { eq: 'a' } }, { name: { eq: 'b' } }] })
 */
export function filterWhere<T>(data: T[], where: WhereArg): T[] {
  return data.filter((item) => evaluateCondition(item, where))
}
