import { ApolloLink, Observable, Operation } from '@apollo/client/core'
import { Kind, OperationDefinitionNode, valueFromASTUntyped } from 'graphql'

export interface MockGraphQLLinkOptions {
  resolve: (operation: Operation) => any
  delay?: number
}

/**
 * Extracts the effective field arguments from the top-level selections of a
 * processed query, merging inlined literal values back with the remaining
 * operation variables.
 *
 * When {@link queryProcessingLink} inlines a variable (e.g. `where`) into the
 * query AST, it removes that variable from `operation.variables`. A real
 * GraphQL server would still resolve the inlined literal when executing the
 * field resolver, but a mock link that only looks at `operation.variables`
 * would miss it. This function bridges that gap.
 */
function resolveEffectiveVariables(operation: Operation): Record<string, any> {
  const merged: Record<string, any> = { ...operation.variables }

  const opDef = operation.query.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION,
  )
  if (!opDef) return merged

  for (const sel of opDef.selectionSet.selections) {
    if (sel.kind === Kind.FIELD && sel.arguments) {
      for (const arg of sel.arguments) {
        if (arg.value.kind !== Kind.VARIABLE) {
          merged[arg.name.value] = valueFromASTUntyped(
            arg.value,
            operation.variables,
          )
        }
      }
    }
  }

  return merged
}

export function mockGraphQLLink(options: MockGraphQLLinkOptions) {
  return new ApolloLink((operation, forward) => {
    return new Observable((subscriber) => {
      const execute = () => {
        operation.variables = resolveEffectiveVariables(operation)
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
