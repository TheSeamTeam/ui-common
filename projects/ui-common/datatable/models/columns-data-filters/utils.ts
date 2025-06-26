import { notNullOrUndefined } from "@theseam/ui-common/utils";
import { SearchDateColumnsDataFilter } from "./search-date.columns-data-filter";
import { SearchNumericColumnsDataFilter } from "./search-numeric.columns-data-filter";
import { SearchTextColumnsDataFilter } from "./search-text.columns-data-filter";
import { TheSeamColumnsDataFilterDateSearchDateType, THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME, THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME } from "./models";

export const THESEAM_COLUMNS_DATA_FILTERS_DEFAULT = [
  { name: THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME, class: SearchTextColumnsDataFilter },
  { name: THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME, class: SearchNumericColumnsDataFilter },
  { name: THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME, class: SearchDateColumnsDataFilter },
] as const

export const getFormattedDateForComparison = (date: string | number | Date | null | undefined, dateType: TheSeamColumnsDataFilterDateSearchDateType, setToLocalTime: boolean = false): Date => {
  const dateObj = new Date(notNullOrUndefined(date) ? date : '')

  if (dateType === 'datetime-local') {
    // reset seconds and ms, since they can't be specified from the search input
    dateObj.setSeconds(0)
    dateObj.setMilliseconds(0)
  }
  else if (dateType === 'date') {
    if (setToLocalTime) {
      // set date from input type="date" to current timezone, to match expected behavior
      dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset())
    }

    // reset hours/minutes/seconds/ms, since they can't be specified from the search input
    dateObj.setHours(0, 0, 0, 0)
  }

  return dateObj
}
