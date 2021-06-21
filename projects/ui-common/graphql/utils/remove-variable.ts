import { DocumentNode, visit } from 'graphql'

export function removeVariable(query: DocumentNode, variableName: string): DocumentNode {
  return visit(query, {
    VariableDefinition: {
      enter(variable) {
        const name = variable.variable.name.value
        if (name === variableName) {
          return null
        }
      }
    },
    Argument: {
      enter(variable) {
        const name = variable.name.value
        if (name === variableName) {
          return null
        }
      }
    }
  })
}
