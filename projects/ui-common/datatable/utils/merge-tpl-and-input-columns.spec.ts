import { DatatableColumnComponent } from './../datatable-column/datatable-column.component'
import { DatatableRowActionItemDirective } from './../directives/datatable-row-action-item.directive'
import { TheSeamDatatableColumn } from './../models/table-column'
import { DatatableColumnChangesService } from './../services/datatable-column-changes.service'

import {
  KeyValueDiffer,
  KeyValueDiffers,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
} from '@angular/core'
import { TestBed, waitForAsync } from '@angular/core/testing'
import {
  DataTableColumnCellTreeToggle,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  SelectionType,
  TableColumn,
} from '@marklb/ngx-datatable'
import { mergeTplAndInpColumns } from './merge-tpl-and-input-columns'
import { setColumnDefaults } from './set-column-defaults'

describe('mergeTplAndInpColumns', () => {
  let _colChangesService: DatatableColumnChangesService

  let ngxDatatableInternalColumns: TableColumn[] = []
  const selectionType: SelectionType | undefined | null = null
  const colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> } = {}
  const colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> } = {}
  const rowActionItem: DatatableRowActionItemDirective | undefined = undefined
  const actionMenuCellTpl:
    | TemplateRef<DataTableColumnDirective<any>>
    | undefined = undefined
  const blankHeaderTpl:
    | TemplateRef<DataTableColumnHeaderDirective>
    | undefined = undefined
  const treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined =
    undefined
  const headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined =
    undefined
  const cellTypeSelectorTpl:
    | TemplateRef<DataTableColumnDirective<any>>
    | undefined = undefined
  let differs: KeyValueDiffers

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatatableColumnComponent],
      providers: [DatatableColumnChangesService],
      teardown: { destroyAfterEach: false },
    }).compileComponents()
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
      { prop: 'color', name: 'Color' },
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
      differs,
    )

    expect(result).toEqual(
      expect.arrayContaining([
        ...defaultColumnWithIdentMatchers([
          { prop: 'name', name: 'Name' },
          { prop: 'age', name: 'Age' },
          { prop: 'color', name: 'Color' },
        ]).map((v) => expect.objectContaining(v)),
      ]),
    )
  })

  it('should prioritize Template props', () => {
    const tplCols: DatatableColumnComponent[] = initTemplateColumnComponents([
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
      { prop: 'color', name: 'Color' },
    ])
    const inpCols: TheSeamDatatableColumn[] = [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age', cellClass: 'inp-class' },
      { prop: 'color', name: 'Color' },
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
      differs,
    )

    expect(result).toEqual(
      expect.arrayContaining([
        ...defaultColumnWithIdentMatchers([
          { prop: 'name', name: 'Name' },
          { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
          { prop: 'color', name: 'Color' },
        ]).map((v) => expect.objectContaining(v)),
      ]),
    )
  })

  /**
   * Mainly just need to test `TheSeamDatatableColumn` objects, so this just
   * simplifies initializing column component objects.
   */
  function initTemplateColumnComponents(
    o: TheSeamDatatableColumn[],
  ): DatatableColumnComponent[] {
    const comps: DatatableColumnComponent[] = []
    for (const col of o) {
      const comp: any = TestBed.createComponent(
        DatatableColumnComponent,
      ).componentInstance
      const changes: SimpleChanges = {}
      for (const key of Object.keys(col)) {
        comp[key] = (col as any)[key]
        changes[key] = new SimpleChange(null, (col as any)[key], true)
      }
      comp.ngOnChanges(changes)

      comps.push(comp)
    }
    return comps
  }
})

/**
 * Populates defaults, but replaces '$$id' with an "any string" matcher and
 * '$$valueGetter' with an "any function" matcher.
 */
function defaultColumnWithIdentMatchers(
  o: TheSeamDatatableColumn[],
  includesTplCols: boolean = false,
): TheSeamDatatableColumn[] {
  setColumnDefaults(o)
  for (const col of o) {
    const _o: any = col
    _o.$$id = expect.any(String)
    _o.$$valueGetter = expect.any(Function)

    if (includesTplCols) {
      _o._columnChangesService = expect.anything()
      _o._isFirstChange = expect.any(Boolean)
    }
  }
  return o
}
