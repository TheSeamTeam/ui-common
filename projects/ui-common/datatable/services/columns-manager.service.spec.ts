import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { TheSeamDatatableColumn } from '../models/table-column'
import { setColumnDefaults } from '../utils/set-column-defaults'

import { ColumnsManagerService } from './columns-manager.service'
import { DatatableColumnChangesService } from './datatable-column-changes.service'

fdescribe('ColumnsManagerService', () => {
  let service: ColumnsManagerService
  let _colChangesService: DatatableColumnChangesService

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ ColumnsManagerService ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    _colChangesService = new DatatableColumnChangesService()
    service = TestBed.inject(ColumnsManagerService)
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

  it('returns once if same input columns set twice', fakeAsync(() => {
    service.setInputColumns([ { prop: 'name', name: 'Name' } ])
    const spy = jasmine.createSpy()
    service.columns$.subscribe(spy)
    service.setInputColumns([ { prop: 'name', name: 'Name' } ])
    expect(spy).toHaveBeenCalledOnceWith([
      ...defaultColumnWithIdentMatchers([ { prop: 'name', name: 'Name' } ])
    ].map(v => jasmine.objectContaining(v)))
  }))


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
