import { IDatatableDynamicDef } from '../../datatable-dynamic-def'

export function dynamicDatatableDefHasFullSearch(def: IDatatableDynamicDef) {
  if (def.filterMenu && Array.isArray(def.filterMenu.filters)
    && def.filterMenu.filters.findIndex(f => f.type === 'full-search') !== -1
  ) {
    return true
  }
  return false
}
