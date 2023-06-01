import { ApolloLink } from '@apollo/client/core'
import { print } from 'graphql'

export interface PrintOperationLinkOptions {
  tag?: string
  styles?: string
}

export function printOperationLink(options?: PrintOperationLinkOptions) {
  return new ApolloLink((operation, forward) => {
    const stylePrefix = options?.styles ? '%c' : ''
    const styles = options?.styles ?? ''
    const tagLine = `[Operation]: ${options?.tag ?? ''}`
    const queryStr = print(operation.query)
    const variablesStr = JSON.stringify(operation.variables, null, 2)
    // eslint-disable-next-line no-console
    console.log(`${stylePrefix}${tagLine}\n${queryStr}\n${variablesStr}`, styles)
    return forward(operation)
  })
}
