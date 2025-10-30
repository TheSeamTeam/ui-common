import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { CommonModule, NgTemplateOutlet } from '@angular/common'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Observable, debounceTime, map, tap } from 'rxjs'

import { notNullOrUndefined } from '@theseam/ui-common/utils'
import { InputNumber } from '@theseam/ui-common/core'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

import { ColumnsFiltersService } from '../services/columns-filters.service'
import { TheSeamDatatableColumn } from '../models/table-column'
import { ColumnsDataFilter } from '../models/columns-data-filter'
import { TheSeamDatatableColumnFilterUpdateMethod } from '../models/datatable-config'
import { DatatableColumnFilterSearchTextComponent } from '../datatable-column-filter-search-text/datatable-column-filter-search-text.component'
import { DatatableColumnFilterSearchNumericComponent } from '../datatable-column-filter-search-numeric/datatable-column-filter-search-numeric.component'
import { DatatableColumnFilterSearchDateComponent } from '../datatable-column-filter-search-date/datatable-column-filter-search-date.component'

@Component({
  selector: 'seam-datatable-column-filter-menu',
  templateUrl: './datatable-column-filter-menu.component.html',
  styleUrls: ['./datatable-column-filter-menu.component.scss'],
  imports: [
    CommonModule,
    NgTemplateOutlet,
    ReactiveFormsModule,
    TheSeamButtonsModule,
    DatatableColumnFilterSearchTextComponent,
    DatatableColumnFilterSearchNumericComponent,
    DatatableColumnFilterSearchDateComponent,
  ],
})
export class DatatableColumnFilterMenuComponent implements OnInit {
  _filterForm: FormGroup<any> | undefined

  @Input() column: TheSeamDatatableColumn | null | undefined

  @Input() updateMethod:
    | TheSeamDatatableColumnFilterUpdateMethod
    | null
    | undefined

  @Input() @InputNumber() debounce: number | null | undefined

  public columnFilterProp: string | null | null | undefined

  public columnFilter: ColumnsDataFilter<any, any> | null | undefined

  public customFilterTemplate$: Observable<any> | null | undefined

  @Output() closePopover = new EventEmitter()

  constructor(private readonly _columnsFilters: ColumnsFiltersService) {}

  ngOnInit(): void {
    this.columnFilterProp = this._columnsFilters.getColumnFilterProp(
      this.column,
    )

    this.columnFilter = this._columnsFilters.getColumnFilter(
      this.columnFilterProp,
    )

    if (notNullOrUndefined(this.columnFilter)) {
      this._filterForm = this.columnFilter.form
    }

    this.customFilterTemplate$ =
      this._columnsFilters.columnFilterTemplates$.pipe(
        map((templates) =>
          templates.find((t) => t.filterName === this.columnFilter?.name),
        ),
      )

    if (
      this.updateMethod === 'valueChanges' &&
      notNullOrUndefined(this._filterForm)
    ) {
      this._filterForm.valueChanges
        .pipe(
          debounceTime(this.debounce || 0),
          tap(() => this.columnFilter?.applyFilter()),
        )
        .subscribe()
    }
  }

  public submit() {
    this.columnFilter?.applyFilter()

    this.closePopover.emit()
  }

  public clearFilter() {
    this.columnFilter?.clearFilter()
  }
}
