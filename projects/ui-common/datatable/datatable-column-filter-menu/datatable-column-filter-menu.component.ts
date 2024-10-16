import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { ColumnsFiltersService } from '../services/columns-filters.service'
import { TheSeamDatatableColumn } from '../models/table-column'
import { FormGroup } from '@angular/forms'
import { ColumnsDataFilter } from '../models/columns-data-filter'
import { Observable, debounceTime, map, tap } from 'rxjs'
import { TheSeamDatatableColumnFilterUpdateMethod } from '../models/datatable-config'
import { InputNumber } from '@theseam/ui-common/core'

@Component({
  selector: 'seam-datatable-column-filter-menu',
  templateUrl: './datatable-column-filter-menu.component.html',
  styleUrls: ['./datatable-column-filter-menu.component.scss'],
})
export class DatatableColumnFilterMenuComponent implements OnInit {

  _filterForm: FormGroup<any> | undefined

  @Input() column: TheSeamDatatableColumn | null | undefined

  @Input() updateMethod: TheSeamDatatableColumnFilterUpdateMethod | null | undefined

  @Input() @InputNumber() debounce: number | null | undefined

  public columnFilterProp: string | null | null | undefined

  public columnFilter: ColumnsDataFilter<any, any> | null | undefined

  public customFilterTemplate$: Observable<any> | null | undefined

  @Output() closePopover = new EventEmitter()

  constructor(
    private readonly _columnsFilters: ColumnsFiltersService
  ) {}

  ngOnInit(): void {
    this.columnFilterProp = this._columnsFilters.getColumnFilterProp(this.column)

    this.columnFilter = this._columnsFilters.getColumnFilter(this.columnFilterProp)

    if (notNullOrUndefined(this.columnFilter)) {
      this._filterForm = this.columnFilter.form
    }

    this.customFilterTemplate$ = this._columnsFilters.columnFilterTemplates$.pipe(
      map(templates => templates.find(t => t.filterName === this.columnFilter?.name))
    )

    if (this.updateMethod === 'valueChanges' && notNullOrUndefined(this._filterForm)) {
      this._filterForm.valueChanges.pipe(
        debounceTime(this.debounce || 0),
        tap(() => this.columnFilter?.applyFilter())
      ).subscribe()
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
