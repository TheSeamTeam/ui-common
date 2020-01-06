import { IDynamicDatatableFilterMenu } from '../../datatable-dynamic-def'

export function setDynamicDatatableFilterMenuDefaults(
  filterMenu: IDynamicDatatableFilterMenu
) {
  if (!filterMenu.state) {
    filterMenu.state = 'default'
  }
}
