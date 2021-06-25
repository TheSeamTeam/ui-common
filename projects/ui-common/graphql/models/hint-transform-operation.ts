import { DocumentNode } from 'graphql'

export interface HintTransformOperation {
  query: DocumentNode
  variables: Record<string, any>
}
