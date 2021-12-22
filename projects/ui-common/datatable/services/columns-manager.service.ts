import { Injectable, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, TemplateRef } from '@angular/core'
import { BehaviorSubject, combineLatest, defer, EMPTY, Observable, of, Subject } from 'rxjs'
import { auditTime, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import {
  camelCase,
  DataTableColumnCellTreeToggle,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  SelectionType,
  TableColumn,
  TableColumnProp,
  translateTemplates
} from '@marklb/ngx-datatable'

import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { TheSeamDatatableColumn } from '../models/table-column'
import { createActionMenuColumn } from '../utils/create-action-menu-column'
import { createCheckboxColumn } from '../utils/create-checkbox-column'
import { getColumnProp } from '../utils/get-column-prop'
import { setColumnDefaults } from '../utils/set-column-defaults'
import { translateTemplateColumns } from '../utils/translate-templates'

enum ColumnsTypes {
  Input,
  Template,
  Result,
}

export type InternalColumnsGetter = () => TableColumn[]

@Injectable()
export class ColumnsManagerService {
  private readonly _updateColumns = new Subject<void>()

  private readonly _inputColumns = new BehaviorSubject<TheSeamDatatableColumn[]>([])
  private readonly _templateColumns = new BehaviorSubject<DatatableColumnComponent[]>([])

  private readonly _inpColDiffersMap = new Map<TableColumnProp, KeyValueDiffer<any, any>>()
  private readonly _tplColDiffersMap = new Map<TableColumnProp, KeyValueDiffer<any, any>>()
  private readonly _resultColDiffersMap = new Map<TableColumnProp, KeyValueDiffer<any, any>>()
  private _colPropsDiffer?: KeyValueDiffer<any, any>

  private _internalColumnsGetter?: InternalColumnsGetter

  private _selectionType: SelectionType | undefined
  private _rowActionItem: DatatableRowActionItemDirective | undefined
  private _actionMenuCellTpl: TemplateRef<DataTableColumnDirective> | undefined
  private _blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined
  private _treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined
  private _headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined
  private _cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective> | undefined

  // TODO: Consider making this a columns changed obervable, to make changes more predictable.
  public readonly columns$: Observable<TheSeamDatatableColumn[]>

  constructor(
    private readonly _differs: KeyValueDiffers,
  ) {
    this.columns$ = defer(() => {
      let isFirst = true
      return combineLatest([
        this._inputColumns.asObservable(),
        this._templateColumns.asObservable().pipe(map(translateTemplateColumns)),
        this._updateColumns.asObservable().pipe(auditTime(0), startWith(undefined))
      ]).pipe(
        switchMap(([ inputColumns, templateColumns ]) => {
          const cols = this._mergeColumns(inputColumns, templateColumns)

          const hasColumnsChanged = this._hasColumnsChanged(cols)

          // TODO: Look for columns added/removed and remove the removed columns
          // differs, not just changes to columns.
          const hasAddedOrRemovedColumns = this._hasAddedOrRemovedColumns(cols)

          // NOTE: Both checks need to be run, even though only one needs to be
          // true, because their differs need to be called.
          if (hasColumnsChanged || hasAddedOrRemovedColumns || isFirst) {
            isFirst = false
            return of(cols)
          }

          return EMPTY
        }),
      )
    }).pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    )
  }

  public setInputColumns(columns: TheSeamDatatableColumn[]): void {
    this._inputColumns.next(columns)
  }

  public setTemplateColumns(columns: DatatableColumnComponent[]): void {
    this._templateColumns.next(columns)
  }

  public setInternalColumnsGetter(getter: InternalColumnsGetter | null): void {
    this._internalColumnsGetter = getter || undefined
    this._updateColumns.next(undefined)
  }

  public setSelectionType(selectionType: SelectionType | undefined): void {
    const changed = this._selectionType !== selectionType
    this._selectionType = selectionType
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  public setRowActionItem(rowActionItem: DatatableRowActionItemDirective | undefined): void {
    const changed = this._rowActionItem !== rowActionItem
    this._rowActionItem = rowActionItem
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  public setActionMenuCellTpl(actionMenuCellTpl: TemplateRef<DataTableColumnDirective> | undefined): void {
    const changed = this._actionMenuCellTpl !== actionMenuCellTpl
    this._actionMenuCellTpl = actionMenuCellTpl
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  public setBlankHeaderTpl(blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined): void {
    const changed = this._blankHeaderTpl !== blankHeaderTpl
    this._blankHeaderTpl = blankHeaderTpl
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  public setTreeToggleTpl(treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined): void {
    const changed = this._treeToggleTpl !== treeToggleTpl
    this._treeToggleTpl = treeToggleTpl
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  public setHeaderTpl(headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined): void {
    const changed = this._headerTpl !== headerTpl
    this._headerTpl = headerTpl
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  public setCellTypeSelectorTpl(cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective> | undefined): void {
    const changed = this._cellTypeSelectorTpl !== cellTypeSelectorTpl
    this._cellTypeSelectorTpl = cellTypeSelectorTpl
    if (changed) {
      this._updateColumns.next(undefined)
    }
  }

  private _mergeColumns(
    inputColumns: TheSeamDatatableColumn[],
    templateColumns: DatatableColumnComponent[]
  ): TheSeamDatatableColumn[] {
    const cols: TheSeamDatatableColumn[] = []

    // Add the first column checkbox if 'checkbox' selection is enabled.
    if (this._shouldAddCheckboxColumn()) {
      cols.push(createCheckboxColumn())
    }

    // Column needs to be provided in the inputColumns, so iterate the
    // inputColumns.
    for (const inpCol of inputColumns) {
      const prop = getColumnProp(inpCol)
      if (!notNullOrUndefined(prop)) {
        throw Error(`Column may have 'prop' or 'name' defined.`)
      }

      const internalCol = this._getInternalColumn(prop)

      const inpColDif = this._getColDif(inpCol, ColumnsTypes.Input)
      if (notNullOrUndefined(inpColDif)) {
        this._updateColDif(inpColDif, internalCol, inpCol)
      }

      const tplCol = this._findColumnByProp(prop, templateColumns)
      if (tplCol !== undefined) {
        const tplColDif = this._getColDif(tplCol, ColumnsTypes.Template)
        if (notNullOrUndefined(tplColDif)) {
          this._updateColDif(tplColDif, internalCol, tplCol)
        }
      }

      const _col: TheSeamDatatableColumn = {
        ...(internalCol || {}),
        ...inpCol,
        // TODO: Rethink this, because I don't know if this is correct.
        ...(tplCol as any || {})
      }

      if (this._shouldAddTreeToggleColumn(_col)) {
        _col.treeToggleTemplate = this._treeToggleTpl
      }

      if (this._shouldAddHeaderTemplate(_col)) {
        _col.headerTemplate = this._headerTpl
      }

      if (this._shouldAddCellTypeSelectorTpl(_col)) {
        _col.cellTemplate = this._cellTypeSelectorTpl
      }

      cols.push(_col)
    }

    if (this._shouldAddRowActionColumn()) {
      cols.push(createActionMenuColumn(this._actionMenuCellTpl, this._blankHeaderTpl))
    }

    // Make sure the default for any missing props are set.
    // TODO: Determine if this should be done earlier, because I don't like
    // how this is done after dif checks.
    setColumnDefaults(cols)

    return cols
  }

  private _getInternalColumns(): TableColumn[] | undefined {
    if (this._internalColumnsGetter === undefined) {
      return undefined
    }

    return this._internalColumnsGetter()
  }

  private _getInternalColumn(prop: TableColumnProp): TableColumn | undefined {
    const internalCols = this._getInternalColumns()

    if (internalCols === undefined) {
      return undefined
    }

    return internalCols.find(c => getColumnProp(c) === prop)
  }

  private _findColumnByProp<T extends TheSeamDatatableColumn | DatatableColumnComponent>(
    prop: TableColumnProp,
    columns: T[]
  ): T | undefined {
    return columns.find(c => getColumnProp(c) === prop)
  }

  private _getDifMapForColumnsType(columnsType: ColumnsTypes): Map<TableColumnProp, KeyValueDiffer<any, any>>  {
    switch (columnsType) {
      case ColumnsTypes.Input: return this._inpColDiffersMap
      case ColumnsTypes.Template: return this._tplColDiffersMap
      case ColumnsTypes.Result: return this._resultColDiffersMap
    }
  }

  private _getColumnDiffer(prop: TableColumnProp, colsType: ColumnsTypes): KeyValueDiffer<string, any> {
    const difMap = this._getDifMapForColumnsType(colsType)
    if (difMap === null) {
      throw Error(`Invalid columns type.`)
    }

    if (!difMap.has(prop)) {
      difMap.set(prop, this._differs.find({}).create())
    }

    const differ = difMap.get(prop)
    if (differ === undefined) {
      throw Error(`Differ not found. New differ should have been created.`)
    }

    return differ
  }

  private _getColDif(
    col: TheSeamDatatableColumn | DatatableColumnComponent,
    colsType: ColumnsTypes
  ): KeyValueChanges<string, any> | null {
    const prop = getColumnProp(col)
    if (prop === undefined) {
      throw Error(`Column prop not found.`)
    }

    return this._getColumnDiffer(prop, colsType).diff(col)
  }

  private _updateColDif(
    colDif: KeyValueChanges<string, any>,
    internalColumn: TableColumn | undefined,
    col: TheSeamDatatableColumn | DatatableColumnComponent
  ): void {
    colDif.forEachRemovedItem(r => {
      if (internalColumn && internalColumn.hasOwnProperty(r.key)) {
        const k = r.key as keyof TableColumn
        delete internalColumn[k]
      }
    })
    colDif.forEachAddedItem(r => (col as any)[r.key] = r.currentValue)
    colDif.forEachChangedItem(r => (col as any)[r.key] = r.currentValue)
  }

  private _hasAddedOrRemovedColumns(columns: TheSeamDatatableColumn[]): boolean {
    if (!this._colPropsDiffer) {
      this._colPropsDiffer = this._differs.find([]).create()
    }

    const props = columns.map(c => getColumnProp(c))
    return this._colPropsDiffer.diff(props) !== null
  }

  private _hasColumnsChanged(columns: TheSeamDatatableColumn[]): boolean {
    let colChanged = false
    for (const col of columns) {
      const resultDif = this._getColDif(col, ColumnsTypes.Result)
      if (resultDif) {
        // NOTE: Can't return early, because the differs need to be updated.
        colChanged = true
      }
    }
    return colChanged
  }

  private _shouldAddCheckboxColumn(): boolean {
    return this._selectionType === SelectionType.checkbox
  }

  private _shouldAddRowActionColumn(): boolean {
    return this._rowActionItem !== undefined
  }

  private _shouldAddTreeToggleColumn(column: TheSeamDatatableColumn): boolean {
    return column.isTreeColumn !== undefined && column.isTreeColumn &&
      (!hasProperty(column, 'treeToggleTemplate') || !notNullOrUndefined(column.treeToggleTemplate))
  }

  private _shouldAddHeaderTemplate(column: TheSeamDatatableColumn): boolean {
    return !hasProperty(column, 'headerTemplate')
  }

  private _shouldAddCellTypeSelectorTpl(column: TheSeamDatatableColumn): boolean {
    return hasProperty(column, 'cellType')
  }

}
