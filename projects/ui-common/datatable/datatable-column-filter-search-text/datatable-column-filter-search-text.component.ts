import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ControlContainer,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms'
import { Observable, map, startWith } from 'rxjs'

import { NgSelectModule } from '@ng-select/ng-select'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import {
  TheSeamAutoFocusDirective,
  TheSeamNgSelectExtraDirective,
} from '@theseam/ui-common/shared'

import {
  TheSeamColumnsDataFilterTextSearchForm,
  TheSeamColumnsDataFilterTextSearchType,
  THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES,
} from '../models/columns-data-filters/models'

@Component({
  selector: 'seam-datatable-column-filter-search-text',
  templateUrl: './datatable-column-filter-search-text.component.html',
  styleUrls: ['./datatable-column-filter-search-text.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    TheSeamFormFieldModule,
    TheSeamNgSelectExtraDirective,
    TheSeamAutoFocusDirective,
  ],
})
export class DatatableColumnFilterSearchTextComponent implements OnInit {
  searchTypes: {
    label: string
    value: TheSeamColumnsDataFilterTextSearchType
  }[] = [
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
      map((value) =>
        THESEAM_COLUMNS_DATA_FILTER_TEXT_TEXT_SEARCH_TYPES.includes(
          value || '',
        ),
      ),
    )
  }
}
