import { Operation } from '@apollo/client'
import { DocumentNode, OperationDefinitionNode, visit } from 'graphql'

import { isNullOrUndefined } from '@theseam/ui-common/utils'

/**
 * Removes variable definitions from the specified operation when the variable
 * does not have a corresponding value in the provided variables object (i.e.
 * the value is `null` or `undefined`).
 *
 * Unlike `removeVariable`, this only removes the definitions — it does not
 * remove argument references in the query body.
 */
export function removeVariableDefinitionsNotDefined(
  query: DocumentNode,
  node: OperationDefinitionNode,
  variables: Operation['variables'],
) {
  return visit(query, {
    OperationDefinition(opDef) {
      if (opDef === node) {
        return visit(opDef, {
          VariableDefinition(varDef) {
            const name = varDef.variable.name.value
            if (isNullOrUndefined(variables[name])) {
              return null
            }
          },
        })
      }
    },
  })
}
