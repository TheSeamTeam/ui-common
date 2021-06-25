import { HintTransformer, HintTransformOperation } from '../../models'

export const removeNotDefinedTransformer: HintTransformer = (operation: HintTransformOperation): HintTransformOperation => {
  const query = operation.query
  const variables = operation.variables

  return {
    query ,
    variables
  }
}
