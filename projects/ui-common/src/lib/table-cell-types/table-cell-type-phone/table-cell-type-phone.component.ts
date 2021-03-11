import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TABLE_CELL_DATA } from '@lib/ui-common/table'
import type { TableCellData } from '@lib/ui-common/table'
import { hasProperty } from '@lib/ui-common/utils'

import { coercePhoneNumberFormat, intlTelInputUtils, THESEAM_DEFAULT_PHONE_NUMBER_FORMAT } from '../../tel-input'

import { TableCellTypeConfigPhone } from './table-cell-type-phone-config'

@Component({
  selector: 'seam-table-cell-type-phone',
  templateUrl: './table-cell-type-phone.component.html',
  styleUrls: ['./table-cell-type-phone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypePhoneComponent implements OnInit, OnDestroy {

  /** @ignore */
  private readonly _ngUnsubscribe = new Subject()

  /** @ignore */
  _format: intlTelInputUtils.numberFormat = THESEAM_DEFAULT_PHONE_NUMBER_FORMAT

  @Input() value?: string | null
  @Input()
  set format(value: intlTelInputUtils.numberFormat) { this._format = coercePhoneNumberFormat(value) }
  get format() { return this._format }

  constructor(
    private _cdf: ChangeDetectorRef,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'phone', TableCellTypeConfigPhone>
  ) {
    const _data = _tableData

    this.value = _data && _data.value
    if (_data && _data.colData && _data.colData.cellTypeConfig && hasProperty(_data.colData.cellTypeConfig, 'format')) {
      this.format = _data.colData.cellTypeConfig.format as intlTelInputUtils.numberFormat
    }

    if (_data) {
      _data.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && hasProperty(colData, 'cellTypeConfig') &&
              hasProperty(colData.cellTypeConfig, 'format') &&
              colData.cellTypeConfig.format !== this.format
            ) {
              this.format = colData.cellTypeConfig.format
            } else {
              this.format = THESEAM_DEFAULT_PHONE_NUMBER_FORMAT
            }
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

}
