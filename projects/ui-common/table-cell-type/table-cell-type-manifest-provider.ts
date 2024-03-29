import { ITableCellTypeManifest } from './table-cell-type-models'
import { TABLE_CELL_TYPE_MANIFEST } from './table-cell-type-tokens'

export interface ITableCellTypeManifestProvider {
  provide: typeof TABLE_CELL_TYPE_MANIFEST
  useValue: ITableCellTypeManifest
  multi: true
}
