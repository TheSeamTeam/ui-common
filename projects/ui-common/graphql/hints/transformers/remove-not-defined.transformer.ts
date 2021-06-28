import { HintsToken, HintTransformer, HintTransformOperation } from '../../models'

export const removeNotDefinedTransformer: HintTransformer = (
  operation: HintTransformOperation,
  hintsToken: HintsToken
): HintTransformOperation => {
  const query = operation.query
  const variables = operation.variables

  return {
    query ,
    variables
  }
}
