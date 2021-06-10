import { gql } from 'apollo-angular'
import { parseValue, print } from 'graphql/language'

import { toGQL } from './to-gql'


describe('GraphQL Utils containsVariable', () => {
  it('should determine if variable exists', () => {

    // const where = {
    //   and: [
    //     // { sender: { contains: 'request' } }
    //     { sender: { contains: { gqlVar: '$search' } } }
    //   ]
    // }

    const QUERY = gql`
      query ExampleQuery($skip: Int, $take: Int, $search: String){
        exampleOperation(order: {}, skip: $skip, take: $take, where: {  }) {
          items {
            username
            subject
            body
          }
          totalCount
        }
      }
    `

    // console.log('~QUERY', QUERY)

    // const where = {
    //   and: [
    //     { sender: { contains: 'request' } }
    //   ]
    // }

    // console.log(parseValue(toGQL(where)))

    // console.log(print(QUERY))







    // console.log('~1')
    // const WHERE_QUERY = gql`
    //   {
    //     and: [
    //       { sender: { contains: 'request' } }
    //     ]
    //   }
    // `
    // console.log('~2')

    // console.log('~WHERE_QUERY', WHERE_QUERY)
    // console.log('~~~', print(WHERE_QUERY))

    expect(QUERY).toBeTruthy()
  })
})
