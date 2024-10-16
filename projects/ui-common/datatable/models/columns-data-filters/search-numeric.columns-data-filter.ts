import { ColumnsDataFilter, ColumnsDataFilterState } from "../columns-data-filter";
import { TheSeamDatatableColumn } from "../table-column";
import { FormControl, FormGroup } from "@angular/forms";
import { DataFilterState } from "@theseam/ui-common/data-filters";
import { isNullOrUndefined, isNullOrUndefinedOrEmpty, notNullOrUndefined, notNullOrUndefinedOrEmpty } from "@theseam/ui-common/utils";
import { Observable, Subject, map, startWith } from "rxjs";
import { TheSeamColumnsDataFilterNumericSearchFormState, TheSeamColumnsDataFilterNumericSearchForm, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME, TheSeamColumnsDataFilterNumericSearchType, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SELECT_SEARCH_TYPES } from "./models";

export class SearchNumericColumnsDataFilter extends ColumnsDataFilter<TheSeamColumnsDataFilterNumericSearchFormState, TheSeamColumnsDataFilterNumericSearchForm, undefined> {
  public readonly name = THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME

  public readonly uid: string

  public form: TheSeamColumnsDataFilterNumericSearchForm

  public filterStateChanges: Observable<DataFilterState>

  public options: any

  private _updateFilterValue = new Subject<void>

  constructor(
    prop: string,
    initialValue: TheSeamColumnsDataFilterNumericSearchFormState,
    column: TheSeamDatatableColumn
  ) {
    super(prop, initialValue, column)

    this.form = new FormGroup({
      searchType: new FormControl<TheSeamColumnsDataFilterNumericSearchType | null>(notNullOrUndefined(initialValue) ? initialValue.searchType : 'eq'),
      searchText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.searchText : null),
      fromText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.fromText : null),
      toText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.toText : null),
    })

    this.uid = `${this.name}--${prop}`

    this.filterStateChanges = this._updateFilterValue.pipe(
      startWith(undefined),
      map(() => this.filterState())
    )
  }

  public dataFilter(data: any[], filterValue: Partial<TheSeamColumnsDataFilterNumericSearchFormState>, options: any): any[] {
    if (isNullOrUndefined(filterValue) || this.isDefault()) {
      return data
    }

    return this.numberSearchDataFilter(this.prop, data, filterValue.searchText, filterValue.fromText, filterValue.toText, filterValue.searchType || null)
  }

  private _isInvalidSearchTerm(searchText: number, fromText: number, toText: number, comparator: TheSeamColumnsDataFilterNumericSearchType): boolean {
    if (isNaN(searchText) && THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES.includes(comparator)) {
      return true
    }
    else if ((isNaN(fromText) || isNaN(toText)) && THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES.includes(comparator)) {
      return true
    }

    return false
  }

  private numberSearchDataFilter(prop: string, data: any[], text: string | null | undefined, fromText: string | null | undefined, toText: string | null | undefined, comparator: TheSeamColumnsDataFilterNumericSearchType | null) {
    if (!data || data.length <= 0 || isNullOrUndefined(comparator)) {
      console.warn('No filter applied - invalid options.')
      return data
    }

    const textNumeric = notNullOrUndefinedOrEmpty(text) ? parseFloat(text) : NaN
    const toTextNumeric = notNullOrUndefinedOrEmpty(toText) ? parseFloat(toText) : NaN
    const fromTextNumeric = notNullOrUndefinedOrEmpty(fromText) ? parseFloat(fromText) : NaN

    if (this._isInvalidSearchTerm(textNumeric, fromTextNumeric, toTextNumeric, comparator)) {
      console.warn('No filter applied - invalid search terms.')
      return data
    }

    return data.filter(item => {
      let propNumeric = parseFloat(item[prop])

      if (
        (comparator === 'blank' && (isNullOrUndefined(item[prop]) || isNullOrUndefinedOrEmpty(`${item[prop]}`))) ||
        (comparator === 'not-blank' && notNullOrUndefined(item[prop]) && notNullOrUndefinedOrEmpty(`${item[prop]}`)) ||
        (comparator === 'lt' && propNumeric < textNumeric) ||
        (comparator === 'lte' && propNumeric <= textNumeric) ||
        (comparator === 'gt' && propNumeric > textNumeric) ||
        (comparator === 'gte' && propNumeric >= textNumeric) ||
        (comparator === 'eq' && propNumeric === textNumeric) ||
        (comparator === 'between' && propNumeric >= fromTextNumeric && propNumeric <= toTextNumeric) ||
        (comparator === 'not-between' && !(propNumeric >= fromTextNumeric && propNumeric <= toTextNumeric))
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

  public filterState(): ColumnsDataFilterState<TheSeamColumnsDataFilterNumericSearchFormState> {
    return {
      name: this.name,
      state: {
        prop: this.prop,
        formValue: this.form.value
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
    else if (THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SELECT_SEARCH_TYPES.includes(formValue.searchType)) {
      return false
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefinedOrEmpty(formValue.searchText)) {
      return false
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefinedOrEmpty(formValue.fromText) && notNullOrUndefinedOrEmpty(formValue.toText)) {
      return false
    }

    return true
  }

}
