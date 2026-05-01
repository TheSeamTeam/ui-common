import { GQLDirection } from '../models'

// Naive initial implementation. This is intended for dynamic values, such as
// sorting and filtering. If you are defining a schema, use the gql template
// function from 'apollo-angular'.
//
// TODO: Try to find a maintained library that will handle this. Ideally a
// type-safe one, but that is becoming surprisingly harder to find than I
// expected for GraphQL.
export function toGQL(value: any): string {
  if (Array.isArray(value)) {
    return formatArray(value)
  }
  if (value instanceof GQLDirection) {
    return value.direction
  }
  if (isPlainObject(value)) {
    return formatObject(value)
  }
  return formatScalar(value)
}

function isPlainObject(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function formatScalar(value: any): string {
  // `null` is a valid GraphQL literal with distinct semantics from omission
  // (e.g. `where: { x: { eq: null } }` filters where `x` IS null). `undefined`
  // has no GraphQL representation, so we fail fast rather than silently
  // coercing to `null` — callers should remove the field instead.
  if (value === undefined) {
    throw new Error(
      `toGQL: cannot convert 'undefined' to a GraphQL value. Omit the field, or pass 'null' explicitly.`,
    )
  }
  if (value === null) {
    return 'null'
  }
  if (typeof value === 'string') {
    return `"${value}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`
  }
  // Anything else (function, symbol, bigint, non-plain object instance such
  // as Date / Map / RegExp / a class instance other than GQLDirection) has no
  // safe GraphQL representation. Coercing via template literal would silently
  // produce nonsense like "function Date() { [native code] }" or
  // "[object Date]". Fail loudly instead.
  throw new Error(
    `toGQL: cannot convert value of type '${typeof value}' (${Object.prototype.toString.call(value)}) to a GraphQL value.`,
  )
}

function formatArray(arr: any[]): string {
  return `[${arr.map((v) => toGQL(v)).join(',')}]`
}

function formatObject(obj: Record<string, any>): string {
  if (Object.prototype.hasOwnProperty.call(obj, 'gqlVar')) {
    return `${obj['gqlVar']}`
  }
  if (Object.prototype.hasOwnProperty.call(obj, 'gqlEnum')) {
    return `${obj['gqlEnum']}`
  }
  const props = Object.keys(obj).map((key) => `${key}: ${toGQL(obj[key])}`)
  return `{${props.join(', ')}}`
}
