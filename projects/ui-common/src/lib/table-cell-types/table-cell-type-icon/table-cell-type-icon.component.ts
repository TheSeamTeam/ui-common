import { ComponentType } from '@angular/cdk/portal/index'
import { ChangeDetectionStrategy, Component, HostBinding, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import jexl from 'jexl'

import {
  DynamicDatatableCellActionModal,
  DynamicDatatableCellTypeConfigIcon,
  DynamicDatatableCellTypeConfigIconAction
} from '../../datatable-dynamic/index'
import { getKnownIcon, SeamIcon, TheSeamIconType } from '../../icon/index'
import { Modal } from '../../modal/index'

import { TheSeamDynamicComponentLoader } from '../../dynamic-component-loader'
import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'

import { DATATABLE_CELL_DATA } from '../../datatable/datatable-cell-type-selector/datatable-cell-tokens'
import { IDatatableCellData } from '../../datatable/datatable-cell-type-selector/datatable-cell.models'
import { DatatableComponent, THESEAM_DATATABLE } from '../../datatable/datatable/datatable.component'

export type IconTemplateType = 'default' | 'link' | 'link-external' | 'link-encrypted' | 'button'

@Component({
  selector: 'seam-table-cell-type-icon',
  templateUrl: './table-cell-type-icon.component.html',
  styleUrls: ['./table-cell-type-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeIconComponent implements OnInit, OnDestroy {

  @Input()
  get value() { return this._value }
  set value(value: string | undefined | null) {
    this._value = value
    this._icon = value ? getKnownIcon(value) || value : value
  }
  private _value: string | undefined | null

  @Input()
  get config() { return this._config }
  set config(value: DynamicDatatableCellTypeConfigIcon | undefined | null) {
    this._config = value
    if (value) {
      this.setAction(value.action)
      this._linkClass = this._parseConfigValue(value.linkClass)
      this._iconClass = this._parseConfigValue(value.iconClass)
      this._iconType = value.iconType
    }
  }
  private _config: DynamicDatatableCellTypeConfigIcon | undefined | null

  _icon: SeamIcon | undefined | null
  _link?: string
  _tplType: IconTemplateType = 'default'
  _title?: string
  _srOnly?: string
  _linkClass?: string
  _iconClass?: string
  _iconType?: TheSeamIconType

  _buttonAction?: DynamicDatatableCellTypeConfigIconAction

  _row?: any
  _rowIndex?: number

  @HostBinding('class.datatable-cell-type') _isDatatable = false

  constructor(
    private _dynamicComponentLoaderModule: TheSeamDynamicComponentLoader,
    private _modal: Modal,
    @Optional() @Inject(THESEAM_DATATABLE) _datatable?: DatatableComponent,
    @Optional() @Inject(DATATABLE_CELL_DATA) _datatableData?: IDatatableCellData<any, string>,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: ITableCellData<any, string>
  ) {
    if (_datatable) {
      this._isDatatable = true
    }

    const _data = _datatableData || _tableData

    this._row = _data && _data.row
    this._rowIndex = _data && _data.rowIndex

    this.value = _data && _data.value
    if (_data && _data.colData && (<any>_data.colData).cellTypeConfig) {
      this.config = (<any>_data.colData).cellTypeConfig
    }

    if (_data) {
      _data.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
          }

          if (v.changes.hasOwnProperty('colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.cellTypeConfig !== this.config) {
              this.config = colData.cellTypeConfig
            } else {
              this.config = undefined
            }
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() { }

  public setAction(configAction?: DynamicDatatableCellTypeConfigIconAction) {
    let newTplType: IconTemplateType = 'default'
    let link: string | undefined

    if (configAction) {
      if (configAction.type === 'link') {
        newTplType = configAction.encrypted ? 'link-encrypted' : 'link'
        if (configAction.link && typeof configAction.link !== 'string') {
          if (configAction.link.type === 'jexl') {
            link = jexl.evalSync(configAction.link.expr, { row: this._row })
          }
        } else {
          link = configAction.link
        }
      } else if (configAction.type === 'modal') {
        newTplType = 'button'
        this._buttonAction = configAction
      }
    }

    this._tplType = newTplType
    this._link = link
  }

  private _parseConfigValue(val) {
    if (!val) {
      return
    }

    if (typeof val === 'string') {
      return val
    }

    if (val.type === 'jexl') {
      return jexl.evalSync(val.expr, { row: this._row })
    }
  }

  _doButtonAction() {
    if (this._buttonAction && this._buttonAction.type === 'modal') {
      this._handleModalAction(this._buttonAction)
    }
  }

  private _handleModalAction(
    action: DynamicDatatableCellActionModal,
  ) {
    let data: any | undefined
    if (action.data) {
      if (action.data.type === 'jexl') {
        data = jexl.evalSync(action.data.expr, { row: this._row })
      }
    }

    if (typeof action.component === 'string') {
      this._dynamicComponentLoaderModule
        .getComponentFactory<{}>(action.component)
        .subscribe(componentFactory => {
          console.log('componentFactory', componentFactory)
          console.log('data', data)

          const modalRef = this._modal.openFromComponent(
            componentFactory.componentType,
            { modalSize: 'lg', data },
            (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
          )

          if (action.resultActions) {
            modalRef.afterClosed()
              .pipe(untilDestroyed(this))
              .subscribe(result => {
                if (action.resultActions && action.resultActions[result]) {
                  const resultAction = action.resultActions[result]
                  if (resultAction.type === 'modal') {
                    this._handleModalAction(resultAction)
                  }
                }
              })
          }
        }, error => {
          console.warn(error)
        })
    }
  }

}
