import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { notNullOrUndefined, observeControlValue } from '@theseam/ui-common/utils'

import { DatatableComponent, THESEAM_DATATABLE } from '../datatable/datatable.component'
import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { isInternalColumn } from '../models/internal-column-props'
import { TheSeamDatatableColumn } from '../models/table-column'
import { ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'
import { getColumnProp } from '../utils/get-column-prop'

@Component({
  selector: 'seam-datatable-column-preferences',
  templateUrl: './datatable-column-preferences.component.html',
  styleUrls: ['./datatable-column-preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableColumnPreferencesComponent {
  _columns$: Observable<TheSeamDatatableColumn[]>

  _filterControl = new UntypedFormControl()

  constructor(
    @Inject(THESEAM_DATATABLE) private _datatable: DatatableComponent,
    private readonly _columnsAlterationsManager: ColumnsAlterationsManagerService,
  ) {
    this._columns$ = combineLatest([
      this._datatable.columns$ ?? of([]),
      observeControlValue<string>(this._filterControl)
    ]).pipe(
      map(([ columns, filter ]) => {
        const _filter = (filter || '').trim().toLowerCase()
        return columns
          .filter(c => this._canToggleColumn(c, _filter))
      }),
    )
  }

  private _canToggleColumn(column: TheSeamDatatableColumn, filter: string, omitInternalColumns: boolean = true): boolean {
    if (omitInternalColumns && isInternalColumn(column)) {
      return false
    }

    return this._columnMatchesFilter(column, filter)
  }

  private _columnMatchesFilter(column: TheSeamDatatableColumn, filter: string): boolean {
    if (filter.length === 0) { return true }

    return `${(getColumnProp(column) || '')}`.toLowerCase().indexOf(filter) !== -1
  }

  _onChange(event: any, col: TheSeamDatatableColumn) {
    const columnProp = getColumnProp(col)
    const hidden = !event.checked

    if (!notNullOrUndefined(columnProp)) {
      throw Error(`Unable to get column prop.`)
    }

    const alteration = new HideColumnColumnsAlteration(
      {
        columnProp,
        hidden
      },
      hidden
    )

    this._columnsAlterationsManager.add([ alteration ])
  }

}
