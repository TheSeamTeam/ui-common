import { ApolloLink } from '@apollo/client/core'
import { isNullOrUndefined, withoutProperty } from '@theseam/ui-common/utils'
import { parseValue } from 'graphql'

import { inlineVariableHintDef, removeNotDefinedHintDef } from '../hints'
import { QueryProcessingConfig } from '../models'
import {
  containsVariable,
  hintsTokensContainingHint,
  inlineVariable,
  parseAst,
  parseHints,
  removeVariable,
  removeVariableDefinition,
  toGQL,
} from '../utils'

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
 *
 * Hints are applied first, then config-based processing.
 */
export const queryProcessingLink = new ApolloLink((operation, forward) => {
  const context = operation.getContext()
  const queryProcessingConfig: QueryProcessingConfig =
    context.queryProcessingConfig ?? {}

  // Reparse to ensure token/comment info is present for hint parsing.
  let _ast = parseAst(operation.query)
  const rules = parseHints(_ast)

  // ---- Hint: remove-not-defined ----------------------------------------
  for (const hintsToken of hintsTokensContainingHint(
    rules,
    removeNotDefinedHintDef.name,
  )) {
    const result = removeNotDefinedHintDef.transformer!(
      { query: _ast, variables: operation.variables },
      hintsToken,
    )
    _ast = result.query
    operation.variables = result.variables
  }

  // ---- Hint: inline-variable --------------------------------------------
  for (const hintsToken of hintsTokensContainingHint(
    rules,
    inlineVariableHintDef.name,
  )) {
    const result = inlineVariableHintDef.transformer!(
      { query: _ast, variables: operation.variables },
      hintsToken,
    )
    _ast = result.query
    operation.variables = result.variables
  }

  // ---- Config: removeIfNotDefined ---------------------------------------
  for (const varName of queryProcessingConfig?.variables?.removeIfNotDefined ??
    []) {
    if (isNullOrUndefined(operation.variables[varName])) {
      _ast = removeVariable(_ast, varName)
    }
  }

  // ---- Config: removeIfNotUsed -----------------------------------------
  // Intentionally runs after removeIfNotDefined so that variables which were
  // only referenced inside another (now-removed) variable can be cleaned up.
  for (const varName of queryProcessingConfig?.variables?.removeIfNotUsed ??
    []) {
    if (!containsVariable(_ast, varName)) {
      _ast = removeVariable(_ast, varName)
    }
  }

  // ---- Config: inline --------------------------------------------------
  for (const varName of queryProcessingConfig?.variables?.inline ?? []) {
    const varValue = operation.variables[varName]
    operation.variables = withoutProperty(operation.variables, varName)
    _ast = removeVariableDefinition(_ast, varName)
    _ast = inlineVariable(_ast, varName, parseValue(toGQL(varValue)))
  }

  operation.query = _ast
  return forward(operation)
})
