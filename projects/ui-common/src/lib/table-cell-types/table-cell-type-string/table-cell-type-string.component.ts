import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core'
import { fromEvent, Subscription } from 'rxjs'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { DynamicDatatableCellTypeConfigString } from '../../datatable-dynamic/models/cell-type-config'
import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'
import { hasProperty } from '../../utils'
import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'

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
  @HostBinding('class.cell-has-click-action') get _cellHasClickActionCss() { return !!this._clickSub }

  canPopover = false

  private _config?: DynamicDatatableCellTypeConfigString
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
        if (hasProperty(this._config, 'action')) {
          this._enableClickAction()
        }
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

  private _enableClickAction(): void {
    const element = this.getNativeElement()
    if (element) {
      this.canPopover = false
      if (this._clickSub && !this._clickSub.closed) {
        this._clickSub.unsubscribe()
      }
      this._clickSub = fromEvent(element, 'click').pipe(
        untilDestroyed(this)
      ).subscribe(() => this._doAction())
    } else {
      if (isDevMode()) {
        console.warn(
          `[TableCellTypeStringComponent] Unable to register 'click' event. NativeElement not defined.`
        )
      }
    }
  }

  public getNativeElement(): HTMLElement | undefined {
    return this._elementRef && this._elementRef.nativeElement
  }

  private _parseConfigValue(val) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, this._data)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  private _doAction() {
    const action = this._config && this._config.action
    if (action && action.type === 'modal') {
      const contextFn = () => this._tableCellTypeHelpers.getValueContext(this.value, this._data)
      this._tableCellTypeHelpers.handleModalAction(action, contextFn)
        .subscribe(
          r => {},
          err => console.error(err),
          // () => this._actionRefreshRequest()
        )
    }
  }

}
