import { gql } from 'apollo-angular'

import { parseRules, RulesKind } from './parse-rules'

describe('GraphQL Utils parseRules', () => {
  it('should return rule tokens', () => {
    const query = gql`
      query TestQuery (
        # General solo comment
        $skip: Int
        # @gql-rule: remove-if-var-not-provided
        $take: Int
      ) {
        example(
          skip: $skip
          # General comment
          # @gql-rule: remove-if-undefined
          take: $take
          where: {
            and: [
              $skip # @gql-rule: remove-if-undefined var-1
              # @gql-rule: remove-if-undefined var-2
              $take
            ]
          }
        ) {
          totalCount
          items {
            thing1
            thing2 # @gql-rule: remove-if-undefined second-rule
            thing3
            # @gql-rule: remove-if-undefined second-rule third-rule
            thing4
          }
        }
      }
    `

    const rules = parseRules(query)

    expect(rules.length).toBe(6)

    expect(rules[0].kind).toBe(RulesKind.VariableDefinition)
    expect(rules[0].rules).toEqual([ 'remove-if-var-not-provided' ])

    expect(rules[1].kind).toBe(RulesKind.Argument)
    expect(rules[1].rules).toEqual([ 'remove-if-undefined' ])

    expect(rules[2].kind).toBe(RulesKind.Variable)
    expect(rules[2].rules).toEqual([ 'remove-if-undefined', 'var-1' ])

    expect(rules[3].kind).toBe(RulesKind.Variable)
    expect(rules[3].rules).toEqual([ 'remove-if-undefined', 'var-2' ])

    expect(rules[4].kind).toBe(RulesKind.Field)
    expect(rules[4].rules).toEqual([ 'remove-if-undefined', 'second-rule' ])

    expect(rules[5].kind).toBe(RulesKind.Field)
    expect(rules[5].rules).toEqual([ 'remove-if-undefined', 'second-rule', 'third-rule' ])

    expect(true).toBe(true)
  })
})
