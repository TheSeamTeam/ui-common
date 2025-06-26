import { ColumnsDataFilterState, TheSeamColumnsDataFilterTextSearchFormState, THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES } from "@theseam/ui-common/datatable"
import { isNullOrUndefined, notNullOrUndefined } from "@theseam/ui-common/utils"
import { FilterStateMapperResult } from "./map-filter-states"
import { MapperContext } from "./mapper-context"

export const mapSearchTextColumnsDataFilterStateToGql = (
  filterState: ColumnsDataFilterState<TheSeamColumnsDataFilterTextSearchFormState>, context: MapperContext<any>,
): FilterStateMapperResult => {
  let filter = null

  if (isNullOrUndefined(filterState.state.prop)) {
    return filter
  }

  if (notNullOrUndefined(filterState.state.formValue) && notNullOrUndefined(filterState.state.formValue.searchType)) {
    if (THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES.includes(filterState.state.formValue.searchType) && notNullOrUndefined(filterState.state.formValue.searchText)) {
      filter = {
        filter: {
          and: [
            { [filterState.state.prop]: { [filterState.state.formValue.searchType]: filterState.state.formValue.searchText } }
          ]
        },
        variables: {}
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
