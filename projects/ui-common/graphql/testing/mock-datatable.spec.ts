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
      expect(fixture.ngxDatatable).toEqual({ offset: 0, pageSize: 11, count: 0 })
      expect(fixture.sorts.length).toBe(0)
      expect(fixture.getNumPages()).toBe(1)
      expect(fixture.getPage()).toBe(0)
      expect(fixture.getPageSize()).toBe(10)
    })
  })

  // describe('0 items', () => {
  //   let fixture: MockDatatable

  //   beforeEach(() => {
  //     fixture = new MockDatatable()

  //   })

  //   it('should have valid initial state', () => {

  //   })
  // })

})
