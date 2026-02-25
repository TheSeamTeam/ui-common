import { ApolloLink } from '@apollo/client/core'
import { print } from 'graphql'

export interface LogQueryLinkOptions {
  beforeStyles?: string
  afterStyles?: string
}

/**
 * Wraps an Apollo link and logs the operation state immediately before and
 * after the wrapped link processes it.
 *
 * Useful for inspecting what `queryProcessingLink` does to a query:
 *
 * ```ts
 * link: concat(
 *   logQueryLink(queryProcessingLink),
 *   httpLink,
 * )
 * ```
 *
 * The output uses `console.log` with optional CSS styles so each snapshot
 * is easy to distinguish in the browser console. Tree-shaking will remove
 * this from production builds when it is not imported.
 */
export function logQueryLink(
  inner: ApolloLink,
  options?: LogQueryLinkOptions,
): ApolloLink {
  const beforeStyles = options?.beforeStyles ?? 'color: cyan'
  const afterStyles = options?.afterStyles ?? 'color: limegreen'

  const beforeLink = new ApolloLink((operation, forward) => {
    // eslint-disable-next-line no-console
    console.log(
      `%c~~~BEFORE\n${print(operation.query)}\n${JSON.stringify(operation.variables, null, 2)}`,
      beforeStyles,
    )
    return forward(operation)
  })

  const afterLink = new ApolloLink((operation, forward) => {
    // eslint-disable-next-line no-console
    console.log(
      `%c~~~AFTER\n${print(operation.query)}\n${JSON.stringify(operation.variables, null, 2)}`,
      afterStyles,
    )
    return forward(operation)
  })

  return ApolloLink.from([beforeLink, inner, afterLink])
}
