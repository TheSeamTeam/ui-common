import { GQLDirection } from '../models'

// Naive initial implementation. This is intended for dynamic values, such as
// sorting and filtering. If you are defining a schema, use the gql template
// function from 'apollo-angular'.
//
// TODO: Try to find a maintained library that will handle this. Ideally a
// type-safe one, but that is becoming surprisingly harder to find than I
// expected for GraphQL.
export function toGQL(json: any): string {
  const props: string[] = Object.keys(json).map(prop => {
    const value = json[prop]
    let resultValue: string | undefined
    if (typeof value === 'string') {
      resultValue = `"${value}"`
    } else if (value instanceof GQLDirection) {
      resultValue = `${value.direction}`
    } else if (Array.isArray(value)) {
      resultValue = `[${value.map(v => toGQL(v)).join(',')}]`
    } else if (typeof value === 'object') {
      if (Object.prototype.hasOwnProperty.call(value, 'gqlVar')) {
        resultValue = `${value.gqlVar}`
      } else {
        resultValue = toGQL(value)
      }
    } else {
      resultValue = `${value}`
    }
    if (typeof resultValue !== 'string') {
      throw Error(`Unexpected value.`)
    }
    return `${prop}: ${resultValue}`
  })
  return `{${props.join(', ')}}`
}
