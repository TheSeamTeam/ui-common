import { HintTransformOperation } from './hint-transform-operation'
import { HintsToken } from './hints-token'

export type HintTransformer = (operation: HintTransformOperation, hintsToken: HintsToken) => HintTransformOperation
