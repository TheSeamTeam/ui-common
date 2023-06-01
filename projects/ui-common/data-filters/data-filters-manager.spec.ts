import { Observable, of, Subject } from 'rxjs'

import { DataFilter, DataFilterState } from './data-filter'
import { DataFiltersManager } from './data-filters-manager'

describe('DataFiltersManager', () => {
  it('should add filter', () => {
    const filter = new MockFilter()
    const manager = new DataFiltersManager()
    expect(manager.filters.length).toBe(0)
    manager.addFilters([ filter ])
    expect(manager.filters.length).toBe(1)
    expect(manager.filters[0]).toBe(filter)
  })

  it('should add filters', () => {
    const filter1 = new MockFilter()
    const filter2 = new MockFilter()
    const manager = new DataFiltersManager()
    expect(manager.filters.length).toBe(0)
    manager.addFilters([ filter1, filter2 ])
    expect(manager.filters.length).toBe(2)
    expect(manager.filters[0]).toBe(filter1)
    expect(manager.filters[1]).toBe(filter2)
  })

  it('should remove filter', () => {
    const filter = new MockFilter()
    const manager = new DataFiltersManager()
    expect(manager.filters.length).toBe(0)
    manager.addFilters([ filter ])
    expect(manager.filters.length).toBe(1)
    expect(manager.filters[0]).toBe(filter)
    manager.removeFilters([ filter ])
    expect(manager.filters.length).toBe(0)
  })

  it('should remove filters', () => {
    const filter1 = new MockFilter()
    const filter2 = new MockFilter()
    const filter3 = new MockFilter()
    const manager = new DataFiltersManager()
    expect(manager.filters.length).toBe(0)
    manager.addFilters([ filter1, filter2, filter3 ])
    expect(manager.filters.length).toBe(3)
    expect(manager.filters[0]).toBe(filter1)
    expect(manager.filters[1]).toBe(filter2)
    expect(manager.filters[2]).toBe(filter3)
    manager.removeFilters([ filter1, filter3 ])
    expect(manager.filters.length).toBe(1)
    expect(manager.filters[0]).toBe(filter2)
  })

  it('should emit filterChanged on filter added', () => {
    const filter = new MockFilter()
    const manager = new DataFiltersManager()
    let count = 0
    manager.filtersChanged.subscribe(() => count++)
    expect(count).toBe(0)
    manager.addFilters([ filter ])
    expect(count).toBe(1)
  })

  it('should emit filterChanged on filter removed', () => {
    const filter = new MockFilter()
    const manager = new DataFiltersManager()
    manager.addFilters([ filter ])
    let count = 0
    manager.filtersChanged.subscribe(() => count++)
    expect(count).toBe(0)
    manager.removeFilters([ filter ])
    expect(count).toBe(1)
  })
})

//
let _uid = 0

class MockFilter implements DataFilter {
  name = 'mock'
  uid = `mock${_uid++}`

  filterStateChanges = new Subject<DataFilterState>()

  filter<T>(data: T[]): Observable<T[]> {
    return of(data)
  }

  filterState(): DataFilterState {
    return { name: this.name, state: { } }
  }
}
