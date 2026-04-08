import { TheSeamDatatableColumn } from '@theseam/ui-common/datatable'
import { EmptyObject } from '../models'

export type MapperContext<TExtraVariables = EmptyObject> = {
  extraVariables: TExtraVariables
  columns?: TheSeamDatatableColumn[]
} & {
  [name: string]: any
}
