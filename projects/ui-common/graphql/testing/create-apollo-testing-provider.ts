import { concat, InMemoryCache } from '@apollo/client'
import { APOLLO_OPTIONS } from 'apollo-angular'
import { GraphQLSchema } from 'graphql'

import { graphQLLink } from '../apollo-links/graphql-link'
import { queryProcessingLink } from '../apollo-links/query-processing-link'

/**
 * Creates an `APOLLO_OPTIONS` provider configured like our apps, except with
 * the Apollo HttpLink replaced with a custom GraphQL link that queries from the
 * schema and root provided. The responses to GQL queries should be the same as
 * responses from our api, but the query features are limited to common features
 * necessary for tests. Since we use a C# GraphQL api, it would be a lot of
 * overhead to use that implementation in this project's tests, but you can
 * check our `graphQLLink` to find what features have been implemented to
 * hopefully match the result our api would return.
 *
 * NOTE: This was created because `ApolloTestingModule` is very limited. We
 * mostly use queries intended to emit more than once, but `ApolloTestingModule`
 * can only emit a query response once.
 */
export function createApolloTestingProvider(
  schema: GraphQLSchema,
  rootValue: any
) {
  return {
    provide: APOLLO_OPTIONS,
    useFactory: () => {
      return {
        cache: new InMemoryCache(),
        link: concat(queryProcessingLink, graphQLLink({
          schema,
          rootValue,
        })),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'ignore',
          },
          query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
          },
        }
      }
    }
  }
}
