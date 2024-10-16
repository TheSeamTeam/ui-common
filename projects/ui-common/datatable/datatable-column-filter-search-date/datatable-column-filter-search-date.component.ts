import { Component, Input, OnInit } from '@angular/core'
import { Observable, map, startWith } from 'rxjs'
import { notNullOrUndefined } from '@theseam/ui-common/utils'
import { ControlContainer, FormGroupDirective } from '@angular/forms'
import { TheSeamColumnsDataFilterDateSearchDateType, TheSeamColumnsDataFilterDateSearchForm, TheSeamColumnsDataFilterDateSearchOptions, TheSeamColumnsDataFilterDateSearchType, THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES, THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES } from '../models/columns-data-filters/models'

@Component({
  selector: 'seam-datatable-column-filter-search-date',
  templateUrl: './datatable-column-filter-search-date.component.html',
  styleUrls: ['./datatable-column-filter-search-date.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class DatatableColumnFilterSearchDateComponent implements OnInit {

  searchTypes: { label: string, value: TheSeamColumnsDataFilterDateSearchType }[] = [
    { label: 'Before', value: 'lt' },
    { label: 'Before or on', value: 'lte' },
    { label: 'On', value: 'eq' },
    { label: 'After', value: 'gt' },
    { label: 'After or on', value: 'gte' },
    { label: 'Between', value: 'between' },
    { label: 'Not between', value: 'not-between' },
    { label: 'Blank', value: 'blank' },
    { label: 'Not blank', value: 'not-blank' },
  ]

  @Input() options: TheSeamColumnsDataFilterDateSearchOptions | undefined

  @Input() filterForm: TheSeamColumnsDataFilterDateSearchForm | undefined

  public dateFormat: TheSeamColumnsDataFilterDateSearchDateType | undefined

  public showSearchInput$: Observable<boolean> | undefined

  public showRangeInputs$: Observable<boolean> | undefined

  ngOnInit(): void {
    if (notNullOrUndefined(this.options?.dateType)) {
      this.dateFormat = this.options?.dateType
    }

    this.showSearchInput$ = this.filterForm?.controls.searchType.valueChanges.pipe(
      startWith(this.filterForm?.controls.searchType.value),
      map(searchType => THESEAM_COLUMNS_DATA_FILTER_DATE_TEXT_SEARCH_TYPES.includes(searchType || ''))
    )

    this.showRangeInputs$ = this.filterForm?.controls.searchType.valueChanges.pipe(
      startWith(this.filterForm?.controls.searchType.value),
      map(searchType => THESEAM_COLUMNS_DATA_FILTER_DATE_RANGE_SEARCH_TYPES.includes(searchType || ''))
    )
  }
}
