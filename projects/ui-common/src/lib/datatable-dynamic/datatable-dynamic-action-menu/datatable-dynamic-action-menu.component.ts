import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'

import { isActionType } from '../../dynamic/utils/index'

import { BehaviorSubject } from 'rxjs';
import { DynamicValueHelperService } from '../../dynamic/dynamic-value-helper.service'
import { IDynamicDatatableRow } from '../datatable-dynamic-def'
import { IDynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'

export function expectedElementTypeForAction(def: IDynamicDatatableRowAction): 'a' | 'button' {
  const action = def.action

  if (isActionType<'api'>(action, 'api')) {
    return 'a'
  }

  return 'button'
}

@Component({
  selector: 'seam-datatable-dynamic-action-menu',
  templateUrl: './datatable-dynamic-action-menu.component.html',
  styleUrls: ['./datatable-dynamic-action-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicActionMenuComponent implements OnInit {

  faEllipsisH = faEllipsisH

  @Input()
  get row() { return this._row.value }
  set row(value: IDynamicDatatableRow | undefined) { this._row.next(value || undefined) }
  private _row = new BehaviorSubject<IDynamicDatatableRow | undefined>(undefined)

  @Input()
  get def() { return this._def.value }
  set def(value: IDynamicDatatableRowAction | undefined) { this._def.next(value || undefined) }
  private _def = new BehaviorSubject<IDynamicDatatableRowAction | undefined>(undefined)

  /** @ignore */
  _actionMenuPositions = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ]

  constructor(
    private _valueHelper: DynamicValueHelperService
  ) { }

  ngOnInit() { }

}
