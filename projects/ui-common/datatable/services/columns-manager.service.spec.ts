import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { adjustColumnWidths, ColumnMode, forceFillColumnWidths, TableColumn } from '@marklb/ngx-datatable'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { TheSeamDatatableColumn } from '../models/table-column'
import { setColumnDefaults } from '../utils/set-column-defaults'

import { ColumnsManagerService } from './columns-manager.service'
import { DatatableColumnChangesService } from './datatable-column-changes.service'

fdescribe('ColumnsManagerService', () => {
  let service: ColumnsManagerService
  let colChangesService: DatatableColumnChangesService
  let datatable: MockDatatable
  let columnsSubscription: Subscription

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
    columnsSubscription = service.columns$.subscribe(c => datatable.columns = c)
    service.setInternalColumnsGetter(() => datatable._internalColumns || [])
  })

  afterEach(() => {
    columnsSubscription.unsubscribe()
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

  // TODO: Should this work? I think it may be limitting some situations.
  it('returns once if same input columns set twice', fakeAsync(() => {
    service.setInputColumns([ { prop: 'name', name: 'Name' } ])
    const spy = jasmine.createSpy()
    service.columns$.subscribe(spy)
    service.setInputColumns([ { prop: 'name', name: 'Name' } ])
    expect(spy).toHaveBeenCalledOnceWith([
      ...defaultColumnWithIdentMatchers([ { prop: 'name', name: 'Name' } ])
    ].map(v => jasmine.objectContaining(v)))
  }))

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
