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

import { TABLE_CELL_DATA } from '../table/table-cell-tokens'
import { ITableCellData, ITableCellDataChange } from '../table/table-cell.models'
import { ITheSeamTableColumn, TheSeamTableCellType } from '../table/table-column'

import { TableCellTypeDateComponent } from '../table-cell-types/table-cell-type-date/table-cell-type-date.component'
import { TableCellTypeIconComponent } from '../table-cell-types/table-cell-type-icon/table-cell-type-icon.component'

export const cellTypeCompsMap: { [type: string /* TheSeamTableCellType */]: ComponentType<{}> } = {
  'date': TableCellTypeDateComponent,
  'icon': TableCellTypeIconComponent,
  'image': TableCellTypeIconComponent
}

@Component({
  selector: 'seam-table-cell-type-selector',
  template: `
    <ng-template *ngIf="componentPortal; else noPortal" [cdkPortalOutlet]="componentPortal"></ng-template>
    <ng-template #noPortal>{{ value }}</ng-template>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeSelectorComponent<D = any, V = any> implements OnInit, AfterViewInit, OnChanges {

  @Input() type: TheSeamTableCellType
  @Input() value: V
  @Input() rowIndex: number
  @Input() row: D
  @Input() colData: ITheSeamTableColumn<D>

  public componentPortal: ComponentPortal<{}>

  private _data: ITableCellData | undefined
  private _dataChangeSubject: Subject<ITableCellDataChange>

  constructor(
    private _injector: Injector,
    private _ref: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    const comp = cellTypeCompsMap[this.type]
    if (comp) {
      this._dataChangeSubject = new Subject<ITableCellDataChange>()

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

  private _createInjector(cellData: ITableCellData): PortalInjector {
    const injectorTokens = new WeakMap()
    injectorTokens.set(TABLE_CELL_DATA, cellData)
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

  private _tryUpdateDataProp(changes: SimpleChanges, prop: keyof Omit<ITableCellData, 'changed'>): boolean {
    if (this._data && changes.hasOwnProperty(prop)) {
      this._data[prop] = changes[prop].currentValue
      return true
    }
    return false
  }

}
