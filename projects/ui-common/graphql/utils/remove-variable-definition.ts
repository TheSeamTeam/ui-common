import { DocumentNode, visit } from 'graphql'

/**
 * Removes a variable's definition from the query (e.g. `$where: String` in the
 * operation signature). Does not remove argument references to that variable in
 * the query body.
 *
 * To remove both the definition and argument references, use `removeVariable`.
 */
export function removeVariableDefinition(
  query: DocumentNode,
  variableName: string,
): DocumentNode {
  return visit(query, {
    VariableDefinition: {
      enter(variable) {
        const name = variable.variable.name.value
        if (name === variableName) {
          return null
        }
      },
    },
  })
}
