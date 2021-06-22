import { ApolloLink, FetchResult, Observable } from '@apollo/client/core'
import { gql } from 'apollo-angular'
import { print } from 'graphql'

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


export const testResultLink = new ApolloLink(operation => {

  return Observable.of({
    data: { operation }
  })
})

describe('GraphQL apollo-links queryProcessingLink', () => {
  it('should execute link', () => {
    const query = gql`
      query TestQuery (
        # @gql-rule: remove-if-not-used
        $search: String
      ) {
        example {
          totalCount
          items {
            thing1
            thing2
          }
        }
      }
    `

    const link = printOperationLink({ tag: 'Before', styles: 'color:cyan' })
      .concat(queryProcessingLink)
      .concat(printOperationLink({ tag: 'After', styles: 'color:limegreen' }))
      .concat(testResultLink)

    ApolloLink.execute(link, {
      query,
      // variables: { search: 'test' },
      variables: { search: undefined },
      // extensions: { cache: true },
    }).subscribe(v => {
      console.log('v', v)
      expect(print(v.data?.operation)).toBe(
        'query TestQuery ($search: String) {' +
        '  example() {' +
        '    totalCount' +
        '    items {' +
        '      thing1' +
        '      thing2' +
        '    }' +
        '  }' +
        '}'
      )
    })

    // ApolloLink.execute(link, {
    //   query,
    //   variables: { id: 1 },
    //   // extensions: { cache: true },
    // }).subscribe(v => {
    //   console.log('v', v)
    // })

    expect(true).toBe(true)
  })
})
