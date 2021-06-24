/**
 * Remove the variable from the query if it is not defined in the operation
 * variables.
 *
 * Applies to: OperationDefinition
 */
export const GQL_RULE_REMOVE_NOT_DEFINED = 'remove-not-defined'

/**
 * Maps variable value to gql and inlines it into the query.
 *
 * Applies to: Variable, VariableDefinition
 */
export const GQL_RULE_INLINE_VARIABLE = 'inline-variable'

/**
 * Remove variable definition from the query if it is not used by the operation.
 *
 * Applies to: VariableDefinition
 */
// export const GQL_RULE_REMOVE_IF_NOT_USED = 'remove-if-not-used'

export const GQL_RULES = [
  // GQL_RULE_REMOVE_IF_NOT_USED,
  GQL_RULE_REMOVE_NOT_DEFINED,
  GQL_RULE_INLINE_VARIABLE
]
