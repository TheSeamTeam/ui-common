import { DynamicValueBaseType } from '../../models/dynamic-value-base-type'
import { IDynamicValueType } from '../../models/dynamic-value-type'

/**
 *
 */
export interface IExportersDataValue<R extends DynamicValueBaseType> extends IDynamicValueType<'exporters-data', R> {
  exporters: string[]
}
