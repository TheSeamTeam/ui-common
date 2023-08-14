import { MockDatatable } from './mock-datatable'

interface TestItem {
  name: string
}

function generateData(n: number): TestItem[] {
  const data: TestItem[] = []
  for (let i = 0; i < n; i++) {
    data.push({ name: `Item ${n}` })
  }
  return data
}

describe('GqlDatatableFixture', () => {
  describe('no data', () => {
    it('should have valid initial state', () => {
      const fixture = new MockDatatable()
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 0 })
      expect(fixture.sorts.length).toBe(0)
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })
  })

  describe('0 items', () => {
    let fixture: MockDatatable

    beforeEach(() => {
      fixture = new MockDatatable()
      fixture.setRows([])
    })

    it('should have valid initial state', () => {
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 0 })
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })
  })

  describe('5 items', () => {
    let fixture: MockDatatable

    beforeEach(() => {
      fixture = new MockDatatable()
      fixture.setRows(generateData(5))
    })

    it('should have valid initial state', () => {
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 5 })
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })

    it('should not allow trying to go past last page', () => {
      fixture.setPage(1)
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 5 })
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })
  })

  describe('10 items', () => {
    let fixture: MockDatatable

    beforeEach(() => {
      fixture = new MockDatatable()
      fixture.setRows(generateData(10))
    })

    it('should have valid initial state', () => {
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 10 })
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })

    it('should not allow trying to go past last page', () => {
      fixture.setPage(1)
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 10 })
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })
  })

  describe('scrolling', () => {
    let fixture: MockDatatable

    beforeEach(() => {
      fixture = new MockDatatable()
      fixture.setRows(generateData(30))
    })

    it('should increase page when scrolled', () => {
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 10, count: 30 })
      expect(fixture.getNumPages()).toBe(3)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)

      fixture.setScrolledPosV(60)

      expect(fixture.ngxDatatable).toEqual({ offset: 1, pageSize: 10, count: 30 })
      expect(fixture.getNumPages()).toBe(3)
      expect(fixture.getPage()).toBe(1)
      expect(fixture.getPageSize()).toBe(10)
    })
  })
})
