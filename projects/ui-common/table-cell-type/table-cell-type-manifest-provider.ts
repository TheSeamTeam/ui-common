import { ITableCellTypeManifest, TABLE_CELL_TYPE_MANIFEST } from '@theseam/ui-common/table-cell-type'

export interface ITableCellTypeManifestProvider {
  provide: typeof TABLE_CELL_TYPE_MANIFEST
  useValue: ITableCellTypeManifest
  multi: true
}
