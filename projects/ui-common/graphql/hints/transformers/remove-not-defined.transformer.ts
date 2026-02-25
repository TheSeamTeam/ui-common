import { OperationDefinitionNode } from 'graphql'

import { isNullOrUndefined } from '@theseam/ui-common/utils'

import {
  HintsToken,
  HintTransformer,
  HintTransformOperation,
} from '../../models'
import { removeVariable } from '../../utils'

/**
 * Removes every variable from the query that is null or undefined in the
 * operation's variables map. Both the variable definition (from the parameter
 * list) and any argument usages in the query body are removed so the resulting
 * document remains valid.
 */
export const removeNotDefinedTransformer: HintTransformer = (
  operation: HintTransformOperation,
  hintsToken: HintsToken,
): HintTransformOperation => {
  const operationNode = hintsToken.node as OperationDefinitionNode

  const undefinedVarNames = (operationNode.variableDefinitions ?? [])
    .filter((varDef) =>
      isNullOrUndefined(operation.variables[varDef.variable.name.value]),
    )
    .map((varDef) => varDef.variable.name.value)

  let query = operation.query
  for (const varName of undefinedVarNames) {
    query = removeVariable(query, varName)
  }

  return { query, variables: operation.variables }
}
