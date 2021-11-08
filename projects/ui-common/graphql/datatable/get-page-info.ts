import { TheSeamPageInfo } from '@theseam/ui-common/datatable'

import { GqlDatatableAccessor } from '../models/gql-datatable-accessor'

export const DEFAULT_PAGE_SIZE = 20

export function getPageInfo(
  datatable: GqlDatatableAccessor | null | undefined,
  defaultPageSize: number = DEFAULT_PAGE_SIZE
): TheSeamPageInfo {
  return {
    offset: datatable?.ngxDatatable?.offset ?? 0,
    pageSize: datatable?.ngxDatatable?.pageSize ?? defaultPageSize,
    limit: datatable?.ngxDatatable?.limit,
    count: datatable?.ngxDatatable?.count ?? 0
  }
}
