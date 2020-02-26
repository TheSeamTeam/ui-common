import { DynamicActionContext } from '../../dynamic/index'

import { DynamicDatatableRow } from '../datatable-dynamic-def'

export interface DynamicDatatableRowActionContext extends DynamicActionContext {
  row: DynamicDatatableRow
}
