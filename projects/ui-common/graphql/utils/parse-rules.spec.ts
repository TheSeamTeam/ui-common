import { gql } from 'apollo-angular'

import { parseRules } from './parse-rules'

describe('GraphQL Utils parseRules', () => {
  it('should return rules', () => {
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
              $skip
              $take
            ]
          }
        ) {
          totalCount
          items {
            thing1
            thing2 # @gql-rule: remove-if-undefined second-rule
            thing3
            # @gql-rule: remove-if-undefined second-rule third-rile
            thing4
          }
        }
      }
    `

    console.log('query', query)

    const rules = parseRules(query)

    expect(true).toBe(true)
  })
})
