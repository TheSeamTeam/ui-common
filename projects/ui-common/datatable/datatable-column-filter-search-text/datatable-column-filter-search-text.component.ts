import { Component, Input, OnInit } from '@angular/core'
import { Observable, map, startWith } from 'rxjs'
import { ControlContainer, FormGroupDirective } from '@angular/forms'
import { TheSeamColumnsDataFilterTextSearchForm, TheSeamColumnsDataFilterTextSearchType, THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES } from '../models/columns-data-filters/models'

@Component({
  selector: 'seam-datatable-column-filter-search-text',
  templateUrl: './datatable-column-filter-search-text.component.html',
  styleUrls: ['./datatable-column-filter-search-text.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class DatatableColumnFilterSearchTextComponent implements OnInit {

  searchTypes: { label: string, value: TheSeamColumnsDataFilterTextSearchType }[] = [
    { label: 'Contains', value: 'contains' },
    { label: 'Does not contain', value: 'ncontains' },
    { label: 'Matches exactly', value: 'eq' },
    { label: 'Does not match exactly', value: 'neq' },
    { label: 'Is blank', value: 'blank' },
    { label: 'Is not blank', value: 'not-blank' },
  ]

  @Input() filterForm: TheSeamColumnsDataFilterTextSearchForm | undefined

  public showTextbox$: Observable<boolean> | undefined

  ngOnInit(): void {
    this.showTextbox$ = this.filterForm?.controls.searchType.valueChanges.pipe(
      startWith(this.filterForm?.controls.searchType.value),
      map(value => THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES.includes(value || ''))
    )
  }
}
