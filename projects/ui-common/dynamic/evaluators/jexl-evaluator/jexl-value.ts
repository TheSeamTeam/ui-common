import { DynamicValueBaseType } from '../../models/dynamic-value-base-type'
import { IDynamicValueType } from '../../models/dynamic-value-type'

/**
 * Value for defining an expression using Jexl syntax. The context will depend
 * on where the expression is used.
 *
 * Jexl: https://github.com/TomFrost/Jexl
 */
export interface IJexlValue<R extends DynamicValueBaseType> extends IDynamicValueType<'jexl', R> {
  expr: string
}
