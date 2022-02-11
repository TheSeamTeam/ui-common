import { translateTemplates } from '@marklb/ngx-datatable'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { getColumnProp } from '../utils/get-column-prop'

// TODO: Replace with a `translateTemplates` function that fits the
// wrapper component better.
export function translateTemplateColumns(v: DatatableColumnComponent[]): DatatableColumnComponent[] {
  const cols = translateTemplates(v as any) as DatatableColumnComponent[]

  for (const col of cols) {
    col.prop = getColumnProp(col)
  }

  return cols
}
