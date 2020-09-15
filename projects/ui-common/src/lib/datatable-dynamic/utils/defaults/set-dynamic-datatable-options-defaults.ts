import { DynamicDatatableOptions } from '../../datatable-dynamic-def'

export function setDynamicDatatableOptionsDefaults(
  options: DynamicDatatableOptions
) {
  if (options.virtualization === undefined || options.virtualization === null) {
    options.virtualization = true
  }
}
