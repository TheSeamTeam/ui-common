import { ApolloLink } from '@apollo/client/core'

import { QueryProcessingConfig } from '../models'
import { processGql } from '../utils'

/**
 * Apollo link that transforms GraphQL operations before they are sent.
 *
 * Two mechanisms are supported and can be combined freely:
 *
 * **Hint-based** — place `# @gql-hint: <name>` comments directly in the query.
 * Supported hints:
 * - `remove-not-defined` on the operation definition: removes every variable
 *   whose value is null/undefined (definition + argument usage).
 * - `inline-variable` on a variable definition or usage: substitutes the
 *   variable's current value directly into the query AST and removes it from
 *   the variables map.
 *
 * **Config-based** — pass a `QueryProcessingConfig` via Apollo context under
 * the key `queryProcessingConfig`. Supported options:
 * - `variables.removeIfNotDefined`: remove named variables when null/undefined.
 * - `variables.removeIfNotUsed`: remove named variable definitions when the
 *   variable is not referenced anywhere in the (possibly already-transformed)
 *   query body.
 * - `variables.inline`: inline named variables into the query AST.
 * - `variables.orderTiebreaker`: append a fallback sort field for deterministic
 *   pagination.
 *
 * Hints are applied first, then config-based processing.
 */
export const queryProcessingLink = new ApolloLink((operation, forward) => {
  const context = operation.getContext()
  const queryProcessingConfig: QueryProcessingConfig =
    context.queryProcessingConfig ?? {}

  const result = processGql(
    operation.query,
    operation.variables,
    queryProcessingConfig,
  )
  operation.query = result.query
  operation.variables = result.variables

  return forward(operation)
})
