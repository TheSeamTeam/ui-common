import { Injectable, KeyValueDiffers, TemplateRef } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { DataTableColumnCellTreeToggle, DataTableColumnDirective, DataTableColumnHeaderDirective, SelectionType } from '@marklb/ngx-datatable'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { TheSeamDatatableColumn } from '../models/table-column'
import { setColumnDefaults } from '../utils/set-column-defaults'

interface ColumnsManagerProps {
  selectionType: SelectionType | undefined | null
  rowActionItem: DatatableRowActionItemDirective | undefined
  actionMenuCellTpl: TemplateRef<DataTableColumnDirective> | undefined
  blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined
  treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined
  headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined
  cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective> | undefined
}

@Injectable()
export class ColumnsManagerService {

  private readonly _inputColumns = new BehaviorSubject<TheSeamDatatableColumn[]>([])
  private readonly _templateColumns = new BehaviorSubject<DatatableColumnComponent[]>([])

  public readonly columns$: Observable<TheSeamDatatableColumn[]>

  constructor(
    private readonly _differs: KeyValueDiffers,
  ) {
    this.columns$ = combineLatest([
      this._inputColumns.asObservable(),
      this._templateColumns.asObservable(),
    ]).pipe(
      map(([ inputColumns, templateColumns ]) => {
        const cols: TheSeamDatatableColumn[] = []

        // Column needs to be provided in the inputColumns, so iterate the
        // inputColumns.
        for (const inpCol of inputColumns) {


          const _col: TheSeamDatatableColumn = {
            // ...(prev || {}),
            ...inpCol,
            // ..._tplCol
          }

          cols.push(_col)
        }

        // Make sure the default for any missing props are set.
        setColumnDefaults(cols)

        return cols
      })
    )
  }

  public setInputColumns(columns: TheSeamDatatableColumn[]): void {
    this._inputColumns.next(columns)
  }

  public setTemplateColumns(columns: DatatableColumnComponent[]): void {
    this._templateColumns.next(columns)
  }

}
