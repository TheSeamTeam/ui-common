import { DocumentNode, visit } from 'graphql'

/**
 * Removes a variable from the query by removing both the variable definition
 * (e.g. `$where: String` in the operation signature) and argument references
 * with the same name (e.g. `where: $where` in the field arguments).
 *
 * To remove only the definition without touching arguments, use
 * `removeVariableDefinition`.
 */
export function removeVariable(
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
    Argument: {
      enter(variable) {
        const name = variable.name.value
        if (name === variableName) {
          return null
        }
      },
    },
  })
}
