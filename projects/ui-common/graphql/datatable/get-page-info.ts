import { TheSeamPageInfo } from '@theseam/ui-common/datatable'

import { GqlDatatableAccessor } from '../models/gql-datatable-accessor'

export function getPageInfo(datatable: GqlDatatableAccessor | null | undefined, defaultPageSize: number = 20): TheSeamPageInfo {
  return {
    offset: datatable?.ngxDatatable?.offset ?? 0,
    pageSize: datatable?.ngxDatatable?.pageSize ?? defaultPageSize,
    limit: datatable?.ngxDatatable?.limit,
    count: datatable?.ngxDatatable?.count ?? 0
  }
}
