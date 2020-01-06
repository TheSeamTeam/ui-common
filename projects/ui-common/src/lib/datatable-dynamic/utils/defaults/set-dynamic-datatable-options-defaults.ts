import { IDynamicDatatableOptions } from '../../datatable-dynamic-def'

export function setDynamicDatatableOptionsDefaults(
  options: IDynamicDatatableOptions
) {
  if (options.virtualization === undefined || options.virtualization === null) {
    options.virtualization = true
  }
}
