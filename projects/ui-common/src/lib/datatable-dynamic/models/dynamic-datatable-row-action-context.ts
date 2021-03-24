import { DynamicActionContext } from '@theseam/ui-common/dynamic'

import { DynamicDatatableRow } from '../datatable-dynamic-def'

export interface DynamicDatatableRowActionContext extends DynamicActionContext {
  row: DynamicDatatableRow
}
