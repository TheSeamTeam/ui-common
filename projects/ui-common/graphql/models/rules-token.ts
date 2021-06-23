import { ArgumentNode, FieldNode, OperationDefinitionNode, VariableDefinitionNode, VariableNode } from 'graphql'

import { RulesKind } from './rules-kind'

export interface RulesToken {
  node: OperationDefinitionNode | VariableDefinitionNode | VariableNode | ArgumentNode | FieldNode
  rules: string[]
  kind: RulesKind
}
