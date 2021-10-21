import { ApolloLink, Observable, OperationVariables } from '@apollo/client/core'
import { GraphQLSchema, graphqlSync, print } from 'graphql'

export interface GraphQLLinkOptions<TVariables = OperationVariables, TData = any> {
  schema: GraphQLSchema
  rootValue: any
  delay?: number
}

export function graphQLLink(options: GraphQLLinkOptions) {
  return new ApolloLink((operation, forward) => {
    return new Observable(subscriber => {
      const response = graphqlSync({
        schema: options.schema,
        source: print(operation.query),
        rootValue: options.rootValue,
        contextValue: operation.getContext(),
        variableValues: operation.variables,
        operationName: operation.operationName,
        // fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
        // typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
      })

      operation.setContext({ response })

      subscriber.next(response)
      subscriber.complete()

      return () => { }
    })
  })
}
