import { SearchNumericColumnsDataFilter } from './search-numeric.columns-data-filter'
import { TheSeamDatatableColumn } from '../table-column'
import { firstValueFrom, take, toArray } from 'rxjs'

function createFilter(
  prop = 'age',
  initialValue: any = undefined,
  column: Partial<TheSeamDatatableColumn> = {},
): SearchNumericColumnsDataFilter {
  return new SearchNumericColumnsDataFilter(prop, initialValue, {
    prop,
    name: 'Age',
    ...column,
  } as TheSeamDatatableColumn)
}

const DATA = [
  { name: 'Mark', age: 27 },
  { name: 'Joe', age: 33 },
  { name: 'Alice', age: 30 },
  { name: 'Bill', age: 40 },
  { name: 'Sally', age: 25 },
  { name: 'Jason', age: 'abc' as any },
  { name: 'David', age: null },
  { name: 'New', age: undefined },
]

describe('SearchNumericColumnsDataFilter', () => {
  describe('construction', () => {
    it('should create with default form values', () => {
      const filter = createFilter()
      expect(filter.form.value.searchType).toBe('eq')
      expect(filter.form.value.searchText).toBeNull()
      expect(filter.form.value.fromText).toBeNull()
      expect(filter.form.value.toText).toBeNull()
    })

    it('should create with initial values', () => {
      const filter = createFilter('age', {
        searchType: 'gt',
        searchText: '30',
        fromText: null,
        toText: null,
      })
      expect(filter.form.value.searchType).toBe('gt')
      expect(filter.form.value.searchText).toBe('30')
    })

    it('should set uid from name and prop', () => {
      const filter = createFilter('age')
      expect(filter.uid).toBe('search-numeric--age')
    })

    it('should set name to search-numeric', () => {
      const filter = createFilter()
      expect(filter.name).toBe('search-numeric')
    })
  })

  describe('isDefault()', () => {
    it('should return true with default form values', () => {
      const filter = createFilter()
      expect(filter.isDefault()).toBe(true)
    })

    it('should return false when searchType is blank', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'blank' })
      expect(filter.isDefault()).toBe(false)
    })

    it('should return false when searchType is not-blank', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'not-blank' })
      expect(filter.isDefault()).toBe(false)
    })

    it('should return false when searchText is set with text search type', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'eq', searchText: '30' })
      expect(filter.isDefault()).toBe(false)
    })

    it('should return true when searchText is empty with text search type', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'gt', searchText: null })
      expect(filter.isDefault()).toBe(true)
    })

    it('should return false when range values are set with range search type', () => {
      const filter = createFilter()
      filter.form.patchValue({
        searchType: 'between',
        fromText: '25',
        toText: '35',
      })
      expect(filter.isDefault()).toBe(false)
    })

    it('should return true when range search type but missing from/to', () => {
      const filter = createFilter()
      filter.form.patchValue({
        searchType: 'between',
        fromText: '25',
        toText: null,
      })
      expect(filter.isDefault()).toBe(true)
    })
  })

  describe('dataFilter()', () => {
    it('should return all data when filterValue is null', () => {
      const filter = createFilter()
      expect(filter.dataFilter(DATA, null as any, undefined)).toEqual(DATA)
    })

    it('should return all data when isDefault() is true', () => {
      const filter = createFilter()
      expect(
        filter.dataFilter(
          DATA,
          { searchType: 'eq', searchText: null },
          undefined,
        ),
      ).toEqual(DATA)
    })

    describe('eq', () => {
      it('should filter rows where prop equals numeric value', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'eq', searchText: '30' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'eq', searchText: '30' },
          undefined,
        )
        expect(result).toEqual([expect.objectContaining({ name: 'Alice' })])
      })
    })

    describe('lt', () => {
      it('should filter rows where prop is less than value', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'lt', searchText: '28' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'lt', searchText: '28' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark', age: 27 }),
          expect.objectContaining({ name: 'Sally', age: 25 }),
        ])
      })
    })

    describe('lte', () => {
      it('should filter rows where prop is less than or equal', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'lte', searchText: '27' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'lte', searchText: '27' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark', age: 27 }),
          expect.objectContaining({ name: 'Sally', age: 25 }),
        ])
      })
    })

    describe('gt', () => {
      it('should filter rows where prop is greater than value', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'gt', searchText: '33' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'gt', searchText: '33' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Bill', age: 40 }),
        ])
      })
    })

    describe('gte', () => {
      it('should filter rows where prop is greater than or equal', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'gte', searchText: '33' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'gte', searchText: '33' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Joe', age: 33 }),
          expect.objectContaining({ name: 'Bill', age: 40 }),
        ])
      })
    })

    describe('between', () => {
      it('should filter rows where prop is within range (inclusive)', () => {
        const filter = createFilter()
        filter.form.patchValue({
          searchType: 'between',
          fromText: '27',
          toText: '33',
        })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'between', fromText: '27', toText: '33' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark', age: 27 }),
          expect.objectContaining({ name: 'Joe', age: 33 }),
          expect.objectContaining({ name: 'Alice', age: 30 }),
        ])
      })
    })

    describe('not-between', () => {
      it('should filter rows where prop is outside range', () => {
        const filter = createFilter()
        filter.form.patchValue({
          searchType: 'not-between',
          fromText: '27',
          toText: '33',
        })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'not-between', fromText: '27', toText: '33' },
          undefined,
        )
        // NaN is not >= 27 && not <= 33, so not-between includes NaN rows
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Bill', age: 40 }),
            expect.objectContaining({ name: 'Sally', age: 25 }),
          ]),
        )
        // Bill and Sally are definitely outside, NaN rows also match !(NaN >= 27 && NaN <= 33) = !(false) = true
        expect(
          result.some((r: any) => r.name === 'Mark' || r.name === 'Joe'),
        ).toBe(false)
      })
    })

    describe('blank', () => {
      it('should filter rows where prop is null, undefined, or empty string', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'blank' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'blank' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'David', age: null }),
          expect.objectContaining({ name: 'New', age: undefined }),
        ])
      })
    })

    describe('not-blank', () => {
      it('should filter rows where prop has a value', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'not-blank' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'not-blank' },
          undefined,
        )
        expect(result.length).toBe(DATA.length - 2)
        expect(
          result.every((r: any) => r.age !== null && r.age !== undefined),
        ).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should return all data with console.warn when searchText is NaN for text type', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'eq', searchText: 'abc' })
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const result = filter.dataFilter(
          DATA,
          { searchType: 'eq', searchText: 'abc' },
          undefined,
        )
        expect(result).toEqual(DATA)
        expect(warnSpy).toHaveBeenCalledWith(
          'No filter applied - invalid search terms.',
        )
        warnSpy.mockRestore()
      })

      it('should return all data when range values are missing for between', () => {
        const filter = createFilter()
        filter.form.patchValue({
          searchType: 'between',
          fromText: '25',
          toText: null,
        })
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const result = filter.dataFilter(
          DATA,
          { searchType: 'between', fromText: '25', toText: null },
          undefined,
        )
        expect(result).toEqual(DATA)
        warnSpy.mockRestore()
      })

      it('should handle non-numeric prop values (NaN comparisons)', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'gt', searchText: '0' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'gt', searchText: '0' },
          undefined,
        )
        // NaN > 0 is false, null/undefined parse to NaN too
        expect(result.every((r: any) => typeof r.age === 'number')).toBe(true)
      })

      it('should return data when data is empty', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'eq', searchText: '30' })
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const result = filter.dataFilter(
          [],
          { searchType: 'eq', searchText: '30' },
          undefined,
        )
        expect(result).toEqual([])
        warnSpy.mockRestore()
      })
    })
  })

  describe('clearFilter()', () => {
    it('should reset form to defaults', () => {
      const filter = createFilter()
      filter.form.patchValue({
        searchType: 'between',
        fromText: '10',
        toText: '50',
        searchText: '30',
      })
      filter.clearFilter()
      expect(filter.form.value).toEqual({
        searchType: 'eq',
        searchText: null,
        fromText: null,
        toText: null,
      })
      expect(filter.isDefault()).toBe(true)
    })
  })

  describe('filterState()', () => {
    it('should return correct shape', () => {
      const filter = createFilter('age')
      filter.form.patchValue({ searchType: 'gt', searchText: '30' })
      const state = filter.filterState()
      expect(state).toEqual({
        name: 'search-numeric',
        state: {
          prop: 'age',
          formValue: {
            searchType: 'gt',
            searchText: '30',
            fromText: null,
            toText: null,
          },
        },
      })
    })
  })

  describe('applyFilter()', () => {
    it('should cause filterStateChanges to emit', async () => {
      const filter = createFilter()
      const states = firstValueFrom(
        filter.filterStateChanges.pipe(take(2), toArray()),
      )
      filter.applyFilter()
      const result = await states
      expect(result.length).toBe(2)
    })
  })

  describe('filter()', () => {
    it('should return observable that re-emits filtered data after applyFilter()', async () => {
      const filter = createFilter()
      const data = [{ age: 25 }, { age: 30 }, { age: 40 }]

      const results = firstValueFrom(
        filter.filter(data).pipe(take(2), toArray()),
      )

      filter.form.patchValue({ searchType: 'gt', searchText: '28' })
      filter.applyFilter()

      const emissions = await results
      expect(emissions[0].length).toBe(3)
      expect(emissions[1].length).toBe(2)
    })
  })
})
