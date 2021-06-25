// /**
//  * Remove the variable from the query if it is not defined in the operation
//  * variables.
//  *
//  * Applies to: OperationDefinition
//  */
// export const GQL_HINT_REMOVE_NOT_DEFINED = 'remove-not-defined'

// /**
//  * Maps variable value to gql and inlines it into the query.
//  *
//  * Applies to: Variable, VariableDefinition
//  */
// export const GQL_HINT_INLINE_VARIABLE = 'inline-variable'

// /**
//  * Remove variable definition from the query if it is not used by the operation.
//  *
//  * Applies to: VariableDefinition
//  */
// // export const GQL_HINT_REMOVE_IF_NOT_USED = 'remove-if-not-used'

// export const GQL_HINTS = [
//   // GQL_HINT_REMOVE_IF_NOT_USED,
//   GQL_HINT_REMOVE_NOT_DEFINED,
//   GQL_HINT_INLINE_VARIABLE
// ]

export * from './transformers/inline-variable.transformer'
export * from './transformers/remove-not-defined.transformer'

export * from './inline-variable.hint-def'
export * from './remove-not-defined.hint-def'

