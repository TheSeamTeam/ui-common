import { DatatableComponent } from '@theseam/ui-common/datatable'

export type GqlDatatableAccessor = Pick<
  DatatableComponent,
  | 'page'
  | 'sort'
  | 'sorts'
  | 'filterStates'
  | 'pageInfo'
  | 'externalSorting'
  | 'columns$'
  | 'refreshRequested'
> &
  // TODO: Remove when Datatable wrapper is fixed and exposes these.
  {
    ngxDatatable: {
      offset: number
      pageSize: number
      limit?: number
      count: number
    }
  }
