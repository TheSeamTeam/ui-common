import { Provider } from '@angular/core'

import { ApolloLink, concat, InMemoryCache } from '@apollo/client/core'
import { isNullOrUndefined, withoutProperty } from '@theseam/ui-common/utils'
import { APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLink } from 'apollo-angular/http'
import { parse, parseValue, print } from 'graphql/language'

import { QueryProcessingConfig } from '../models'
import { containsVariable, inlineVariable, removeVariable, removeVariableDefinition, toGQL } from '../utils'



const queryProcessingLink = new ApolloLink((operation, forward) => {
  // console.log('~link operation', operation)

  // console.log('comments', parseComments(operation.query))

  // TODO: Consider adding configuration to the queries with comments.
  // if (operation.query.loc) {
  //   const ast = parse(operation.query.loc.source, {
  //     allowLegacySDLImplementsInterfaces: false,
  //     experimentalFragmentVariables: true,
  //   })
  //   console.log('comments', parseComments(ast), ast)
  // }

  const context = operation.getContext()
  const queryProcessingConfig: QueryProcessingConfig = context.queryProcessingConfig || {}

  // console.log(operation.query)

  const _operation = operation
  // console.log(
  //   `%c~~~BEFORE\n${print(_operation.query)}\n${JSON.stringify(_operation.variables, null, 2)}`,
  //   'color: cyan'
  // )

  const removeIdNotDefined = (queryProcessingConfig?.variables?.removeIfNotDefined || [])
  for (const varName of removeIdNotDefined) {
    if (isNullOrUndefined(operation.variables[varName])) {
      _operation.query = removeVariable(_operation.query, varName)
    }
  }

  const removeIfNotUsed = (queryProcessingConfig?.variables?.removeIfNotUsed || [])
  for (const varName of removeIfNotUsed) {
    if (!containsVariable(_operation.query, varName)) {
      _operation.query = removeVariable(_operation.query, varName)
    }
  }

  const inlineVariables = (queryProcessingConfig?.variables?.inline || [])
  for (const varName of inlineVariables) {
    const varValue = _operation.variables[varName]
    _operation.variables = withoutProperty(_operation.variables, varName)
    _operation.query = removeVariableDefinition(_operation.query, varName)
    _operation.query = inlineVariable(_operation.query, varName, parseValue(toGQL(varValue)))
  }

  // console.log(
  //   `%c~~~AFTER\n${print(_operation.query)}\n${JSON.stringify(_operation.variables, null, 2)}`,
  //   'color: limegreen'
  // )
  return forward(operation)
})

// export const ApolloOptionsProvider: Provider = {
//   provide: APOLLO_OPTIONS,
//   useFactory: (httpLink: HttpLink) => {
//     return {
//       cache: new InMemoryCache(),
//       link: concat(queryProcessingLink, httpLink.create({
//         uri: environment.graphqlUrl,
//       })),
//       connectToDevtools: true
//     }
//   },
//   deps: [HttpLink],
// }
