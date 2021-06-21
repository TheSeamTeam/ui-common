import { DocumentNode, visit } from 'graphql'

export function removeVariableDefinition(query: DocumentNode, variableName: string): DocumentNode {
  return visit(query, {
    VariableDefinition: {
      enter(variable) {
        const name = variable.variable.name.value
        if (name === variableName) {
          return null
        }
      }
    }
  })
}
