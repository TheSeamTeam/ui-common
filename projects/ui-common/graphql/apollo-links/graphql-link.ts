import { ApolloLink, Observable, OperationVariables, TypedDocumentNode } from '@apollo/client/core'
import { DocumentNode, GraphQLSchema, graphqlSync, print } from 'graphql'
import { defer, of } from 'rxjs'

export interface GraphQLLinkOptions<TVariables = OperationVariables, TData = any> {
  schema: GraphQLSchema
  rootValue: any
  delay?: number
}

export function graphQLLink(options: GraphQLLinkOptions) {
  return new ApolloLink((operation, forward) => {
    // const stylePrefix = options?.styles ? '%c' : ''
    // const styles = options?.styles ?? ''
    // const tagLine = `[Operation]: ${options?.tag ?? ''}`
    // const queryStr = print(operation.query)
    // const variablesStr = JSON.stringify(operation.variables, null, 2)
    // console.log(`${stylePrefix}${tagLine}\n${queryStr}\n${variablesStr}`, styles)
    // return forward(operation)

    return new Observable(subscriber => {
      const result = graphqlSync({
        schema: options.schema,
        source: print(operation.query),
        rootValue: options.rootValue,
        // contextValue?: any;
        variableValues: operation.variables,
        operationName: operation.operationName,
        // fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
        // typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
      })

      subscriber.next(result)

      return () => { }
    })

    // return defer(() => {
    //   const result = graphqlSync({
    //     schema: options.schema,
    //     source: print(operation.query),
    //     rootValue: options.rootValue,
    //     // contextValue?: any;
    //     variableValues: operation.variables,
    //     operationName: operation.operationName,
    //     // fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
    //     // typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
    //   })

    //   return of(result)
    // })

  })
}
