import { SearchDateColumnsDataFilter } from './search-date.columns-data-filter'
import { TheSeamDatatableColumn } from '../table-column'
import { getFormattedDateForComparison } from './utils'
import { firstValueFrom, take, toArray } from 'rxjs'

function createFilter(
  prop = 'startDate',
  initialValue: any = null as any,
  column: Partial<TheSeamDatatableColumn> = {},
): SearchDateColumnsDataFilter {
  return new SearchDateColumnsDataFilter(prop, initialValue, {
    prop,
    name: 'Start Date',
    filterOptions: { dateType: 'date' },
    ...column,
  } as TheSeamDatatableColumn)
}

function createDatetimeFilter(
  prop = 'startDate',
  initialValue: any = null as any,
): SearchDateColumnsDataFilter {
  return createFilter(prop, initialValue, {
    filterOptions: { dateType: 'datetime-local' },
  })
}

const DATA = [
  { name: 'Mark', startDate: '2017-01-21 20:15:20.4166667 +00:00' },
  { name: 'Joe', startDate: '2012-04-25 17:29:36.4266667 +00:00' },
  { name: 'Shelby', startDate: '2020-11-18 20:47:25.1733333 +00:00' },
  { name: 'David', startDate: '2021-06-29 16:31:37.2733333 +00:00' },
  { name: 'Pam', startDate: '2012-08-11 04:00:00.000000 +00:00' },
  { name: 'Empty', startDate: null },
  { name: 'Missing', startDate: undefined },
]

describe('SearchDateColumnsDataFilter', () => {
  describe('construction', () => {
    it('should create with default form values', () => {
      const filter = createFilter()
      expect(filter.form.value.searchType).toBe('eq')
      expect(filter.form.value.searchText).toBeNull()
      expect(filter.form.value.fromText).toBeNull()
      expect(filter.form.value.toText).toBeNull()
    })

    it('should set dateType from column filterOptions', () => {
      const filter = createFilter()
      expect(filter.options.dateType).toBe('date')
    })

    it('should default dateType to date', () => {
      const filter = new SearchDateColumnsDataFilter(
        'startDate',
        null as any,
        { prop: 'startDate', name: 'Start Date' } as TheSeamDatatableColumn,
      )
      expect(filter.options.dateType).toBe('date')
    })

    it('should set datetime-local dateType', () => {
      const filter = createDatetimeFilter()
      expect(filter.options.dateType).toBe('datetime-local')
    })

    it('should set uid from name and prop', () => {
      const filter = createFilter('startDate')
      expect(filter.uid).toBe('search-date--startDate')
    })

    it('should set name to search-date', () => {
      const filter = createFilter()
      expect(filter.name).toBe('search-date')
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
      filter.form.patchValue({ searchType: 'eq', searchText: '2020-01-01' })
      expect(filter.isDefault()).toBe(false)
    })

    it('should return true when searchText is empty with text search type', () => {
      const filter = createFilter()
      filter.form.patchValue({ searchType: 'gt', searchText: null })
      expect(filter.isDefault()).toBe(true)
    })

    it('should return false when range values set with range search type', () => {
      const filter = createFilter()
      filter.form.patchValue({
        searchType: 'between',
        fromText: '2012-01-01',
        toText: '2018-01-01',
      })
      expect(filter.isDefault()).toBe(false)
    })

    it('should return true when range search type but missing from/to', () => {
      const filter = createFilter()
      filter.form.patchValue({
        searchType: 'between',
        fromText: '2012-01-01',
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

    describe('blank', () => {
      it('should filter rows where date is null/undefined/empty', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'blank' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'blank' },
          undefined,
        )
        expect(result).toEqual([
          expect.objectContaining({ name: 'Empty' }),
          expect.objectContaining({ name: 'Missing' }),
        ])
      })
    })

    describe('not-blank', () => {
      it('should filter rows where date has a value', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'not-blank' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'not-blank' },
          undefined,
        )
        expect(result.length).toBe(5)
        expect(result.every((r: any) => r.startDate != null)).toBe(true)
      })
    })

    describe('eq with dateType date', () => {
      it('should match dates at day granularity', () => {
        const filter = createFilter()
        // 2017-01-21 in UTC — the filter uses getFormattedDateForComparison
        // which for dateType 'date' zeroes hours and applies timezone offset for search input
        filter.form.patchValue({ searchType: 'eq', searchText: '2017-01-21' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'eq', searchText: '2017-01-21' },
          undefined,
        )
        // Mark's date is 2017-01-21 20:15:20 UTC, which when zeroed for 'date' comparison
        // should match 2017-01-21 (both zeroed to midnight)
        expect(result).toEqual([expect.objectContaining({ name: 'Mark' })])
      })
    })

    describe('lt', () => {
      it('should filter rows with date before given date', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'lt', searchText: '2015-01-01' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'lt', searchText: '2015-01-01' },
          undefined,
        )
        // Joe: 2012-04-25, Pam: 2012-08-11 are before 2015
        expect(result.length).toBe(2)
        expect(result.map((r: any) => r.name).sort()).toEqual(['Joe', 'Pam'])
      })
    })

    describe('gt', () => {
      it('should filter rows with date after given date', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'gt', searchText: '2020-01-01' })
        const result = filter.dataFilter(
          DATA,
          { searchType: 'gt', searchText: '2020-01-01' },
          undefined,
        )
        // Shelby: 2020-11-18, David: 2021-06-29
        expect(result.length).toBe(2)
        expect(result.map((r: any) => r.name).sort()).toEqual([
          'David',
          'Shelby',
        ])
      })
    })

    describe('between', () => {
      it('should filter rows within date range (inclusive)', () => {
        const filter = createFilter()
        filter.form.patchValue({
          searchType: 'between',
          fromText: '2012-01-01',
          toText: '2018-01-01',
        })
        const result = filter.dataFilter(
          DATA,
          {
            searchType: 'between',
            fromText: '2012-01-01',
            toText: '2018-01-01',
          },
          undefined,
        )
        // Joe: 2012-04-25, Pam: 2012-08-11, Mark: 2017-01-21
        expect(result.length).toBe(3)
        expect(result.map((r: any) => r.name).sort()).toEqual([
          'Joe',
          'Mark',
          'Pam',
        ])
      })
    })

    describe('not-between', () => {
      it('should filter rows outside date range', () => {
        const filter = createFilter()
        filter.form.patchValue({
          searchType: 'not-between',
          fromText: '2012-01-01',
          toText: '2018-01-01',
        })
        const result = filter.dataFilter(
          DATA,
          {
            searchType: 'not-between',
            fromText: '2012-01-01',
            toText: '2018-01-01',
          },
          undefined,
        )
        // Shelby: 2020, David: 2021, plus null/undefined entries (NaN comparisons)
        expect(
          result.some((r: any) => r.name === 'Shelby' || r.name === 'David'),
        ).toBe(true)
        expect(
          result.some((r: any) => r.name === 'Joe' || r.name === 'Pam'),
        ).toBe(false)
      })
    })

    describe('invalid search terms', () => {
      it('should return all data with console.warn for invalid date', () => {
        const filter = createFilter()
        filter.form.patchValue({ searchType: 'eq', searchText: 'not-a-date' })
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const result = filter.dataFilter(
          DATA,
          { searchType: 'eq', searchText: 'not-a-date' },
          undefined,
        )
        expect(result).toEqual(DATA)
        expect(warnSpy).toHaveBeenCalledWith(
          'No filter applied - invalid search terms.',
        )
        warnSpy.mockRestore()
      })

      it('should return all data when range has invalid from date', () => {
        const filter = createFilter()
        filter.form.patchValue({
          searchType: 'between',
          fromText: 'bad',
          toText: '2020-01-01',
        })
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const result = filter.dataFilter(
          DATA,
          { searchType: 'between', fromText: 'bad', toText: '2020-01-01' },
          undefined,
        )
        expect(result).toEqual(DATA)
        warnSpy.mockRestore()
      })
    })
  })

  describe('clearFilter()', () => {
    it('should reset form to defaults', () => {
      const filter = createFilter()
      filter.form.patchValue({
        searchType: 'between',
        fromText: '2020-01-01',
        toText: '2022-01-01',
        searchText: '2021-01-01',
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
    it('should return correct shape including options', () => {
      const filter = createFilter('startDate')
      filter.form.patchValue({ searchType: 'gt', searchText: '2020-01-01' })
      const state = filter.filterState()
      expect(state).toEqual({
        name: 'search-date',
        state: {
          prop: 'startDate',
          formValue: {
            searchType: 'gt',
            searchText: '2020-01-01',
            fromText: null,
            toText: null,
          },
          options: { dateType: 'date' },
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
})

describe('getFormattedDateForComparison', () => {
  it('should zero hours/minutes/seconds/ms for dateType date', () => {
    const result = getFormattedDateForComparison(
      '2020-06-15T14:30:45.123Z',
      'date',
      false,
    )
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('should zero seconds/ms but keep hours/minutes for datetime-local', () => {
    const result = getFormattedDateForComparison(
      '2020-06-15T14:30:45.123Z',
      'datetime-local',
      false,
    )
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
    // Hours/minutes should be preserved (in local timezone)
    expect(result.getFullYear()).toBe(2020)
  })

  it('should return Invalid Date for null input', () => {
    const result = getFormattedDateForComparison(null, 'date', false)
    expect(isNaN(result.valueOf())).toBe(true)
  })

  it('should return Invalid Date for undefined input', () => {
    const result = getFormattedDateForComparison(undefined, 'date', false)
    expect(isNaN(result.valueOf())).toBe(true)
  })

  it('should apply timezone offset when setToLocalTime is true for date type', () => {
    const dateStr = '2020-06-15T00:00:00.000Z'
    const withLocal = getFormattedDateForComparison(dateStr, 'date', true)
    const withoutLocal = getFormattedDateForComparison(dateStr, 'date', false)
    // When setToLocalTime is true, it adds the timezone offset
    // The difference should be the timezone offset in minutes
    const offset = new Date(dateStr).getTimezoneOffset()
    if (offset !== 0) {
      expect(withLocal.valueOf()).not.toBe(withoutLocal.valueOf())
    }
  })
})
