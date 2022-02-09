import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { notNullOrUndefined, observeControlValue } from '@theseam/ui-common/utils'

import { DatatableComponent, THESEAM_DATATABLE } from '../datatable/datatable.component'
import { TheSeamDatatableColumn } from '../models/table-column'
import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { getColumnProp } from '../utils/get-column-prop'
import { ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'

@Component({
  selector: 'seam-datatable-column-preferences',
  templateUrl: './datatable-column-preferences.component.html',
  styleUrls: ['./datatable-column-preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableColumnPreferencesComponent implements OnInit {

  _columns$: Observable<TheSeamDatatableColumn[]>

  _filterControl = new FormControl()

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
        return columns.filter(c => `${(getColumnProp(c) || '')}`.toLowerCase().indexOf(_filter) !== -1)
      }),
      map(cols => cols.sort((a, b) => {
        const aProp = getColumnProp(a)
        const bProp = getColumnProp(b)
        return aProp === bProp ? 0 : (<string>aProp) > (<string>bProp) ? 1 : -1
      }))
    )
  }

  ngOnInit() { }

  _onChange(event: any, col: TheSeamDatatableColumn) {
    // TODO: Figure out the right way to update this value. If it is set by
    // column component input this may not work right.
    // const columns = this._datatable.columns || []
    // const column = columns.find(c => c.prop === col.prop)
    // if (column) {
    //   column.hidden = !event.checked
    //   this._datatable.columns = [ ...columns ]
    // }

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

  _onCloseClick() {
    // TODO: Implement when PopoverRef is implemented.
  }

}
