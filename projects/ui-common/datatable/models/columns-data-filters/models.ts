import { FormControl, FormGroup } from "@angular/forms"
import { TheSeamDatatableColumnFilterableConfig } from "../table-column"

export const THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME = 'search-date' as const

export const THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_TYPES = [
  'lt',
  'lte',
  'gt',
  'gte',
  'eq',
  'blank',
  'not-blank',
  'between',
  'not-between'
] as const

export const THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES = [
  'lt',
  'lte',
  'gt',
  'gte',
  'eq',
]

export const THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES = [
  'between',
  'not-between'
]

export const THESEAM_COLUMNS_DATA_FILTER_DATE_SELECT_SEARCH_TYPES = [
  'blank',
  'not-blank',
]

export type TheSeamColumnsDataFilterDateSearchType = typeof THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_TYPES[number]

export type TheSeamColumnsDataFilterDateSearchForm = FormGroup<{
  searchType: FormControl<TheSeamColumnsDataFilterDateSearchType | null>
  searchText: FormControl<string | null>
  fromText: FormControl<string | null>
  toText: FormControl<string | null>
}>

export interface TheSeamColumnsDataFilterDateSearchFormState {
  searchType: TheSeamColumnsDataFilterDateSearchType | null
  searchText: string | null
  fromText: string | null
  toText: string | null
}

export type TheSeamColumnsDataFilterDateSearchDateType = 'date' | 'datetime-local'

export interface TheSeamDatatableDateColumnFilterableConfig extends TheSeamDatatableColumnFilterableConfig {
  /**
   * The input type to use for the date filter form.
   */
  dateType?: TheSeamColumnsDataFilterDateSearchDateType

  /**
   * When set to true, assumes provided date is in local time.
   */
  useLocalTime?: boolean
}

export interface TheSeamColumnsDataFilterDateSearchOptions {
  dateType: TheSeamColumnsDataFilterDateSearchDateType
}

export const THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME = 'search-numeric' as const

export const THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_TYPES = [
  'gt',
  'lt',
  'eq',
  'gte',
  'lte',
  'blank',
  'not-blank',
  'between',
  'not-between'
] as const

export const THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES = [
  'gt',
  'lt',
  'eq',
  'gte',
  'lte',
]

export const THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES = [
  'between',
  'not-between'
]

export const THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SELECT_SEARCH_TYPES = [
  'blank',
  'not-blank',
]

export type TheSeamColumnsDataFilterNumericSearchType = typeof THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_TYPES[number]

export type TheSeamColumnsDataFilterNumericSearchForm = FormGroup<{
  searchType: FormControl<TheSeamColumnsDataFilterNumericSearchType | null>
  searchText: FormControl<string | null>
  fromText: FormControl<string | null>
  toText: FormControl<string | null>
}>

export type TheSeamColumnsDataFilterNumericSearchFormState = {
  searchType: TheSeamColumnsDataFilterNumericSearchType | null
  searchText: string | null
  fromText: string | null
  toText: string | null
}

export const THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME = 'search-text' as const

export const THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_TYPES = [
  'contains',
  'ncontains',
  'eq',
  'neq',
  'blank',
  'not-blank'
] as const

export const THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES = [
  'contains',
  'ncontains',
  'eq',
  'neq',
]

export const THESEAM_COLUMNS_DATA_FILTER_TEXT_SELECT_SEARCH_TYPES = [
  'blank',
  'not-blank'
]

export type TheSeamColumnsDataFilterTextSearchType = typeof THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_TYPES[number]

export type TheSeamColumnsDataFilterTextSearchForm = FormGroup<{
  searchType: FormControl<TheSeamColumnsDataFilterTextSearchType | null>
  searchText: FormControl<string | null>
  // caseSensitive: FormControl<boolean | null>
}>

export type TheSeamColumnsDataFilterTextSearchFormState = {
  searchType: TheSeamColumnsDataFilterTextSearchType | null
  searchText: string | null
  // caseSensitive: boolean | null
}
