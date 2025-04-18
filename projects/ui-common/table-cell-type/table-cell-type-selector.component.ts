import { ComponentPortal, PortalInjector } from '@angular/cdk/portal'
import { ComponentType } from '@angular/cdk/portal'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  isDevMode,
  OnChanges,
  Optional,
  SimpleChanges
} from '@angular/core'
import { Subject } from 'rxjs'

import { TableCellTypeConfig } from './table-cell-type-config'
import type { TheSeamTableColumn } from './table-cell-type-models'
import { ITableCellTypeManifest, TableCellData, TableCellDataChange } from './table-cell-type-models'
import { TABLE_CELL_DATA, TABLE_CELL_TYPE_MANIFEST } from './table-cell-type-tokens'

@Component({
  selector: 'seam-table-cell-type-selector',
  template: `
    <ng-template *ngIf="componentPortal; else noPortal" [cdkPortalOutlet]="componentPortal"></ng-template>
    <ng-template #noPortal>{{ value }}</ng-template>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeSelectorComponent<T extends string = any, D = any, V = any> implements AfterViewInit, OnChanges {

  @Input() type: T | undefined | null
  @Input() value: V | undefined | null
  @Input() rowIndex: number | undefined | null
  @Input() row: D | undefined | null
  @Input() colData: TheSeamTableColumn<T, TableCellTypeConfig<T>> | undefined | null

  public componentPortal?: ComponentPortal<unknown>

  private _data: TableCellData<T, TableCellTypeConfig<T>> | undefined
  private _dataChangeSubject?: Subject<TableCellDataChange<T, TableCellTypeConfig<T>>>
  private _manifests: ITableCellTypeManifest[]

  constructor(
    private _injector: Injector,
    private _ref: ChangeDetectorRef,
    @Optional() @Inject(TABLE_CELL_TYPE_MANIFEST) manifests?: ITableCellTypeManifest[]
  ) { this._manifests = manifests || [] }

  ngAfterViewInit() {
    if (!this.type) {
      return
    }

    const comp = this._getComponent(this.type)
    if (comp) {
      this._dataChangeSubject = new Subject<TableCellDataChange<T, TableCellTypeConfig<T>>>()

      this._data = {
        row: this.row,
        rowIndex: this.rowIndex ?? -1,
        colData: this.colData ?? {},
        value: this.value,
        changed: this._dataChangeSubject.asObservable()
      }

      this.componentPortal = new ComponentPortal(comp, null, this._createInjector(this._data))
      this._ref.detectChanges()
    } else {
      if (isDevMode()) {
        throw new Error(`CellType '${this.type}' not found.`)
      } else {
        // TODO: Implement fallback
      }
    }
  }

  private _getComponent(name: string): ComponentType<unknown> | undefined {
    const manifest = this._manifests.find(m => m.name === name)
    return manifest ? manifest.component : undefined
  }

  private _createInjector(cellData: TableCellData<T, TableCellTypeConfig<T>>): PortalInjector {
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

  private _tryUpdateDataProp(changes: SimpleChanges, prop: keyof Omit<TableCellData<T, TableCellTypeConfig<T>>, 'changed'>): boolean {
    if (this._data && Object.prototype.hasOwnProperty.call(changes, prop)) {
      this._data[prop] = changes[prop].currentValue
      return true
    }
    return false
  }

}
