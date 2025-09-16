import { Kind } from 'graphql'

export enum HintsKind {
  OperationDefinition = Kind.OPERATION_DEFINITION,
  Field = Kind.FIELD,
  VariableDefinition = Kind.VARIABLE_DEFINITION,
  Variable = Kind.VARIABLE,
  Argument = Kind.ARGUMENT
}
