import { gql } from 'apollo-angular'

import { HintsKind } from '../models'
import { parseHints } from './parse-hints'

describe('GraphQL Utils parseHints', () => {
  it('should return hint tokens', () => {
    const query = gql`
      # @gql-hint: remove-not-defined
      query TestQuery (
        # General solo comment
        $skip: Int
        # @gql-hint: remove-if-var-not-provided
        $take: Int
      ) {
        example(
          skip: $skip
          # General comment
          # @gql-hint: remove-if-undefined
          take: $take
          where: {
            and: [
              $skip # @gql-hint: remove-if-undefined var-1
              # @gql-hint: remove-if-undefined var-2
              $take
            ]
          }
        ) {
          totalCount
          items {
            thing1
            thing2 # @gql-hint: remove-if-undefined second-hint
            thing3
            # @gql-hint: remove-if-undefined second-hint third-hint
            thing4
          }
        }
      }
    `

    const hints = parseHints(query)

    expect(hints.length).toBe(7)

    expect(hints[0].kind).toBe(HintsKind.OperationDefinition)
    expect(hints[0].hints).toEqual([ 'remove-not-defined' ])

    expect(hints[1].kind).toBe(HintsKind.VariableDefinition)
    expect(hints[1].hints).toEqual([ 'remove-if-var-not-provided' ])

    expect(hints[2].kind).toBe(HintsKind.Argument)
    expect(hints[2].hints).toEqual([ 'remove-if-undefined' ])

    expect(hints[3].kind).toBe(HintsKind.Variable)
    expect(hints[3].hints).toEqual([ 'remove-if-undefined', 'var-1' ])

    expect(hints[4].kind).toBe(HintsKind.Variable)
    expect(hints[4].hints).toEqual([ 'remove-if-undefined', 'var-2' ])

    expect(hints[5].kind).toBe(HintsKind.Field)
    expect(hints[5].hints).toEqual([ 'remove-if-undefined', 'second-hint' ])

    expect(hints[6].kind).toBe(HintsKind.Field)
    expect(hints[6].hints).toEqual([ 'remove-if-undefined', 'second-hint', 'third-hint' ])

    expect(true).toBe(true)
  })
})
