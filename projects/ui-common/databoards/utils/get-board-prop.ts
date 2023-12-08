import { camelCase } from '@marklb/ngx-datatable'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

export function getBoardProp<T extends { prop?: string | null, name?: string | null }>(
  col: T
): string | undefined {
  if (!notNullOrUndefined(col.prop) && col.name) {
    return camelCase(col.name)
  }

  return col.prop === null ? undefined : col.prop
}
