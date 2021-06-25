import { ArgumentNode, FieldNode, OperationDefinitionNode, VariableDefinitionNode, VariableNode } from 'graphql'

import { HintsKind } from './hints-kind'

export interface HintsToken {
  node: OperationDefinitionNode | VariableDefinitionNode | VariableNode | ArgumentNode | FieldNode
  hints: string[]
  kind: HintsKind
}
