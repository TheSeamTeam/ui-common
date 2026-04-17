import { isDevMode } from '@angular/core'

import { hasProperty } from '@theseam/ui-common/utils'
import { BREAK, DocumentNode, ValueNode, visit } from 'graphql'

/**
 * Replaces all references to a variable in the query body with a literal
 * value. If the value represents `undefined`, the variable references are
 * removed from the query instead.
 *
 * This does not remove the variable definition — use `removeVariableDefinition`
 * separately if needed.
 */
export function inlineVariable(
  query: DocumentNode,
  variableName: string,
  variableValue: ValueNode,
): DocumentNode {
  // return visit(query, {
  //   VariableDefinition(node) {
  //     if (variableName === node.variable.name.value) {
  //       console.log(node)
  //       // found = true
  //       console.log('insert', variableValue)
  //       // return BREAK

  //       // node.defaultValue = variableValue
  //       return {
  //         ...node,
  //         defaultValue: variableValue
  //       }
  //     }
  //   }
  // })

  // console.log('~inlineVariable', variableName, variableValue)

  // TODO: Decide if this is a good solution.
  if (
    hasProperty(variableValue as any, 'value') &&
    (variableValue as any).value === 'undefined'
  ) {
    if (isDevMode()) {
      // eslint-disable-next-line no-console
      console.warn(
        `Ignoring attempt to inline '${variableName}', because it is undefined.`,
      )
    }
    return visit(query, {
      SelectionSet(selectionSetNode) {
        return visit(selectionSetNode, {
          Variable(variableNode) {
            if (variableName === variableNode.name.value) {
              return null
            }
          },
        })
      },
    })
  }

  return visit(query, {
    SelectionSet(selectionSetNode) {
      return visit(selectionSetNode, {
        Variable(variableNode) {
          if (variableName === variableNode.name.value) {
            return variableValue
          }
        },
      })
    },
  })
}
