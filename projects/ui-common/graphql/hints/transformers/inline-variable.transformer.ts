import { HintTransformer, HintTransformOperation } from '../../models'

export const inlineVariableTransformer: HintTransformer = (operation: HintTransformOperation): HintTransformOperation => {
  const query = operation.query
  const variables = operation.variables

  return {
    query ,
    variables
  }
}
