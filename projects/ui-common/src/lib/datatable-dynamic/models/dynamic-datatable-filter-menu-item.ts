import { ComponentType } from '@angular/cdk/portal'

import { IDataFilter } from '@theseam/ui-common/data-filters'

import { DynamicDatatableFilterMenuItemDef } from '../datatable-dynamic-def'

export interface DynamicDatatableFilterMenuItem extends DynamicDatatableFilterMenuItemDef {

  /** Filter menu item component. */
  component: ComponentType<IDataFilter> | undefined

}
