import { ITableCellTypeManifest } from './table-cell-types-models'
import { TABLE_CELL_TYPE_MANIFEST } from './table-cell-types-tokens'

export interface ITableCellTypeManifestProvider {
  provide: typeof TABLE_CELL_TYPE_MANIFEST
  useValue: ITableCellTypeManifest
  multi: true
}
