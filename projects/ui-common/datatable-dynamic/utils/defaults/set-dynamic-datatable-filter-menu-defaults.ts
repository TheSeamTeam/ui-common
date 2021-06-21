import { DynamicDatatableFilterMenu } from '../../datatable-dynamic-def'

export function setDynamicDatatableFilterMenuDefaults(
  filterMenu: DynamicDatatableFilterMenu
) {
  if (!filterMenu.state) {
    filterMenu.state = 'default'
  }
}
