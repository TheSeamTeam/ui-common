import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject } from 'rxjs';

import { IDatatableDynamicDef } from './datatable-dynamic-def'

@Component({
  selector: 'seam-datatable-dynamic',
  templateUrl: './datatable-dynamic.component.html',
  styleUrls: ['./datatable-dynamic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicComponent implements OnInit {

  @Input()
  set data(value: IDatatableDynamicDef | undefined | null) {
    console.log('value', value)
    this._data.next(value)
  }
  get data() { return this._data.value }
  private _data = new BehaviorSubject<IDatatableDynamicDef | undefined | null>(undefined)

  constructor() { }

  ngOnInit() {
  }

}
