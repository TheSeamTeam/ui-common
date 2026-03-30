import { TestBed, waitForAsync } from '@angular/core/testing'

import { SearchTextColumnsDataFilter } from '../models/columns-data-filters/search-text.columns-data-filter'
import { SearchNumericColumnsDataFilter } from '../models/columns-data-filters/search-numeric.columns-data-filter'
import { SearchDateColumnsDataFilter } from '../models/columns-data-filters/search-date.columns-data-filter'
import {
  THESEAM_COLUMNS_DATA_FILTER,
  ColumnsDataFilter,
} from '../models/columns-data-filter'
import { TheSeamDatatableColumn } from '../models/table-column'

import { ColumnsFiltersService } from './columns-filters.service'
import { DatatableColumnChangesService } from './datatable-column-changes.service'

describe('ColumnsFiltersService', () => {
  let service: ColumnsFiltersService

  function setup(customFilters?: { name: string; class: any }[]) {
    TestBed.configureTestingModule({
      providers: [
        ColumnsFiltersService,
        DatatableColumnChangesService,
        ...(customFilters
          ? customFilters.map((f) => ({
              provide: THESEAM_COLUMNS_DATA_FILTER,
              useValue: f,
              multi: true,
            }))
          : []),
      ],
      teardown: { destroyAfterEach: false },
    })
    service = TestBed.inject(ColumnsFiltersService)
  }

  beforeEach(waitForAsync(() => {
    setup()
  }))

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getColumnFilterProp()', () => {
    it('should return filterProp from filterOptions when set', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'candy',
        name: 'Candy',
        filterOptions: { filterProp: 'candyAttributes' },
      }
      expect(service.getColumnFilterProp(col)).toBe('candyAttributes')
    })

    it('should fall back to column prop', () => {
      const col: TheSeamDatatableColumn = { prop: 'name', name: 'Name' }
      expect(service.getColumnFilterProp(col)).toBe('name')
    })

    it('should camelCase column name as last resort', () => {
      const col: TheSeamDatatableColumn = {
        name: 'Full Name',
      } as TheSeamDatatableColumn
      expect(service.getColumnFilterProp(col)).toBe('fullName')
    })

    it('should return null for null column', () => {
      expect(service.getColumnFilterProp(null)).toBeNull()
    })

    it('should return null for undefined column', () => {
      expect(service.getColumnFilterProp(undefined)).toBeNull()
    })
  })

  describe('createColumnDataFilter()', () => {
    it('should create text filter by default (no cellType)', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'name',
        name: 'Name',
        filterable: true,
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchTextColumnsDataFilter)
    })

    it('should create text filter for cellType string', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'name',
        name: 'Name',
        cellType: 'string',
        filterable: true,
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchTextColumnsDataFilter)
    })

    it('should create text filter for cellType phone', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'phone',
        name: 'Phone',
        cellType: 'phone',
        filterable: true,
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchTextColumnsDataFilter)
    })

    it('should create numeric filter for cellType currency', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'amount',
        name: 'Amount',
        cellType: 'currency',
        filterable: true,
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchNumericColumnsDataFilter)
    })

    it('should create numeric filter for cellType decimal', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'weight',
        name: 'Weight',
        cellType: 'decimal',
        filterable: true,
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchNumericColumnsDataFilter)
    })

    it('should create numeric filter for cellType integer', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'count',
        name: 'Count',
        cellType: 'integer',
        filterable: true,
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchNumericColumnsDataFilter)
    })

    it('should create date filter for cellType date', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'startDate',
        name: 'Start Date',
        cellType: 'date',
        filterable: true,
        filterOptions: { dateType: 'date' },
      }
      const filter = service.createColumnDataFilter(col, null as any)
      expect(filter).not.toBeNull()
      expect(filter!.name).toBe('search-date')
    })

    it('should respect explicit filterOptions.filterType override', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'age',
        name: 'Age',
        cellType: 'string',
        filterable: true,
        filterOptions: { filterType: 'search-numeric' },
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(SearchNumericColumnsDataFilter)
    })

    it('should return null when column has no prop or name', () => {
      const col: TheSeamDatatableColumn = {} as TheSeamDatatableColumn
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeNull()
    })
  })

  describe('createColumnDataFilter() with custom filters', () => {
    class CustomFilter extends ColumnsDataFilter {
      public readonly name = 'custom-filter'
      public readonly uid: string
      public form: any
      public filterStateChanges: any
      public options: any
      constructor(prop: string, _initialValue: any, _column: any) {
        super(prop, _initialValue, _column)
        this.uid = `custom--${prop}`
      }
      dataFilter(data: any[]) {
        return data
      }
      filter(data: any[]) {
        return null as any
      }
      filterState() {
        return { name: this.name, state: {} }
      }
      applyFilter() {}
      clearFilter() {}
      isDefault() {
        return true
      }
    }

    beforeEach(waitForAsync(() => {
      TestBed.resetTestingModule()
      setup([{ name: 'custom-filter', class: CustomFilter }])
    }))

    it('should use custom filter via DI token', () => {
      const col: TheSeamDatatableColumn = {
        prop: 'special',
        name: 'Special',
        filterable: true,
        filterOptions: { filterType: 'custom-filter' },
      }
      const filter = service.createColumnDataFilter(col, null)
      expect(filter).toBeInstanceOf(CustomFilter)
    })
  })

  describe('filters()', () => {
    it('should return empty array when no columns set', () => {
      expect(service.filters()).toEqual([])
    })

    it('should return filters from columns with $$filter', () => {
      const mockFilter = { name: 'test' } as any
      const columns = [
        { prop: 'name', name: 'Name', $$filter: mockFilter },
        { prop: 'age', name: 'Age' },
      ] as any[]
      service.setColumns(columns)
      expect(service.filters()).toEqual([mockFilter])
    })
  })

  describe('getColumnFilter()', () => {
    it('should return undefined for null prop', () => {
      expect(service.getColumnFilter(null)).toBeUndefined()
    })

    it('should return filter for matching column', () => {
      const mockFilter = { name: 'test' } as any
      const columns = [
        { prop: 'name', name: 'Name', $$filter: mockFilter },
      ] as any[]
      service.setColumns(columns)
      expect(service.getColumnFilter('name')).toBe(mockFilter)
    })

    it('should return undefined for non-matching prop', () => {
      service.setColumns([{ prop: 'name', name: 'Name' }] as any[])
      expect(service.getColumnFilter('nonexistent')).toBeUndefined()
    })
  })
})
