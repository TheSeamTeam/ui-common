/**
 * Creates a variable reference marker for use in filter objects that will be
 * passed to `toGQL` and inlined into a query.
 *
 * When `toGQL` encounters an object with a `gqlVar` property, it emits the
 * value as-is (e.g. `$search`), producing a GraphQL variable reference in the
 * output rather than a string literal.
 *
 * @example
 * ```typescript
 * const filter = { name: { contains: gqlVar('search') } }
 * // toGQL(filter) → '{name: {contains: $search}}'
 * ```
 */
export function gqlVar(varName: string): { gqlVar: string } {
  return { gqlVar: `$${varName}` }
}
