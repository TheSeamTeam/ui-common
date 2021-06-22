import { Provider } from '@angular/core'

import { ApolloLink, concat, InMemoryCache } from '@apollo/client/core'
import { isNullOrUndefined, withoutProperty } from '@theseam/ui-common/utils'
import { APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLink } from 'apollo-angular/http'
import { parse, parseValue, print } from 'graphql/language'

import { QueryProcessingConfig } from '../models'
import { GQL_RULE_REMOVE_IF_NOT_USED } from '../rules'
import { containsVariable, inlineVariable, parseRules, removeVariable, removeVariableDefinition, toGQL } from '../utils'

export const queryProcessingLink = new ApolloLink((operation, forward) => {
  console.log('~link operation', operation)

  const context = operation.getContext()
  const queryProcessingConfig: QueryProcessingConfig = context.queryProcessingConfig || {}

  // console.log(operation.query)

  const rules = parseRules(operation.query)
  console.log('rules', rules)

  const removeIfNotDefined = rules.filter(r => r.rules.indexOf(GQL_RULE_REMOVE_IF_NOT_USED) !== -1)
  console.log('removeIfNotDefined', removeIfNotDefined)


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

  return forward(operation)
})
