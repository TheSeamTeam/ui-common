import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TABLE_CELL_DATA } from '@theseam/ui-common/table-cell-type'
import type { TableCellData } from '@theseam/ui-common/table-cell-type'
import { coercePhoneNumberFormat, THESEAM_DEFAULT_PHONE_NUMBER_FORMAT } from '@theseam/ui-common/tel-input'
import type { intlTelInputUtils } from '@theseam/ui-common/tel-input'
import { hasProperty } from '@theseam/ui-common/utils'

import { TableCellTypeConfigPhone } from './table-cell-type-phone-config'

@Component({
  selector: 'seam-table-cell-type-phone',
  templateUrl: './table-cell-type-phone.component.html',
  styleUrls: ['./table-cell-type-phone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypePhoneComponent implements OnDestroy {

  /** @ignore */
  private readonly _ngUnsubscribe = new Subject<void>()

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
          if (Object.prototype.hasOwnProperty.call(v.changes, 'value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (Object.prototype.hasOwnProperty.call(v.changes, 'colData')) {
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

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

}
