import { DatatableColumnComponent } from './../datatable-column/datatable-column.component'
import { DatatableRowActionItemDirective } from './../directives/datatable-row-action-item.directive'
import { TheSeamDatatableColumn } from './../models/table-column'

import { KeyValueDiffer, KeyValueDiffers, TemplateRef } from '@angular/core'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { DataTableColumnCellTreeToggle, DataTableColumnDirective, DataTableColumnHeaderDirective, SelectionType, TableColumn } from '@marklb/ngx-datatable'
import { deleteProperties } from '@theseam/ui-common/utils/'
import { mergeTplAndInpColumns } from './merge-tpl-and-input-columns'
import { setColumnDefaults } from './set-column-defaults'

fdescribe('mergeTplAndInpColumns', () => {
  // let component: DatatableComponent
  // let fixture: ComponentFixture<DatatableComponent>

  const ngxDatatableInternalColumns: TableColumn[] = []
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
    // fixture = TestBed.createComponent(DatatableComponent)
    // component = fixture.componentInstance
    // fixture.detectChanges()

    differs = TestBed.inject(KeyValueDiffers)
  })

  it('should merge', () => {
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
      ...defaultColumnWithoutId([
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' }
      ]).map(v => jasmine.objectContaining(v))
    ]))
  })
})

function defaultColumnWithoutId(o: TheSeamDatatableColumn[]): TheSeamDatatableColumn[] {
  setColumnDefaults(o)
  for (const col of o) {
    const _o: any = col
    _o.$$id = jasmine.any(String)
    _o.$$valueGetter = jasmine.any(Function)
    // deleteProperties(col, [ '$$id', '$$valueGetter' ])
  }
  return o
}
