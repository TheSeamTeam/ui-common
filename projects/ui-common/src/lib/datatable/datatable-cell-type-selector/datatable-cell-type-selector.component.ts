import { ComponentPortal, PortalInjector } from '@angular/cdk/portal'
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, isDevMode, OnInit } from '@angular/core'
import { IDatatableCellData } from './datatable-cell.models'

import { ComponentType } from '@angular/cdk/portal'

import { DatatableCellTypeDateComponent } from '../datatable-cell-types/datatable-cell-type-date/datatable-cell-type-date.component'
import { DatatableCellTypeIconComponent } from '../datatable-cell-types/datatable-cell-type-icon/datatable-cell-type-icon.component'
import { ITheSeamTableColumn, TheSeamTableCellType } from '../models/table-column'
import { DATATABLE_CELL_DATA } from './datatable-cell-tokens'

export const cellTypeCompsMap: { [type: string /* TheSeamTableCellType */]: ComponentType<{}> } = {
  'date': DatatableCellTypeDateComponent,
  'icon': DatatableCellTypeIconComponent
}

@Component({
  selector: 'seam-datatable-cell-type-selector',
  templateUrl: './datatable-cell-type-selector.component.html',
  styleUrls: ['./datatable-cell-type-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableCellTypeSelectorComponent<D = any, V = any> implements OnInit, AfterViewInit {

  @Input() type: TheSeamTableCellType
  @Input() value: V
  @Input() rowIndex: number
  @Input() row: D
  @Input() colData: ITheSeamTableColumn<D>

  public componentPortal: ComponentPortal<{}>

  constructor(
    private _injector: Injector,
    private _ref: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    const comp = cellTypeCompsMap[this.type]
    if (comp) {
      this.componentPortal = new ComponentPortal(comp, null, this._createInjector({
        row: this.row,
        rowIndex: this.rowIndex,
        colData: this.colData,
        value: this.value
      }))
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

}
