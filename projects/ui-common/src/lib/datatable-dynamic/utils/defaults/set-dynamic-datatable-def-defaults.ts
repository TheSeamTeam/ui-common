import { IDatatableDynamicDef } from '../../datatable-dynamic-def'

import { setDynamicDatatableColumnsDefaults } from './set-dynamic-datatable-columns-defaults'
import { setDynamicDatatableFilterMenuDefaults } from './set-dynamic-datatable-filter-menu-defaults'
import { setDynamicDatatableOptionsDefaults } from './set-dynamic-datatable-options-defaults'

export function setDynamicDatatableDefDefaults(
  def: IDatatableDynamicDef
) {
  setDynamicDatatableColumnsDefaults(def.columns)

  if (def.filterMenu) {
    setDynamicDatatableFilterMenuDefaults(def.filterMenu)
  }

  if (def.options) {
    setDynamicDatatableOptionsDefaults(def.options)
  }
}
