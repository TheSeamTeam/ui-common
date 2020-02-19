import { ComponentType } from '@angular/cdk/portal'

import { IDataFilter } from '../../data-filters/index'

import { DynamicDatatableFilterMenuItemDef } from '../datatable-dynamic-def'

export interface DynamicDatatableFilterMenuItem extends DynamicDatatableFilterMenuItemDef {

  /** Filter menu item component. */
  component: ComponentType<IDataFilter> | undefined

}
