import { ColumnsDataFilter, ColumnsDataFilterState } from "../columns-data-filter";
import { TheSeamDatatableColumn } from "../table-column";
import { FormControl, FormGroup } from "@angular/forms";
import { DataFilterState } from "@theseam/ui-common/data-filters";
import { isNullOrUndefined, isNullOrUndefinedOrEmpty, notNullOrUndefined, notNullOrUndefinedOrEmpty } from "@theseam/ui-common/utils";
import { Observable, Subject, map, startWith } from "rxjs";
import { TheSeamColumnsDataFilterTextSearchFormState, TheSeamColumnsDataFilterTextSearchForm, THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME, TheSeamColumnsDataFilterTextSearchType, THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_TEXT_SELECT_SEARCH_TYPES } from "./models";

export class SearchTextColumnsDataFilter extends ColumnsDataFilter<TheSeamColumnsDataFilterTextSearchFormState, TheSeamColumnsDataFilterTextSearchForm> {
  public readonly name = THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME

  public readonly uid: string

  public form: TheSeamColumnsDataFilterTextSearchForm

  public filterStateChanges: Observable<DataFilterState>

  public options: any

  private _updateFilterValue = new Subject<void>

  constructor(
    prop: string,
    initialValue: TheSeamColumnsDataFilterTextSearchFormState,
    column: TheSeamDatatableColumn
  ) {
    super(prop, initialValue, column)

    this.form = new FormGroup({
      searchType: new FormControl<TheSeamColumnsDataFilterTextSearchType | null>(notNullOrUndefined(initialValue) ? initialValue.searchType : 'contains'),
      searchText: new FormControl<string | null>(notNullOrUndefined(initialValue) ? initialValue.searchText : null),
      // caseSensitive: new FormControl<boolean | null>(notNullOrUndefined(initialValue) ? initialValue.caseSensitive : null),
    })

    this.uid = `${this.name}--${prop}`

    this.filterStateChanges = this._updateFilterValue.pipe(
      startWith(undefined),
      map(() => this.filterState())
    )
  }

  public dataFilter(data: any[], filterValue: Partial<TheSeamColumnsDataFilterTextSearchFormState>, options: any): any[] {
    if (isNullOrUndefined(filterValue) || this.isDefault()) {
      return data
    }

    return this._textSearchDataFilter(this.prop, data, filterValue.searchText, filterValue.searchType || null)
  }

  private _textSearchDataFilter(prop: string, data: any[], text: string | null | undefined, comparator: TheSeamColumnsDataFilterTextSearchType | null) {
    if (!data || data.length < 0 || isNullOrUndefined(comparator)) {
      return data
    }

    return data.filter(item => {
      let value1 = `${notNullOrUndefined(item[prop]) ? item[prop] : ''}`
      let value2 = text || ''

      // if (!options.caseSensitive) {
      //   value1 = value1.toLowerCase()
      //   value2 = value2.toLowerCase()
      // }

      value1 = value1.toLowerCase()
      value2 = value2.toLowerCase()

      if (
        (comparator === 'eq' && value1 === value2) ||
        (comparator === 'neq' && value1 !== value2) ||
        (comparator === 'contains' && value1.indexOf(value2) !== -1) ||
        (comparator === 'ncontains' && value1.indexOf(value2) === -1) ||
        (comparator === 'blank' && isNullOrUndefinedOrEmpty(value1)) ||
        (comparator === 'not-blank' && notNullOrUndefinedOrEmpty(value1))
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

  public filterState(): ColumnsDataFilterState<TheSeamColumnsDataFilterTextSearchFormState> {
    return {
      name: this.name,
      state: {
        prop: this.prop,
        formValue: this.form.value,
      }
    }
  }

  public applyFilter(): void {
    this._updateFilterValue.next()
  }

  public clearFilter(): void {
    this.form.setValue({
      searchType: 'contains',
      searchText: null,
      // caseSensitive: null
    })

    this._updateFilterValue.next()
  }

  public isDefault(): boolean {
    const formValue = this.form.value

    if (isNullOrUndefinedOrEmpty(formValue.searchType)) {
      return true
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES.includes(formValue.searchType) && notNullOrUndefinedOrEmpty(formValue.searchText)) {
      return false
    }
    else if (THESEAM_COLUMNS_DATA_FILTER_TEXT_SELECT_SEARCH_TYPES.includes(formValue.searchType)) {
      return false
    }

    return true
  }

}
