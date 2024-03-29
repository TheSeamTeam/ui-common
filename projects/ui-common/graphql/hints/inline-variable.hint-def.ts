import { HintDefinition, HintsKind } from '../models'
import { inlineVariableTransformer } from './transformers/inline-variable.transformer'

/**
 * Maps variable value to gql and inlines it into the query.
 */
export const inlineVariableHintDef: HintDefinition = {
  name: 'inline-variable',
  appliesTo: [ HintsKind.Variable, HintsKind.VariableDefinition ],
  transformer: inlineVariableTransformer
}
