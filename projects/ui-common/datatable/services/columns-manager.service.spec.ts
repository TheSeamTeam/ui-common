import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { take } from 'rxjs/operators'

import {
  adjustColumnWidths,
  ColumnMode,
  forceFillColumnWidths,
  SelectionType,
  TableColumn
} from '@marklb/ngx-datatable'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { TheSeamDatatableColumn } from '../models/table-column'
import { ACTION_MENU_COLUMN_PROP } from '../utils/create-action-menu-column'
import { CHECKBOX_COLUMN_PROP } from '../utils/create-checkbox-column'
import { setColumnDefaults } from '../utils/set-column-defaults'

import { ColumnsManagerService } from './columns-manager.service'
import { DatatableColumnChangesService } from './datatable-column-changes.service'

describe('ColumnsManagerService', () => {
  let service: ColumnsManagerService
  let colChangesService: DatatableColumnChangesService
  let datatable: MockDatatable

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ ColumnsManagerService ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    colChangesService = new DatatableColumnChangesService()
    service = TestBed.inject(ColumnsManagerService)
    datatable = new MockDatatable()
    service.setInternalColumnsGetter(() => datatable._internalColumns || [])
  })

  it('returns 0 columns by default', fakeAsync(() => {
    const spy = jasmine.createSpy()
    service.columns$.subscribe(spy)
    expect(spy).toHaveBeenCalledOnceWith([])
  }))

  it('returns input columns set before observed', fakeAsync(() => {
    service.setInputColumns([ { prop: 'name', name: 'Name' } ])
    const spy = jasmine.createSpy()
    service.columns$.subscribe(spy)
    expect(spy).toHaveBeenCalledOnceWith([
      ...defaultColumnWithIdentMatchers([ { prop: 'name', name: 'Name' } ])
    ].map(v => jasmine.objectContaining(v)))
  }))

  it('returns 0 columns if only templateColumns', fakeAsync(() => {
    service.setTemplateColumns(initTemplateColumnComponents([ { prop: 'name', name: 'Name' } ]))
    const spy = jasmine.createSpy()
    service.columns$.subscribe(spy)
    expect(spy).toHaveBeenCalledOnceWith([])
  }))

  // TODO: Should this work? I think it may be limitting some situations and
  // maybe shouldn't be changed to make this pass.
  // it('returns once if same input columns set twice', fakeAsync(() => {
  //   const spy = jasmine.createSpy()
  //   service.columns$.subscribe(spy)
  //   service.setInputColumns([ { prop: 'name', name: 'Name' } ])
  //   service.setInputColumns([ { prop: 'name', name: 'Name' } ])
  //   // 2, because of initial emitted value on subscription then the column set.
  //   expect(spy).toHaveBeenCalledTimes(2)
  //   expect(spy).toHaveBeenCalledOnceWith([
  //     ...defaultColumnWithIdentMatchers([ { prop: 'name', name: 'Name' } ])
  //   ].map(v => jasmine.objectContaining(v)))
  // }))

  it('should return Input columns with defaults', async () => {
    service.setInputColumns([
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ])
    expect(await service.columns$.pipe(take(1)).toPromise()).toEqual(jasmine.arrayContaining([
      ...defaultColumnWithIdentMatchers([
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' }
      ]).map(v => jasmine.objectContaining(v))
    ]))
  })

  it('should prioritize Template props', async () => {
    service.setInputColumns([
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age', cellClass: 'inp-class' },
      { prop: 'color', name: 'Color' }
    ])
    service.setTemplateColumns(initTemplateColumnComponents([
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
      { prop: 'color', name: 'Color' }
    ]))
    expect(await service.columns$.pipe(take(1)).toPromise()).toEqual(jasmine.arrayContaining([
      ...defaultColumnWithIdentMatchers([
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age', cellClass: 'tpl-class' },
        { prop: 'color', name: 'Color' }
      ]).map(v => jasmine.objectContaining(v))
    ]))
  })

  describe('checkbox column', () => {
    it('should not have checkbox column by default', async () => {
      expect((await service.columns$.pipe(take(1)).toPromise()).length).toEqual(0)
    })

    it('should have checkbox column when selectionType is "checkbox"', async () => {
      service.setSelectionType(SelectionType.checkbox)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({ prop: CHECKBOX_COLUMN_PROP })
      )
    })
  })

  describe('rowActionItem', () => {
    it('should not have row action menu column if not set', async () => {
      expect((await service.columns$.pipe(take(1)).toPromise()).length).toEqual(0)
    })

    it('should have row action menu column when actionMenuCellTpl set', async () => {
      service.setRowActionItem({} as any)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: ACTION_MENU_COLUMN_PROP,
          cellTemplate: undefined,
          headerTemplate: undefined
        })
      )
    })

    it('should have row action menu column with cellTemplate', async () => {
      const cellTemplate = {} as any
      service.setRowActionItem({} as any)
      service.setActionMenuCellTpl(cellTemplate)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: ACTION_MENU_COLUMN_PROP,
          cellTemplate: cellTemplate,
          headerTemplate: undefined
        })
      )
    })

    it('should have row action menu column with headerTemplate', async () => {
      const headerTemplate = {} as any
      service.setRowActionItem({} as any)
      service.setBlankHeaderTpl(headerTemplate)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: ACTION_MENU_COLUMN_PROP,
          cellTemplate: undefined,
          headerTemplate: headerTemplate
        })
      )
    })

    it('should have row action menu column with cellTemplate and headerTemplate', async () => {
      const cellTemplate = {} as any
      const headerTemplate = {} as any
      service.setRowActionItem({} as any)
      service.setActionMenuCellTpl(cellTemplate)
      service.setBlankHeaderTpl(headerTemplate)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: ACTION_MENU_COLUMN_PROP,
          cellTemplate: cellTemplate,
          headerTemplate: headerTemplate
        })
      )
    })
  })

  describe('treeToggleTpl', () => {
    it('should not have treeToggleTemplate', async () => {
      service.setInputColumns([ { prop: 'name' } ])
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
          // isTreeColumn: undefined
        })
      )
    })

    it('should not have treeToggleTemplate if only isTreeColumn set', async () => {
      service.setInputColumns([ { prop: 'name', isTreeColumn: true } ])
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
          isTreeColumn: true
        })
      )
    })

    it('should have treeToggleTemplate if isTreeColumn and treeToggleTemplate set', async () => {
      const tpl = {} as any
      service.setInputColumns([ { prop: 'name', isTreeColumn: true, treeToggleTemplate: tpl } ])
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
          isTreeColumn: true,
          treeToggleTemplate: tpl
        })
      )
    })
  })

  describe('headerTemplate', () => {
    it('should not have headerTemplate', async () => {
      service.setInputColumns([ { prop: 'name' } ])
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name'
        })
      )
    })

    it('should have headerTemplate from column input', async () => {
      const tpl1 = { a: 'a' } as any
      const tpl2 = { b: 'b' } as any
      service.setInputColumns([ { prop: 'name', headerTemplate: tpl1 } ])
      service.setHeaderTpl(tpl2)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
          headerTemplate: tpl1
        })
      )
    })

    it('should have headerTemplate from setHeaderTpl', async () => {
      const tpl1 = { a: 'a' } as any
      const tpl2 = { b: 'b' } as any
      service.setInputColumns([ { prop: 'name' } ])
      service.setHeaderTpl(tpl2)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
          headerTemplate: tpl2
        })
      )
    })
  })

  describe('cellTypeSelectorTpl', () => {
    it('should not have cellTypeSelectorTpl', async () => {
      service.setInputColumns([ { prop: 'name' } ])
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
        })
      )
    })

    it('should have cellTemplate if cellType set', async () => {
      const tpl = { a: 'a' } as any
      service.setInputColumns([ { prop: 'name', cellType: 'a' } ])
      service.setCellTypeSelectorTpl(tpl)
      expect((await service.columns$.pipe(take(1)).toPromise())[0]).toEqual(
        jasmine.objectContaining({
          prop: 'name',
          cellType: 'a',
          cellTemplate: tpl
        })
      )
    })
  })

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
      const comp: any = new DatatableColumnComponent(colChangesService)
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

class MockDatatable {

  _internalColumns?: TableColumn[]
  private _columns: TableColumn[] = []
  private _innerWidth: number = 500

  scrollbarH: boolean = false
  scrollbarV: boolean = false
  scrollbarHelper = { width: 10 }
  columnMode: ColumnMode | keyof typeof ColumnMode = ColumnMode.standard

  /**
   * Columns to be displayed.
   */
  set columns(val: TableColumn[]) {
    if (val) {
      this._internalColumns = [...val]
      setColumnDefaults(this._internalColumns)
      this.recalculateColumns()
    }

    this._columns = val
  }

  /**
   * Get the columns.
   */
  get columns(): TableColumn[] {
    return this._columns
  }

  /**
   * Recalulcates the column widths based on column width
   * distribution mode and scrollbar offsets.
   */
  recalculateColumns(
    columns: any[] = this._internalColumns as any,
    forceIdx: number = -1,
    allowBleed: boolean = this.scrollbarH
  ): any[] | undefined {
    if (!columns) { return undefined }

    let width = this._innerWidth
    if (this.scrollbarV) {
      width = width - this.scrollbarHelper.width
    }

    if (this.columnMode === ColumnMode.force) {
      forceFillColumnWidths(columns, width, forceIdx, allowBleed)
    } else if (this.columnMode === ColumnMode.flex) {
      adjustColumnWidths(columns, width)
    }

    return columns
  }
}
