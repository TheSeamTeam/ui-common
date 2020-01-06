import { ComponentType } from '@angular/cdk/portal'

import { IDataFilter } from '../../data-filters/index'

import { IDynamicDatatableFilterMenuItemDef } from '../datatable-dynamic-def'

export interface IDynamicDatatableFilterMenuItem extends IDynamicDatatableFilterMenuItemDef {

  /** Filter menu item component. */
  component: ComponentType<IDataFilter> | undefined

}
