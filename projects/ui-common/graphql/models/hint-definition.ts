import { ASTNode } from 'graphql'
import { HintTransformer } from './hint-transformer'

export interface HintDefinition {
  readonly name: string

  readonly appliesTo: ASTNode['kind'][]

  readonly transformer?: HintTransformer
}
