import { parseValue, VariableDefinitionNode, VariableNode } from 'graphql'

import { withoutProperty } from '@theseam/ui-common/utils'

import {
  HintsKind,
  HintsToken,
  HintTransformer,
  HintTransformOperation,
} from '../../models'
import { inlineVariable, removeVariableDefinition, toGQL } from '../../utils'

/**
 * Inlines the variable's current value directly into the query AST and removes
 * the variable definition from the parameter list. The variable is also
 * removed from the operation's variables map so it is not sent to the server.
 *
 * Applies to VariableDefinition (comment above the `$var` in the parameter
 * list) or Variable (inline comment beside a `$var` usage in the query body).
 */
export const inlineVariableTransformer: HintTransformer = (
  operation: HintTransformOperation,
  hintsToken: HintsToken,
): HintTransformOperation => {
  let varName: string | null = null

  if (hintsToken.kind === HintsKind.VariableDefinition) {
    varName = (hintsToken.node as VariableDefinitionNode).variable.name.value
  } else if (hintsToken.kind === HintsKind.Variable) {
    varName = (hintsToken.node as VariableNode).name.value
  }

  if (varName === null) {
    return operation
  }

  const varValue = operation.variables[varName]
  const newVariables = withoutProperty(operation.variables, varName)
  let query = removeVariableDefinition(operation.query, varName)
  query = inlineVariable(query, varName, parseValue(toGQL(varValue)))

  return { query, variables: newVariables }
}
