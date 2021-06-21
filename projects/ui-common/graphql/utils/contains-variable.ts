import { BREAK, DocumentNode, ValueNode, visit } from 'graphql/language'

export function containsVariable(node: DocumentNode | ValueNode, variableName: string) {
  let found = false

  visit(node, {
    Variable(variable) {
      if (variableName === variable.name.value) {
        found = true
        return BREAK
      }
    }
  })

  return found
}
