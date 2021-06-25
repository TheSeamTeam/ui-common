import { Provider } from '@angular/core'

import { ApolloLink, concat, InMemoryCache } from '@apollo/client/core'
import { isNullOrUndefined, notNullOrUndefined, withoutProperty } from '@theseam/ui-common/utils'
import { APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLink } from 'apollo-angular/http'
import { OperationDefinitionNode, parse, parseValue, print, ValueNode, VariableDefinitionNode, VariableNode } from 'graphql'

import {
  // GQL_HINT_INLINE_VARIABLE,
  // GQL_HINT_REMOVE_IF_NOT_USED,
  // GQL_HINT_REMOVE_NOT_DEFINED

  inlineVariableHintDef,
  removeNotDefinedHintDef
} from '../hints'
import { HintsKind, QueryProcessingConfig } from '../models'
import {
  containsVariable,
  hintsTokensContainingHint,
  inlineVariable,
  parseAst,
  parseHints,
  removeVariable,
  removeVariableDefinition,
  removeVariableDefinitionsNotDefined,
  toGQL
} from '../utils'

export const queryProcessingLink = new ApolloLink((operation, forward) => {
  console.log('~link operation', operation)

  const context = operation.getContext()
  const queryProcessingConfig: QueryProcessingConfig = context.queryProcessingConfig || {}

  // console.log(operation.query)

  // const rules = parseHints(operation.query)
  let _ast = parseAst(operation.query)
  const rules = parseHints(_ast)
  console.log('rules', rules)


  const removeNotDefined = hintsTokensContainingHint(rules, removeNotDefinedHintDef.name)
  console.log('removeNotDefined', removeNotDefined)
  for (const rulesToken of removeNotDefined) {
    _ast = removeVariableDefinitionsNotDefined(_ast, rulesToken.node as OperationDefinitionNode, operation.variables)
  }

  const inlineVariableRulesTokens = hintsTokensContainingHint(rules, inlineVariableHintDef.name)
  console.log('inlineVariableRulesTokens', inlineVariableRulesTokens)
  for (const rulesToken of inlineVariableRulesTokens) {
    let varName: string | null = null
    let varDefaultValue: ValueNode | undefined
    if (rulesToken.kind === HintsKind.VariableDefinition) {
      varName = (rulesToken.node as VariableDefinitionNode).variable.name.value
      varDefaultValue = (rulesToken.node as VariableDefinitionNode).defaultValue
    } else if (rulesToken.kind === HintsKind.Variable) {
      varName = (rulesToken.node as VariableNode).name.value
    }

    if (varName === null) {
      // TODO: Throw error here?
      continue
    }

    const varValue = operation.variables[varName]


    operation.variables = withoutProperty(operation.variables, varName)
    _ast = removeVariableDefinition(_ast, varName)

    const varValueNode =
    _ast = inlineVariable(_ast, varName, parseValue(toGQL(varValue)))
  }



  // const removeIfNotDefined = hintsTokensContainingHint(rules, GQL_HINT_REMOVE_IF_NOT_USED)
  // console.log('removeIfNotDefined', removeIfNotDefined)





  // const _operation = operation

  // const removeIdNotDefined = (queryProcessingConfig?.variables?.removeIfNotDefined || [])
  // for (const varName of removeIdNotDefined) {
  //   if (isNullOrUndefined(operation.variables[varName])) {
  //     _operation.query = removeVariable(_operation.query, varName)
  //   }
  // }

  // const removeIfNotUsed = (queryProcessingConfig?.variables?.removeIfNotUsed || [])
  // for (const varName of removeIfNotUsed) {
  //   if (!containsVariable(_operation.query, varName)) {
  //     _operation.query = removeVariable(_operation.query, varName)
  //   }
  // }

  // const inlineVariables = (queryProcessingConfig?.variables?.inline || [])
  // for (const varName of inlineVariables) {
  //   const varValue = _operation.variables[varName]
  //   _operation.variables = withoutProperty(_operation.variables, varName)
  //   _operation.query = removeVariableDefinition(_operation.query, varName)
  //   _operation.query = inlineVariable(_operation.query, varName, parseValue(toGQL(varValue)))
  // }

  operation.query = _ast

  return forward(operation)
})
