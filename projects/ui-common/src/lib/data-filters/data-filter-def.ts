import { InjectionToken } from '@angular/core'
import { IDataFilter } from './data-filter'

export interface IDataFilterDef {
  name: string
  // TODO: Try to find a better way to type this to make sure it is clear that
  // it should also be a component.
  component: IDataFilter
}

export const THESEAM_DATA_FILTER_DEF = new InjectionToken<IDataFilterDef[]>('TheSeamDataFilter')
