/**
 * Creates an enum value marker for use in filter objects that will be passed
 * to `toGQL` and inlined into a query.
 *
 * When `toGQL` encounters an object with a `gqlEnum` property, it emits the
 * value as a bare token (e.g. `ACTIVE`), producing a GraphQL enum value in
 * the output rather than a string literal.
 *
 * By default the input is normalized to `SCREAMING_SNAKE_CASE`: an underscore
 * is inserted before each capital letter (other than a leading one), spaces
 * are replaced with underscores, and the result is uppercased. Pass
 * `formatAsEnum: false` to emit the input verbatim — useful when the value is
 * already in the schema's enum form.
 *
 * @example
 * ```typescript
 * const filter = { status: { eq: gqlEnum('active') } }
 * // toGQL(filter) → '{status: {eq: ACTIVE}}'
 * ```
 */
export function gqlEnum(
  enumName: string,
  formatAsEnum: boolean = true,
): { gqlEnum: string } {
  return { gqlEnum: formatAsEnum ? toEnumName(enumName) : enumName }
}

function toEnumName(name: string): string {
  const _name = name
    .replace(/([A-Z])/g, '_$1')
    .replace(/ /g, '_')
    .toUpperCase()

  return _name.startsWith('_') ? _name.slice(1) : _name
}
