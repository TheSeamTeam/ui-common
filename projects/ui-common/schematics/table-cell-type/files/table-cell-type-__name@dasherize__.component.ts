import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core'
import { Subscription } from 'rxjs'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { TableCellType<%= classify(name) %>Config } from './table-cell-type-<%= dasherize(name) %>-config'
import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'
import { hasProperty } from '../../utils'
import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'

@Component({
  selector: 'seam-table-cell-type-<%= dasherize(name) %>',
  templateUrl: './table-cell-type-<%= dasherize(name) %>.component.html',
  styleUrls: ['./table-cell-type-<%= dasherize(name) %>.component.scss'],
  host: { },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellType<%= classify(name) %>Component implements OnInit, OnDestroy {

  @Input() value?: string | null

  @Input() title?: string | null

  @HostBinding('attr.title') get _titleAttr() { return this.title || this.value }

  private _config?: TableCellType<%= classify(name) %>Config
  private _clickSub?: Subscription
  private _data?: ITableCellData<any, string>

  constructor(
    private readonly _cdf: ChangeDetectorRef,
    private readonly _elementRef: ElementRef,
    private readonly _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() @Inject(TABLE_CELL_DATA) readonly _tableData?: ITableCellData<any, string>
  ) {
    this._data = _tableData

    this.value = this._data && this._data.value

    if (this._data && this._data.colData && (<any>this._data.colData).cellTypeConfig) {
      this._config = (<any>this._data.colData).cellTypeConfig

      if (this._config) {

      }
    }

    if (this._data) {
      this._data.changed
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

  public getNativeElement(): HTMLElement | undefined {
    return this._elementRef && this._elementRef.nativeElement
  }

  private _parseConfigValue(val) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, this._data)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

}
