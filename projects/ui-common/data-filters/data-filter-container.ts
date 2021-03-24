import { InjectionToken } from '@angular/core'
import { IDataFilter } from './data-filter'

export interface DataFilterContainer {
  filters(): IDataFilter[]

  addFilter(dataFilter: IDataFilter): void

  removeFilter(dataFilter: IDataFilter): void
}

export const THESEAM_DATA_FILTER_CONTAINER = new InjectionToken<DataFilterContainer>(
  'DataFilterContainer'
)
