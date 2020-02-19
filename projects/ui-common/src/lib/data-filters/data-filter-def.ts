import { InjectionToken } from '@angular/core'
import { IDataFilter } from './data-filter'

export interface IDataFilterDef {
  name: string
  /**
   * Component that controls the filter.
   */
  component: IDataFilter
}

export const THESEAM_DATA_FILTER_DEF = new InjectionToken<IDataFilterDef[]>('TheSeamDataFilter')
