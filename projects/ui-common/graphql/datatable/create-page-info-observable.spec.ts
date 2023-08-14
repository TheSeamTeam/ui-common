import { fakeAsync, tick } from '@angular/core/testing'
import { Subject } from 'rxjs'

import { GqlDatatableAccessor } from '../models/gql-datatable-accessor'
import { MockDatatable } from '../testing/mock-datatable'
import { createPageInfoObservable } from './create-page-info-observable'

describe('createPageInfoObservable', () => {
  it('should not emit, until a datatable is emitted', fakeAsync(() => {
    const dt$ = new Subject<GqlDatatableAccessor | null | undefined>()
    let count = 0
    const sub = createPageInfoObservable(dt$).subscribe(() => count++)
    tick(1)
    expect(count).toBe(0)
    dt$.next(new MockDatatable())
    sub.unsubscribe()
  }))

  it('should emit, when a datatable is emitted', fakeAsync(() => {
    const dt$ = new Subject<GqlDatatableAccessor | null | undefined>()
    let count = 0
    const sub = createPageInfoObservable(dt$).subscribe(() => count++)
    tick(1)
    dt$.next(new MockDatatable())
    expect(count).toBe(1)
    tick(1)
    expect(count).toBe(1)
    sub.unsubscribe()
  }))

  it('should emit when page changes', fakeAsync(() => {
    const dt$ = new Subject<GqlDatatableAccessor | null | undefined>()
    let count = 0
    const sub = createPageInfoObservable(dt$).subscribe(() => count++)
    tick(1)
    const datatable = new MockDatatable()
    datatable.setRows(new Array(30))
    dt$.next(datatable)
    expect(count).toBe(1)
    tick(1)
    expect(count).toBe(1)
    datatable.setPage(1)
    expect(count).toBe(2)
    sub.unsubscribe()
  }))

  it('should not emit when datatable changes to another datatable with same pageInfo', fakeAsync(() => {
    const dt$ = new Subject<GqlDatatableAccessor | null | undefined>()
    let count = 0
    const sub = createPageInfoObservable(dt$).subscribe(() => count++)
    tick(1)
    dt$.next(new MockDatatable())
    expect(count).toBe(1)
    tick(1)
    expect(count).toBe(1)
    dt$.next(new MockDatatable())
    expect(count).toBe(1)
    sub.unsubscribe()
  }))

  it('should emit when datatable changes to another datatable with different pageInfo', fakeAsync(() => {
    const dt$ = new Subject<GqlDatatableAccessor | null | undefined>()
    let count = 0
    const sub = createPageInfoObservable(dt$).subscribe(() => count++)
    tick(1)
    const datatable = new MockDatatable()
    datatable.setRows(new Array(30))
    dt$.next(datatable)
    expect(count).toBe(1)
    tick(1)
    expect(count).toBe(1)
    const datatable2 = new MockDatatable()
    datatable.setRows(new Array(35))
    dt$.next(datatable2)
    expect(count).toBe(2)
    sub.unsubscribe()
  }))

  it('should emit when datatable changes to null then another datatable', fakeAsync(() => {
    const dt$ = new Subject<GqlDatatableAccessor | null | undefined>()
    let count = 0
    const sub = createPageInfoObservable(dt$).subscribe(() => count++)
    tick(1)
    dt$.next(new MockDatatable())
    expect(count).toBe(1)
    tick(1)
    expect(count).toBe(1)
    dt$.next(null)
    tick(1)
    expect(count).toBe(1)
    dt$.next(new MockDatatable())
    tick(1)
    expect(count).toBe(2)
    sub.unsubscribe()
  }))
})
