import { camelCase, TableColumn, TableColumnProp } from '@marklb/ngx-datatable'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

export function getColumnProp<T extends { prop?: TableColumnProp | null, name?: string | null }>(
  col: T
): TableColumnProp | undefined {
  if (!notNullOrUndefined(col.prop) && col.name) {
    return camelCase(col.name)
  }

  return col.prop === null ? undefined : col.prop
}
