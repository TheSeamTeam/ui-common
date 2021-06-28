import { ApolloLink, FetchResult, Observable } from '@apollo/client/core'
import { gql } from 'apollo-angular'
import { DocumentNode, print } from 'graphql'

import { HintTransformer, HintTransformOperation } from '../models'
import { printOperationLink } from './print-operation-link'
import { queryProcessingLink } from './query-processing-link'

// const query = gql`
//   query TestQuery (
//     $skip: Int
//     $take: Int
//     $search: String
//     $staticFilter: String
//     $where: String
//   ) {
//     example(
//       skip: $skip
//       take: $take
//       where: {
//         and: [
//           $staticFilter
//           $where
//         ]
//       }
//     ) {
//       totalCount
//       items {
//         thing1
//         thing2
//       }
//     }
//   }
// `


const testResultLink = new ApolloLink(operation => {

  return Observable.of({
    data: { operation }
  })
})

function testHintTransform(
  before: HintTransformOperation,
  afterTransform: HintTransformOperation
) {
  const query = before.query
  const variables = before.variables

  const link =
    // printOperationLink({ tag: 'Before', styles: 'color:cyan' })
    // .concat(queryProcessingLink)
    queryProcessingLink
    // .concat(printOperationLink({ tag: 'After', styles: 'color:limegreen' }))
    .concat(testResultLink)

  ApolloLink.execute(link, { query, variables }).subscribe(v => {
    expect(print(v.data?.operation.query)).toBe(print(afterTransform.query))
    expect(before.variables).toEqual(afterTransform.variables)
  })
}

describe('GraphQL apollo-links queryProcessingLink', () => {

  describe('Hint "remove-not-defined"', () => {
    it('should work on OperationDefinition node', () => {
      testHintTransform(
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery ($search: String) {
              example {
                totalCount
                items {
                  thing1
                  thing2
                }
              }
            }
          `,
          variables: { search: undefined }
        },
        {
          query: gql`
            query TestQuery {
              example {
                totalCount
                items {
                  thing1
                  thing2
                }
              }
            }
          `,
          variables: { search: undefined }
        }
      )
    })
  })

  describe('Hint "inline-variable"', () => {
    it('should work on VariableDefinition node', () => {
      testHintTransform(
        {
          query: gql`
            query TestQuery (
              # @gql-hint: inline-variable
              $search: String
            ) {
              example(where: $where) {
                totalCount
                items {
                  thing1
                  thing2
                }
              }
            }
          `,
          variables: { where: { and: [ { thing1: { eq: 'test' } } ] } }
        },
        {
          query: gql`
          query TestQuery {
            example {
              totalCount
              items {
                thing1
                thing2
              }
            }
          }
        `,
          variables: {}
        }
      )
    })
  })

  // describe('Hint "remove-not-used"', () => {
  //   it('', () => {
  //     testHintTransform(
  //       {
  //         query: ,
  //         variables:
  //       },
  //       {
  //         query: ,
  //         variables:
  //       }
  //     )
  //   })
  // })
})
