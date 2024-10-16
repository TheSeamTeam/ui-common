import { ColumnsDataFilter, ColumnsDataFilterState } from "../columns-data-filter";
import { TheSeamDatatableColumn } from "../table-column";
import { FormControl, FormGroup } from "@angular/forms";
import { DataFilterState } from "@theseam/ui-common/data-filters";
import { isNullOrUndefined, isNullOrUndefinedOrEmpty, notNullOrUndefined, notNullOrUndefinedOrEmpty } from "@theseam/ui-common/utils";
import { Observable, Subject, map, startWith } from "rxjs";
import { TheSeamColumnsDataFilterDateSearchFormState, TheSeamColumnsDataFilterDateSearchForm, TheSeamColumnsDataFilterDateSearchOptions, TheSeamDatatableDateColumnFilterableConfig, THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME, TheSeamColumnsDataFilterDateSearchType, THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_DATE_SELECT_SEARCH_TYPES } from "./models";
import { getFormattedDateForComparison } from "./utils";

export class SearchDateColumnsDataFilter extends ColumnsDataFilter<TheSeamColumnsDataFilterDateSearchFormState, TheSeamColumnsDataFilterDateSearchForm, TheSeamColumnsDataFilterDateSearchOptions, TheSeamDatatableDateColumnFilterableConfig> {
  public readonly name = THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME

  public readonly uid: string

  public form: TheSeamColumnsDataFilterDateSearchForm

  public filterStateChanges: Observable<DataFilterState>

  public options: TheSeamColumnsDataFilterDateSearchOptions

  private _updateFilterValue = new Subject<void>

  constructor(
    prop: string,
    initialValue: TheSeamColumnsDataFilterDateSearchFormState,
    column: TheSeamDatatableColumn<any, any, TheSeamDatatableDateColumnFilterableConfig>
  ) {
    super(prop, initialValue, column)

    this.form = new FormGroup({
      searchType: new FormControl<TheSeamColumnsDataFilterDateSearchType | null>(notNullOrUndefined(initialValue) ? initialValue.searchType : 'eq'),
      searchText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.searchText : null),
      fromText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.fromText : null),
      toText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.toText : null),
    })

    this.uid = `${this.name}--${prop}`

    this.filterStateChanges = this._updateFilterValue.pipe(
      startWith(undefined),
      map(() => this.filterState())
    )

    this.options = {
      dateType: this.column.filterOptions?.dateType || 'date'
    }
  }

  public dataFilter(data: any[], filterValue: Partial<TheSeamColumnsDataFilterDateSearchFormState>, options: any): any[] {
    if (isNullOrUndefined(filterValue) || this.isDefault()) {
      return data
    }

    return this._dateSearchDataFilter(this.prop, data, filterValue.searchText, filterValue.fromText, filterValue.toText, filterValue.searchType || null)
  }

  private _isInvalidDate(dateString: string | null | undefined): boolean {
    return isNullOrUndefinedOrEmpty(dateString) || isNaN(new Date(dateString).valueOf())
  }

  private _isInvalidSearchTerm(searchText: string | null | undefined, fromText: string | null | undefined, toText: string | null | undefined, comparator: TheSeamColumnsDataFilterDateSearchType): boolean {
    if (THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES.includes(comparator) && this._isInvalidDate(searchText)) {
      return true
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES.includes(comparator) && (this._isInvalidDate(fromText) || this._isInvalidDate(toText))) {
      return true
    }

    return false
  }

  private _dateSearchDataFilter(prop: string, data: any[], text: string | null | undefined, fromText: string | null | undefined, toText: string | null | undefined, comparator: TheSeamColumnsDataFilterDateSearchType | null) {
    if (!data || data.length <= 0 || isNullOrUndefined(comparator)) {
      console.warn('No filter applied - invalid options.')
      return data
    }

    if (this._isInvalidSearchTerm(text, fromText, toText, comparator)) {
      console.warn('No filter applied - invalid search terms.')
      return data
    }

    const useLocalTime = this.column.filterOptions?.useLocalTime === true

    const textDate = getFormattedDateForComparison(text, this.options.dateType, true)
    const fromTextDate = getFormattedDateForComparison(fromText, this.options.dateType, true)
    const toTextDate = getFormattedDateForComparison(toText, this.options.dateType, true)

    return data.filter(item => {
      let propDate = getFormattedDateForComparison(item[prop], this.options.dateType, useLocalTime)

      if (
        (comparator === 'blank' && (isNullOrUndefined(item[prop]) || isNullOrUndefinedOrEmpty(`${item[prop]}`))) ||
        (comparator === 'not-blank' && notNullOrUndefined(item[prop]) && notNullOrUndefinedOrEmpty(`${item[prop]}`)) ||
        (comparator === 'lt' && propDate.valueOf() < textDate.valueOf()) ||
        (comparator === 'lte' && propDate.valueOf() <= textDate.valueOf()) ||
        (comparator === 'gt' && propDate.valueOf() > textDate.valueOf()) ||
        (comparator === 'gte' && propDate.valueOf() >= textDate.valueOf()) ||
        (comparator === 'eq' && propDate.valueOf() === textDate.valueOf()) ||
        (comparator === 'between' && propDate.valueOf() >= fromTextDate.valueOf() && propDate.valueOf() <= toTextDate.valueOf()) ||
        (comparator === 'not-between' && !(propDate.valueOf() >= fromTextDate.valueOf() && propDate.valueOf() <= toTextDate.valueOf()))
      ) {
        return true
      }

      return false
    })
  }

  public filter(data: any[]): Observable<any[]> {
    return this._updateFilterValue.pipe(
      startWith(undefined),
      map(() => this.dataFilter(data, this.form.value, undefined))
    )
  }

  public filterState(): ColumnsDataFilterState<TheSeamColumnsDataFilterDateSearchFormState, TheSeamColumnsDataFilterDateSearchOptions> {
    return {
      name: this.name,
      state: {
        prop: this.prop,
        formValue: this.form.value,
        options: this.options
      }
    }
  }

  public applyFilter(): void {
    this._updateFilterValue.next()
  }

  public clearFilter(): void {
    this.form.setValue({
      searchType: 'eq',
      searchText: null,
      fromText: null,
      toText: null
    })

    this._updateFilterValue.next()
  }

  public isDefault(): boolean {
    const formValue = this.form.value

    if (isNullOrUndefinedOrEmpty(formValue.searchType)) {
      return true
    }
    if (THESEAM_COLUMNS_DATA_FILTER_DATE_SELECT_SEARCH_TYPES.includes(formValue.searchType)) {
      return false
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefinedOrEmpty(formValue.searchText)) {
      return false
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefinedOrEmpty(formValue.fromText) && notNullOrUndefinedOrEmpty(formValue.toText)) {
      return false
    }

    return true
  }

}
