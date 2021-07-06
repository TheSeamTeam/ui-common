import { HintDefinition, HintsKind } from '../models'
import { removeNotDefinedTransformer } from './transformers/remove-not-defined.transformer'

/**
 * Remove the variable from the query if it is not defined in the operation
 * variables.
 */
export const removeNotDefinedHintDef: HintDefinition = {
  name: 'remove-not-defined',
  appliesTo: [ HintsKind.OperationDefinition ],
  transformer: removeNotDefinedTransformer
}
