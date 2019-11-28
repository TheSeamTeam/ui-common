import { IDynamicValueType } from '../../models/dynamic-value-type'

/**
 * Value for defining an expression using Jexl syntax. The context will depend
 * on where the expression is used.
 *
 * Jexl: https://github.com/TomFrost/Jexl
 */
export interface IJexlValue extends IDynamicValueType<'jexl'> {
  expr: string
}
