import { KeyValueChanges, KeyValueDiffer, KeyValueDiffers, TemplateRef } from '@angular/core'
import {
  DataTableColumnCellTreeToggle,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  TableColumn,
  translateTemplates
} from '@marklb/ngx-datatable'
import type { SelectionType } from '@marklb/ngx-datatable'

import { hasProperty } from '@theseam/ui-common/utils'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { TheSeamDatatableColumn } from '../models/table-column'
import { setColumnDefaults } from '../utils/set-column-defaults'

export function mergeTplAndInpColumns(
  tplCols: DatatableColumnComponent[],
  inpCols: TheSeamDatatableColumn[],
  ngxDatatableInternalColumns: TableColumn[],
  selectionType: SelectionType | undefined | null,
  colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> },
  colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> },
  rowActionItem: DatatableRowActionItemDirective | undefined,
  actionMenuCellTpl: TemplateRef<DataTableColumnDirective> | undefined,
  blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined,
  treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined,
  headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined,
  cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective> | undefined,
  differs: KeyValueDiffers
): TheSeamDatatableColumn[] {
  const cols: TheSeamDatatableColumn[] = []

  // Add the first column checkbox if checkbox selection is enabled.
  if (selectionType === 'checkbox') {
    cols.push(_createCheckBoxColumn())
  }

  const _tplCols = translateTemplates(<any>(tplCols || []))
  for (const col of inpCols) {
    const tplCol = _tplCols.find(t => t.prop === col.prop)
    // console.log({ col: { ...(col || {}) }, tplCol: { ...(tplCol || {}) } })

    const dtColumns = ngxDatatableInternalColumns
    const prev = dtColumns.find(c => c.prop === col.prop)

    const inpColDiff = _getColDiff(col, colDiffersInp, differs)
    const _inpCol = inpColDiff ? {} : _hasPrevColDiff(col, colDiffersInp) ? {} : col
    if (inpColDiff) {
      _updateColDiff(inpColDiff, prev, _inpCol)
    }

    let _tplCol: TheSeamDatatableColumn = {}
    if (tplCol) {
      const tplColDiff = tplCol ? _getColDiff(tplCol, colDiffersTpl, differs) : undefined
      _tplCol = tplColDiff ? {} : _hasPrevColDiff(col, colDiffersTpl) ? {} : tplCol
      if (tplColDiff) {
        _updateColDiff(tplColDiff, prev, _tplCol)
      }
    }

    const _col: TheSeamDatatableColumn = {
      ...(prev || {}),
      ..._inpCol,
      ..._tplCol
    }

    cols.push(_col)
  }

  if (rowActionItem) {
    cols.push(_createActionMenuColumn(actionMenuCellTpl, blankHeaderTpl))
  }

  for (const col of cols) {
    if (col.isTreeColumn && hasProperty(col, 'treeToggleTemplate')) {
      col.treeToggleTemplate = treeToggleTpl
    }

    if (!hasProperty(col, 'headerTemplate')) {
      col.headerTemplate = headerTpl
    }

    if (hasProperty(col, 'cellType')) {
      col.cellTemplate = cellTypeSelectorTpl
    }
  }

  setColumnDefaults(cols)

  // console.log(cols.map(c => ({ prop: c.prop, canAutoResize: c.canAutoResize })))

  return cols
}

function _updateColDiff(
  colDiff: KeyValueChanges<string, any>,
  prev: TableColumn | undefined,
  inpCol: TheSeamDatatableColumn<any, any>
): void {
  colDiff.forEachRemovedItem(r => {
    if (prev && prev.hasOwnProperty(r.key)) {
      const k = r.key as keyof TableColumn
      delete prev[k]
    }
  })
  colDiff.forEachAddedItem(r => (inpCol as any)[r.key] = r.currentValue)
  colDiff.forEachChangedItem(r => (inpCol as any)[r.key] = r.currentValue)
}

function _getColDiff(
  col: TheSeamDatatableColumn,
  colDiffers: { [propName: string]: KeyValueDiffer<any, any> },
  differs: KeyValueDiffers
) {
  if (!col || !col.prop) {
    return
  }

  const differsMap = colDiffers

  if (!differsMap[col.prop]) {
    differsMap[col.prop] = differs.find({}).create()
  }

  const differ = differsMap[col.prop]

  const diff = differ.diff(col)
  return diff
}

function _hasPrevColDiff(
  col: TheSeamDatatableColumn,
  colDiffers: { [propName: string]: KeyValueDiffer<any, any> }
): boolean {
  if (!col || !col.prop) {
    return false
  }

  const differsMap = colDiffers

  return !!differsMap
}

function _createCheckBoxColumn(): TheSeamDatatableColumn {
  return {
    prop: '$$__checkbox__',
    name: '',
    width: 40,
    sortable: false,
    canAutoResize: false,
    draggable: false,
    resizeable: false,
    headerCheckboxable: true,
    checkboxable: true,
  }
}

function _createActionMenuColumn(
  cellTemplate: any,
  headerTemplate: any
): TheSeamDatatableColumn {
  return {
    prop: '$$__actionMenu__',
    name: '',
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    resizeable: false,
    sortable: false,
    draggable: false,
    // TODO: Fix column auto sizing with fixed column and cell overlay before enabling.
    // frozenRight: true,
    cellTemplate,
    headerTemplate,
  }
}
