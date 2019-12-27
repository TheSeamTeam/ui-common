import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { isActionType } from '../../dynamic/utils/index'
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

  @Input() def: IDynamicDatatableRowAction

  constructor() { }

  ngOnInit() {
  }

}
