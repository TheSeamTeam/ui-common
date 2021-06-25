import { HintTransformOperation } from './hint-transform-operation'

export type HintTransformer = (operation: HintTransformOperation) => HintTransformOperation
