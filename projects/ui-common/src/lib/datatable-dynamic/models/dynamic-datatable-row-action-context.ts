import { IDynamicActionContext } from '../../dynamic/index'

import { IDynamicDatatableRow } from '../datatable-dynamic-def'

export interface IDynamicDatatableRowActionContext extends IDynamicActionContext {
  row: IDynamicDatatableRow
}
