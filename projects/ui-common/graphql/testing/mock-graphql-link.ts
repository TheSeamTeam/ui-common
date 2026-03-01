import { ApolloLink, Observable, Operation } from '@apollo/client/core'

export interface MockGraphQLLinkOptions {
  resolve: (operation: Operation) => any
  delay?: number
}

export function mockGraphQLLink(options: MockGraphQLLinkOptions) {
  return new ApolloLink((operation, forward) => {
    return new Observable((subscriber) => {
      const execute = () => {
        const response = options.resolve(operation)
        operation.setContext({ response })
        subscriber.next(response)
        subscriber.complete()
      }

      if (options.delay && options.delay > 0) {
        const timeoutId = setTimeout(execute, options.delay)
        return () => clearTimeout(timeoutId)
      }

      execute()
      return () => {}
    })
  })
}
