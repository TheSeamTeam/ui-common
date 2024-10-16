import { ColumnsDataFilterState, TheSeamColumnsDataFilterDateSearchFormState, TheSeamColumnsDataFilterDateSearchOptions, THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES, getFormattedDateForComparison, THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES } from "@theseam/ui-common/datatable"
import { isNullOrUndefined, notNullOrUndefined } from "@theseam/ui-common/utils"
import { FilterStateMapperResult } from "./map-filter-states"
import { MapperContext } from "./mapper-context"

export const mapSearchDateColumnsDataFilterStateToGql = (
  filterState: ColumnsDataFilterState<TheSeamColumnsDataFilterDateSearchFormState, TheSeamColumnsDataFilterDateSearchOptions>, context: MapperContext<any>,
): FilterStateMapperResult => {
  const formValue = filterState.state.formValue
  const options = filterState.state.options

  let filter = null

  if (isNullOrUndefined(filterState.state.prop) || isNullOrUndefined(options) || isNullOrUndefined(formValue) || isNullOrUndefined(formValue.searchType)) {
    return filter
  }

  if (THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefined(formValue.searchText)) {
    const searchDate = getFormattedDateForComparison(formValue.searchText, options.dateType, true)

    if (!isNaN(searchDate.valueOf())) {
      switch (formValue.searchType) {
        case 'eq': {
          let searchDateEnd
          if (options.dateType === 'datetime-local') {
            searchDateEnd = new Date(searchDate)
            searchDateEnd.setMinutes(searchDateEnd.getMinutes() + 1)
          }
          else if (options.dateType === 'date') {
            searchDateEnd = new Date(searchDate)
            searchDateEnd.setDate(searchDateEnd.getDate() + 1)
          }

          if (notNullOrUndefined(searchDateEnd)) {
            filter = {
              filter: {
                and: [
                  { [filterState.state.prop]: { gte: searchDate.toISOString() } },
                  { [filterState.state.prop]: { lt: searchDateEnd.toISOString() } }
                ]
              },
              variables: {}
            }
          }

          break
        }
        case 'gt':
        case 'lte': {
          const comparator = formValue.searchType === 'gt' ? 'gte' : formValue.searchType === 'lte' ? 'lt' : null

          let searchDateEnd
          if (options.dateType === 'datetime-local') {
            searchDateEnd = new Date(searchDate)
            searchDateEnd.setMinutes(searchDateEnd.getMinutes() + 1)
          }
          else if (options.dateType === 'date') {
            searchDateEnd = new Date(searchDate)
            searchDateEnd.setDate(searchDateEnd.getDate() + 1)
          }

          if (notNullOrUndefined(comparator) && notNullOrUndefined(searchDateEnd)) {
            filter = {
              filter: {
                and: [
                  { [filterState.state.prop]: { [comparator]: searchDateEnd.toISOString() } },
                ]
              },
              variables: {}
            }
          }

          break
        }
        case 'lt':
        case 'gte': {
          filter = {
            filter: {
              and: [
                { [filterState.state.prop]: { [formValue.searchType]: searchDate.toISOString() } },
              ]
            },
            variables: {}
          }

          break
        }
        default:
          break
      }
    }
  }
  else if (THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefined(formValue.fromText) && notNullOrUndefined(formValue.toText)) {
    const fromDate = getFormattedDateForComparison(formValue.fromText, options.dateType, true)
    const toDate = getFormattedDateForComparison(formValue.toText, options.dateType, true)

    if (!isNaN(fromDate.valueOf()) && !isNaN(toDate.valueOf())) {
      let toDateEnd
      if (options.dateType === 'datetime-local') {
        toDateEnd = new Date(toDate)
        toDateEnd.setMinutes(toDateEnd.getMinutes() + 1)
      }
      else if (options.dateType === 'date') {
        toDateEnd = new Date(toDate)
        toDateEnd.setDate(toDateEnd.getDate() + 1)
      }

      if (notNullOrUndefined(toDateEnd)) {
        if (formValue.searchType === 'between') {
          filter = {
            filter: {
              and: [
                { [filterState.state.prop]: { gte: fromDate.toISOString() } },
                { [filterState.state.prop]: { lt: toDateEnd.toISOString() } },
              ]
            },
            variables: {}
          }
        }
        else if (formValue.searchType === 'not-between') {
          filter = {
            filter: {
              or: [
                { [filterState.state.prop]: { lt: fromDate.toISOString() } },
                { [filterState.state.prop]: { gt: toDateEnd.toISOString() } },
              ]
            },
            variables: {}
          }
        }
      }
    }
  }
  else if (formValue.searchType === 'blank') {
    filter = {
      filter: {
        or: [
          { [filterState.state.prop]: { eq: null } }
        ]
      },
      variables: {}
    }
  }
  else if (formValue.searchType === 'not-blank') {
    filter = {
      filter: {
        and: [
          { [filterState.state.prop]: { neq: null } }
        ]
      },
      variables: {}
    }
  }

  return filter
}
