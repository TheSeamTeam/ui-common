import { SearchTextColumnsDataFilter } from './search-text.columns-data-filter'
import { TheSeamDatatableColumn } from '../table-column'
import { firstValueFrom, take, toArray } from 'rxjs'

function createFilter(
  prop = 'name',
  initialValue: any = undefined,
  column: Partial<TheSeamDatatableColumn> = {},
): SearchTextColumnsDataFilter {
  return new SearchTextColumnsDataFilter(prop, initialValue, {
    prop,
    name: 'Name',
    ...column,
  } as TheSeamDatatableColumn)
}

const DATA = [
  { name: 'Mark', color: 'blue' },
  { name: 'Joe', color: 'green' },
  { name: 'Alice', color: 'red' },
  { name: 'mark', color: 'Blue' },
  { name: '', color: '' },
  { name: null, color: null },
  { name: undefined, color: undefined },
]

describe('SearchTextColumnsDataFilter', () => {
  describe('construction', () => {
    it('should create with default form values', () => {
      const filter = createFilter()
      expect(filter.form.value.searchType).toBe('contains')
      expect(filter.form.value.searchText).toBeNull()
    })

    it('should create with initial values', () => {
      const filter = createFilter('name', {
        searchType: 'eq',
        searchText: 'Mark',
      })
      expect(filter.form.value.searchType).toBe('eq')
      expect(filter.form.value.searchText).toBe('Mark')
    })

    it('should set uid from name and prop', () => {
      const filter = createFilter('color')
      expect(filter.uid).toBe('search-text--color')
    })

    it('should set name to search-text', () => {
      const filter = createFilter()
      expect(filter.name).toBe('search-text')
    })
  })

  describe('isDefault()', () => {
    it('should return true with default form values', () => {
      const filter = createFilter()
      expect(filter.isDefault()).toBe(true)
    })

    it('should return true when searchType is text type but searchText is empty', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'contains', searchText: null })
      expect(filter.isDefault()).toBe(true)
    })

    it('should return false when searchText is set with text search type', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'contains', searchText: 'test' })
      expect(filter.isDefault()).toBe(false)
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

    it('should return true when searchType is null/empty', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: null })
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
          { searchType: 'contains', searchText: null },
          undefined,
        ),
      ).toEqual(DATA)
    })

    it('should return empty array for empty data', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'contains', searchText: 'test' })
      expect(
        filter.dataFilter(
          [],
          { searchType: 'contains', searchText: 'test' },
          undefined,
        ),
      ).toEqual([])
    })

    describe('contains', () => {
      it('should filter rows where prop contains text (case-insensitive)', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'contains', searchText: 'ar' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'contains', searchText: 'ar' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark' }),
          expect.objectContaining({ name: 'mark' }),
        ])
      })

      it('should be case-insensitive', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'contains', searchText: 'MARK' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'contains', searchText: 'MARK' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark' }),
          expect.objectContaining({ name: 'mark' }),
        ])
      })
    })

    describe('ncontains', () => {
      it('should filter rows where prop does NOT contain text', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'ncontains', searchText: 'ar' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'ncontains', searchText: 'ar' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Joe' }),
          expect.objectContaining({ name: 'Alice' }),
          expect.objectContaining({ name: '' }),
          expect.objectContaining({ name: null }),
          expect.objectContaining({ name: undefined }),
        ])
      })
    })

    describe('eq', () => {
      it('should filter rows where prop exactly matches text (case-insensitive)', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'eq', searchText: 'mark' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'eq', searchText: 'mark' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark' }),
          expect.objectContaining({ name: 'mark' }),
        ])
      })
    })

    describe('neq', () => {
      it('should filter rows where prop does NOT exactly match text', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'neq', searchText: 'mark' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'neq', searchText: 'mark' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Joe' }),
          expect.objectContaining({ name: 'Alice' }),
          expect.objectContaining({ name: '' }),
          expect.objectContaining({ name: null }),
          expect.objectContaining({ name: undefined }),
        ])
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
        // null and undefined are coerced to '' by the filter, so all three blank entries match
        expect(result).toEqual([
          expect.objectContaining({ name: '' }),
          expect.objectContaining({ name: null }),
          expect.objectContaining({ name: undefined }),
        ])
      })
    })

    describe('not-blank', () => {
      it('should filter rows where prop is NOT null/undefined/empty', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'not-blank' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'not-blank' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Mark' }),
          expect.objectContaining({ name: 'Joe' }),
          expect.objectContaining({ name: 'Alice' }),
          expect.objectContaining({ name: 'mark' }),
        ])
      })
    })

    it('should handle null/undefined prop values by coercing to empty string', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'contains', searchText: '' })
      const result = filter.dataFilter(
        DATA,
        { searchType: 'contains', searchText: '' },
        undefined,
      )
      // Empty string search text matches everything via indexOf
      expect(result.length).toBe(DATA.length)
    })
  })

  describe('clearFilter()', () => {
    it('should reset form to defaults', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'eq', searchText: 'test' })
      filter.clearFilter()
      expect(filter.form.value.searchType).toBe('contains')
      expect(filter.form.value.searchText).toBeNull()
      expect(filter.isDefault()).toBe(true)
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

  describe('filterState()', () => {
    it('should return correct shape', () => {
      const filter = createFilter('name')
      filter.form.patchValue({ searchType: 'eq', searchText: 'Mark' })
      const state = filter.filterState()
      expect(state).toEqual({
        name: 'search-text',
        state: {
          prop: 'name',
          formValue: { searchType: 'eq', searchText: 'Mark' },
        },
      })
    })
  })

  describe('filter()', () => {
    it('should return observable that re-emits filtered data after applyFilter()', async () => {
      const filter = createFilter()
      const data = [{ name: 'Mark' }, { name: 'Joe' }, { name: 'Alice' }]

      const results = firstValueFrom(
        filter.filter(data).pipe(take(2), toArray()),
      )

      filter.form.patchValue({ searchType: 'eq', searchText: 'mark' })
      filter.applyFilter()

      const emissions = await results
      // First emission: default state returns all data
      expect(emissions[0].length).toBe(3)
      // Second emission: filtered to 'mark'
      expect(emissions[1].length).toBe(1)
      expect(emissions[1][0].name).toBe('Mark')
    })
  })
})
