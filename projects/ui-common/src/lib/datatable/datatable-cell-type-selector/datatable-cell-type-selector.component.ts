import { ComponentPortal, PortalInjector } from '@angular/cdk/portal'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core'

import { ComponentType } from '@angular/cdk/portal'
import { Subject } from 'rxjs'

import { DatatableCellTypeDateComponent } from '../datatable-cell-types/datatable-cell-type-date/datatable-cell-type-date.component'
import { DatatableCellTypeIconComponent } from '../datatable-cell-types/datatable-cell-type-icon/datatable-cell-type-icon.component'
import { ITheSeamTableColumn, TheSeamTableCellType } from '../models/table-column'
import { DATATABLE_CELL_DATA } from './datatable-cell-tokens'
import { IDatatableCellData, IDatatableCellDataChange } from './datatable-cell.models'

export const cellTypeCompsMap: { [type: string /* TheSeamTableCellType */]: ComponentType<{}> } = {
  'date': DatatableCellTypeDateComponent,
  'icon': DatatableCellTypeIconComponent,
  'image': DatatableCellTypeIconComponent
}

@Component({
  selector: 'seam-datatable-cell-type-selector',
  templateUrl: './datatable-cell-type-selector.component.html',
  styleUrls: ['./datatable-cell-type-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableCellTypeSelectorComponent<D = any, V = any> implements OnInit, AfterViewInit, OnChanges {

  @Input() type: TheSeamTableCellType
  @Input() value: V
  @Input() rowIndex: number
  @Input() row: D
  @Input() colData: ITheSeamTableColumn<D>

  public componentPortal: ComponentPortal<{}>

  private _data: IDatatableCellData | undefined
  private _dataChangeSubject: Subject<IDatatableCellDataChange>

  constructor(
    private _injector: Injector,
    private _ref: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    const comp = cellTypeCompsMap[this.type]
    if (comp) {
      this._dataChangeSubject = new Subject<IDatatableCellDataChange>()

      this._data = {
        row: this.row,
        rowIndex: this.rowIndex,
        colData: this.colData,
        value: this.value,
        changed: this._dataChangeSubject.asObservable()
      }

      this.componentPortal = new ComponentPortal(comp, null, this._createInjector(this._data))
      this._ref.detectChanges()
    } else {
      // if (isDevMode()) {
      //   throw new Error(`CellType '${this.type}' not found.`)
      // } else {
      //   // TODO: Implement fallback
      // }
    }
  }

  private _createInjector(cellData: IDatatableCellData): PortalInjector {
    const injectorTokens = new WeakMap()
    injectorTokens.set(DATATABLE_CELL_DATA, cellData)
    return new PortalInjector(this._injector, injectorTokens)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._data) {
      const dataChanged = [
        this._tryUpdateDataProp(changes, 'row'),
        this._tryUpdateDataProp(changes, 'rowIndex'),
        this._tryUpdateDataProp(changes, 'colData'),
        this._tryUpdateDataProp(changes, 'value')
      ].findIndex(b => b === true) !== -1

      if (dataChanged && this._dataChangeSubject) {
        this._dataChangeSubject.next({
          data: this._data,
          changes
        })
      }
    }
  }

  private _tryUpdateDataProp(changes: SimpleChanges, prop: keyof Omit<IDatatableCellData, 'changed'>): boolean {
    if (this._data && changes.hasOwnProperty(prop)) {
      this._data[prop] = changes[prop].currentValue
      return true
    }
    return false
  }

}
