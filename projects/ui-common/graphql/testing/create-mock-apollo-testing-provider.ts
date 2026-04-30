import { concat, InMemoryCache, Operation } from '@apollo/client'
import { provideApollo } from 'apollo-angular'
import { Provider } from '@angular/core'

import { queryProcessingLink } from '../apollo-links/query-processing-link'
import { mockGraphQLLink } from './mock-graphql-link'
import { logQueryLink } from '../apollo-links'

export interface MockApolloTestingProviderOptions {
  resolve: (operation: Operation) => any
  delay?: number
  logQueryLink?: boolean
}

/**
 * Creates Apollo providers configured like our apps, except with the Apollo
 * HttpLink replaced with a mock link that delegates to a `resolve` callback.
 * No GraphQL schema is required — the resolve function returns the response
 * directly, typically using `filteredResults` for sorting/filtering/paging.
 */
export function createMockApolloTestingProvider(
  options: MockApolloTestingProviderOptions,
): Provider {
  return provideApollo(() => ({
    cache: new InMemoryCache(),
    link: concat(
      options.logQueryLink
        ? logQueryLink(queryProcessingLink)
        : queryProcessingLink,
      mockGraphQLLink({
        resolve: options.resolve,
        delay: options.delay,
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
