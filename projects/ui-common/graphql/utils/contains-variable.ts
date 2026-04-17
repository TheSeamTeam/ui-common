import { BREAK, DocumentNode, ValueNode, visit } from 'graphql/language'

/**
 * Checks whether a GraphQL document or value node contains a reference to
 * the named variable.
 *
 * This includes references inside variable definitions — a variable that is
 * defined but not used as an argument will still be found. This behavior is
 * relied on by `removeIfNotUsed` processing to avoid removing variables that
 * may be needed after a later inline step.
 */
export function containsVariable(
  node: DocumentNode | ValueNode,
  variableName: string,
) {
  let found = false

  visit(node, {
    Variable(variable) {
      if (variableName === variable.name.value) {
        found = true
        return BREAK
      }
    },
  })

  return found
}
