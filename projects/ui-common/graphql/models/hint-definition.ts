import { HintTransformer } from './hint-transformer'
import { HintsKind } from './hints-kind'

export interface HintDefinition {
  readonly name: string

  readonly appliesTo: HintsKind[]

  readonly transformer?: HintTransformer
}
