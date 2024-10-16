import { Component, Input, OnInit } from '@angular/core'
import { Observable, map, startWith } from 'rxjs'
import { ControlContainer, FormGroupDirective } from '@angular/forms'
import { TheSeamColumnsDataFilterNumericSearchForm, TheSeamColumnsDataFilterNumericSearchType, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES } from '../models/columns-data-filters/models'

@Component({
  selector: 'seam-datatable-column-filter-search-numeric',
  templateUrl: './datatable-column-filter-search-numeric.component.html',
  styleUrls: ['./datatable-column-filter-search-numeric.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class DatatableColumnFilterSearchNumericComponent implements OnInit {

  searchTypes: { label: string, value: TheSeamColumnsDataFilterNumericSearchType }[] = [
    { label: 'Less than (<)', value: 'lt' },
    { label: 'Less than or equal to (<=)', value: 'lte' },
    { label: 'Equal to (=)', value: 'eq' },
    { label: 'Greater than (>)', value: 'gt' },
    { label: 'Greater than or equal to (>=)', value: 'gte' },
    { label: 'Between', value: 'between' },
    { label: 'Not between', value: 'not-between' },
    { label: 'Blank', value: 'blank' },
    { label: 'Not blank', value: 'not-blank' },
  ]

  @Input() filterForm: TheSeamColumnsDataFilterNumericSearchForm | undefined

  public showSearchInput$: Observable<boolean> | undefined

  public showRangeInputs$: Observable<boolean> | undefined

  ngOnInit(): void {
    this.showSearchInput$ = this.filterForm?.controls.searchType.valueChanges.pipe(
      startWith(this.filterForm?.controls.searchType.value),
      map(searchType => THESEAM_COLUMNS_DATA_FILTER_NUMERIC_TEXT_SEARCH_TYPES.includes(searchType || ''))
    )

    this.showRangeInputs$ = this.filterForm?.controls.searchType.valueChanges.pipe(
      startWith(this.filterForm?.controls.searchType.value),
      map(searchType => THESEAM_COLUMNS_DATA_FILTER_NUMERIC_RANGE_SEARCH_TYPES.includes(searchType || ''))
    )
  }
}
