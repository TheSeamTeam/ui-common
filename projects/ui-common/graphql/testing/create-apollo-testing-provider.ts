import { concat, InMemoryCache } from '@apollo/client'
import { provideApollo } from 'apollo-angular'
import { Provider } from '@angular/core'
import { GraphQLSchema } from 'graphql'

import { graphQLLink } from '../apollo-links/graphql-link'
import { queryProcessingLink } from '../apollo-links/query-processing-link'

/**
 * Creates Apollo providers configured like our apps, except with the Apollo
 * HttpLink replaced with a custom GraphQL link that queries from the schema
 * and root value provided. Responses match what our real API returns, but
 * query features are limited to what `graphQLLink` implements.
 *
 * NOTE: This was created because `ApolloTestingModule` is very limited. We
 * mostly use queries intended to emit more than once, but `ApolloTestingModule`
 * can only emit a query response once.
 */
export function createApolloTestingProvider(
  schema: GraphQLSchema,
  rootValue: any,
): Provider {
  return provideApollo(() => ({
    cache: new InMemoryCache(),
    link: concat(
      queryProcessingLink,
      graphQLLink({
        schema,
        rootValue,
      }),
    ),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  }))
}
