import { ColumnsDataFilterState, TheSeamColumnsDataFilterNumericSearchFormState, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES } from "@theseam/ui-common/datatable"
import { isNullOrUndefined, notNullOrUndefined } from "@theseam/ui-common/utils"
import { FilterStateMapperResult } from "./map-filter-states"
import { MapperContext } from "./mapper-context"

export const mapSearchNumericColumnsDataFilterStateToGql = (
  filterState: ColumnsDataFilterState<TheSeamColumnsDataFilterNumericSearchFormState>, context: MapperContext<any>,
): FilterStateMapperResult => {
  let filter = null

  if (isNullOrUndefined(filterState.state.prop)) {
    return filter
  }

  if (notNullOrUndefined(filterState.state.formValue) && notNullOrUndefined(filterState.state.formValue.searchType)) {
    if (THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES.includes(filterState.state.formValue.searchType) && notNullOrUndefined(filterState.state.formValue.searchText)) {
      const searchNumeric = parseFloat(filterState.state.formValue.searchText)

      if (!isNaN(searchNumeric)) {
        filter = {
          filter: {
            and: [
              { [filterState.state.prop]: { [filterState.state.formValue.searchType]: searchNumeric } }
            ]
          },
          variables: {}
        }
      }
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES.includes(filterState.state.formValue.searchType) && notNullOrUndefined(filterState.state.formValue.fromText) && notNullOrUndefined(filterState.state.formValue.toText)) {
      const fromNumeric = parseFloat(filterState.state.formValue.fromText)

      const toNumeric = parseFloat(filterState.state.formValue.toText)

      if (!isNaN(fromNumeric) && !isNaN(toNumeric)) {
        if (filterState.state.formValue.searchType === 'between') {
          filter = {
            filter: {
              and: [
                { [filterState.state.prop]: { 'gte': fromNumeric } },
                { [filterState.state.prop]: { 'lte': toNumeric } },
              ]
            },
            variables: {}
          }
        }
        else if (filterState.state.formValue.searchType === 'not-between') {
          filter = {
            filter: {
              or: [
                { [filterState.state.prop]: { 'lt': fromNumeric } },
                { [filterState.state.prop]: { 'gt': toNumeric } },
              ]
            },
            variables: {}
          }
        }
      }
    }
    else if (filterState.state.formValue.searchType === 'blank') {
      filter = {
        filter: {
          or: [
            { [filterState.state.prop]: { eq: null } },
            { [filterState.state.prop]: { eq: '' } },
          ]
        },
        variables: {}
      }
    }
    else if (filterState.state.formValue.searchType === 'not-blank') {
      filter = {
        filter: {
          and: [
            { [filterState.state.prop]: { neq: null } },
            { [filterState.state.prop]: { neq: '' } }
          ]
        },
        variables: {}
      }
    }
  }

  return filter
}
