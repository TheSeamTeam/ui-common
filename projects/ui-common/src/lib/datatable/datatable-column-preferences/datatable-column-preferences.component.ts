import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { observeControlValue } from '../../utils/index'

import { DatatableComponent, THESEAM_DATATABLE } from '../datatable/datatable.component'
import { TheSeamDatatableColumn } from '../models/table-column'

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
  ) {
    this._columns$ = combineLatest([
      this._datatable.columns$,
      observeControlValue<string>(this._filterControl)
    ]).pipe(
      map(([ columns, filter ]) => {
        const _filter = (filter || '').trim().toLowerCase()
        return columns.filter(c => `${(c.name || c.prop || '')}`.toLowerCase().indexOf(_filter) !== -1)
      }),
      map(cols => cols.sort((a, b) => a.prop === b.prop ? 0 : (<string>a.prop) > (<string>b.prop) ? 1 : -1))
    )
  }

  ngOnInit() { }

  _onChange(event: any, col: TheSeamDatatableColumn) {
    // TODO: Figure out the right way to update this value. If it is set by
    // column component input this may not work right.
    const columns = this._datatable.columns
    const column = columns.find(c => c.prop === col.prop)
    if (column) {
      column.hidden = !event.checked
      this._datatable.columns = [ ...columns ]
    }
  }

  _onCloseClick() {
    // TODO: Implement when PopoverRef is implemented.
  }

}
