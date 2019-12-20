import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'

@Component({
  selector: 'seam-table-cell-type-string',
  templateUrl: './table-cell-type-string.component.html',
  styleUrls: ['./table-cell-type-string.component.scss'],
  host: { },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeStringComponent implements OnInit, OnDestroy {

  // @Input() value?: string | null
  @Input()
  get value() { return this._value }
  set value(val: string | null | undefined) {
    this._value = val
    // TODO: This is temporary to test the feature and will be fixed when the
    // dynamic column data is fixed. The plan is to add a config toggle to
    // always enable and depending on performance it could try to decide on its
    // own based on content size.
    if (this.value && this.value.length > 30) {
      this.canPopover = true
    }
  }
  _value: string | null | undefined

  @Input() title?: string | null

  @HostBinding('attr.title') get _titleAttr() { return this.title || this.value }

  canPopover = false

  constructor(
    private _cdf: ChangeDetectorRef,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: ITableCellData<any, string>
  ) {
    const _data = _tableData

    this.value = _data && _data.value

    if (_data) {
      _data.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() { }

}
