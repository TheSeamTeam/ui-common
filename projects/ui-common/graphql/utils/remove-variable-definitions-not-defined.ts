import { Operation } from '@apollo/client'
import { DocumentNode, OperationDefinitionNode, visit } from 'graphql'

import { isNullOrUndefined } from '@theseam/ui-common/utils'

export function removeVariableDefinitionsNotDefined(
  query: DocumentNode,
  node: OperationDefinitionNode,
  variables: Operation['variables']
) {
  return visit(query, {
    OperationDefinition(opDef) {
      if (opDef === node) {
        return visit(opDef, {
          VariableDefinition(varDef) {
            const name = varDef.variable.name.value
            console.log('check', name)
            if (isNullOrUndefined(variables[name])) {
              console.log('\tremove', name)
              return null
            }
          }
        })
      }
    }
  })
}
