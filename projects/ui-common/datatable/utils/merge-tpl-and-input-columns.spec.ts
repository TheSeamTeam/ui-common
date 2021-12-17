import { DatatableColumnComponent } from './../datatable-column/datatable-column.component'
import { DatatableRowActionItemDirective } from './../directives/datatable-row-action-item.directive'
import { TheSeamDatatableColumn } from './../models/table-column'
import { DatatableColumnChangesService } from './../services/datatable-column-changes.service'

import { KeyValueDiffer, KeyValueDiffers, TemplateRef } from '@angular/core'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { DataTableColumnCellTreeToggle, DataTableColumnDirective, DataTableColumnHeaderDirective, SelectionType, TableColumn } from '@marklb/ngx-datatable'
import { deleteProperties } from '@theseam/ui-common/utils/'
import { mergeTplAndInpColumns } from './merge-tpl-and-input-columns'
import { setColumnDefaults } from './set-column-defaults'

describe('mergeTplAndInpColumns', () => {
  let _colChangesService: DatatableColumnChangesService

  let ngxDatatableInternalColumns: TableColumn[] = []
  const selectionType: SelectionType | undefined | null = null
  const colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> } = {}
  const colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> } = {}
  const rowActionItem: DatatableRowActionItemDirective | undefined = undefined
  const actionMenuCellTpl: TemplateRef<DataTableColumnDirective> | undefined = undefined
  const blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined = undefined
  const treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined = undefined
  const headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined = undefined
  const cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective> | undefined = undefined
  let differs: KeyValueDiffers

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    _colChangesService = new DatatableColumnChangesService()
    ngxDatatableInternalColumns = []
    differs = TestBed.inject(KeyValueDiffers)
  })

  it('should return Input columns with defaults', () => {
    const tplCols: DatatableColumnComponent[] = []
    const inpCols: TheSeamDatatableColumn[] = [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ]

    const result = mergeTplAndInpColumns(
      tplCols,
      inpCols,
      ngxDatatableInternalColumns,
      selectionType,
      colDiffersInp,
      colDiffersTpl,
      rowActionItem,
      actionMenuCellTpl,
      blankHeaderTpl,
      treeToggleTpl,
      headerTpl,
      cellTypeSelectorTpl,
      differs
    )

    expect(result).toEqual(jasmine.arrayContaining([
      ...defaultColumnWithIdentMatchers([
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' }
      ]).map(v => jasmine.objectContaining(v))
    ]))
  })

  // TODO: Should this pass? I think it is intentional that template can only
  // overwrite props of input columns.
  // it('should return Template columns with defaults', () => {
  //   const tplCols: DatatableColumnComponent[] = initTemplateColumnComponents([
  //     { prop: 'name', name: 'Name' },
  //     { prop: 'age', name: 'Age' },
  //     { prop: 'color', name: 'Color' }
  //   ])
  //   const inpCols: TheSeamDatatableColumn[] = []

  //   const result = mergeTplAndInpColumns(
  //     tplCols,
  //     inpCols,
  //     ngxDatatableInternalColumns,
  //     selectionType,
  //     colDiffersInp,
  //     colDiffersTpl,
  //     rowActionItem,
  //     actionMenuCellTpl,
  //     blankHeaderTpl,
  //     treeToggleTpl,
  //     headerTpl,
  //     cellTypeSelectorTpl,
  //     differs
  //   )

  //   expect(result).toEqual(jasmine.arrayContaining([
  //     ...defaultColumnWithIdentMatchers([
  //       { prop: 'name', name: 'Name' },
  //       { prop: 'age', name: 'Age' },
  //       { prop: 'color', name: 'Color' }
  //     ]).map(v => jasmine.objectContaining(v))
  //   ]))
  // })

  it('should prioritize Template props', () => {
    const tplCols: DatatableColumnComponent[] = initTemplateColumnComponents([
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
      { prop: 'color', name: 'Color' }
    ])
    const inpCols: TheSeamDatatableColumn[] = [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age', cellClass: 'inp-class' },
      { prop: 'color', name: 'Color' }
    ]

    const result = mergeTplAndInpColumns(
      tplCols,
      inpCols,
      ngxDatatableInternalColumns,
      selectionType,
      colDiffersInp,
      colDiffersTpl,
      rowActionItem,
      actionMenuCellTpl,
      blankHeaderTpl,
      treeToggleTpl,
      headerTpl,
      cellTypeSelectorTpl,
      differs
    )

    expect(result).toEqual(jasmine.arrayContaining([
      ...defaultColumnWithIdentMatchers([
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
        { prop: 'color', name: 'Color' }
      ]).map(v => jasmine.objectContaining(v))
    ]))
  })

  // it('should detect change in Input props', () => {
  //   const tplCols: DatatableColumnComponent[] = initTemplateColumnComponents([
  //     { prop: 'name', name: 'Name' },
  //     { prop: 'age', name: 'Age' },
  //     { prop: 'color', name: 'Color' }
  //   ])
  //   const inpCols: TheSeamDatatableColumn[] = [
  //     { prop: 'name', name: 'Name' },
  //     { prop: 'age', name: 'Age' },
  //     { prop: 'color', name: 'Color' }
  //   ]

  //   const _result = mergeTplAndInpColumns(
  //     tplCols,
  //     inpCols,
  //     ngxDatatableInternalColumns,
  //     selectionType,
  //     colDiffersInp,
  //     colDiffersTpl,
  //     rowActionItem,
  //     actionMenuCellTpl,
  //     blankHeaderTpl,
  //     treeToggleTpl,
  //     headerTpl,
  //     cellTypeSelectorTpl,
  //     differs
  //   )

  //   ngxDatatableInternalColumns = _result

  //   inpCols[1].cellClass = 'inp-class'

  //   const result = mergeTplAndInpColumns(
  //     tplCols,
  //     inpCols,
  //     ngxDatatableInternalColumns,
  //     selectionType,
  //     colDiffersInp,
  //     colDiffersTpl,
  //     rowActionItem,
  //     actionMenuCellTpl,
  //     blankHeaderTpl,
  //     treeToggleTpl,
  //     headerTpl,
  //     cellTypeSelectorTpl,
  //     differs
  //   )

  //   const tmp = defaultColumnWithIdentMatchers([
  //     { prop: 'name', name: 'Name' },
  //     { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
  //     { prop: 'color', name: 'Color' }
  //   ], true).map(v => jasmine.objectContaining(v))

  //   expect(result).toEqual(jasmine.arrayContaining([
  //     ...tmp
  //   ]))
  // })

  /**
   * Mainly just need to test `TheSeamDatatableColumn` objects, so this just
   * simplifies initializing column component objects.
   *
   * NOTE: I plan to remove the need for this here, but I want to slowly
   * refactor to avoid breaking current functionality.
   */
  function initTemplateColumnComponents(o: TheSeamDatatableColumn[]): DatatableColumnComponent[] {
    const comps: DatatableColumnComponent[] = []
    for (const col of o) {
      const comp: any = new DatatableColumnComponent(_colChangesService)
      for (const key of Object.keys(col)) {
        comp[key] = (col as any)[key]
      }
      comps.push(comp)
    }
    return comps
  }
})

/**
 * Populates defaults, but replaces '$$id' with an "any string" matcher and
 * '$$valueGetter' with an "any function" mathcer.
 */
function defaultColumnWithIdentMatchers(o: TheSeamDatatableColumn[], includesTplCols: boolean = false): TheSeamDatatableColumn[] {
  setColumnDefaults(o)
  for (const col of o) {
    const _o: any = col
    _o.$$id = jasmine.any(String)
    _o.$$valueGetter = jasmine.any(Function)

    if (includesTplCols) {
      _o._columnChangesService = jasmine.anything()
      _o._isFirstChange = jasmine.any(Boolean)
    }

    // deleteProperties(col, [ '$$id', '$$valueGetter' ])
  }
  return o
}
