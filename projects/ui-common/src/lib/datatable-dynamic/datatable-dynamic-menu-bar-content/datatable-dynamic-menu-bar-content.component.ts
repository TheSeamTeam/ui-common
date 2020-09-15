import { ComponentPortal, PortalInjector } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Inject, Injector, Input, OnInit, Optional } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import { TheSeamDynamicComponentLoader } from '../../dynamic-component-loader/index'
import { DynamicValueHelperService } from '../../dynamic/index'
import { hasProperty } from '../../utils/index'

import { map, switchMap, tap } from 'rxjs/operators'
import { IDatatableDynamicMenuBarItemManifest } from '../datatable-dynamic-menu-bar-item-manifest'
import { THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM } from '../datatable-dynamic-menu-bar-token'
import {
  DynamicDatatableMenuBar,
  DynamicDatatableMenuBarColumn,
  DynamicDatatableMenuBarItem,
  DynamicDatatableMenuBarRow,
  DynamicDatatableMenuBarRowLayoutTriColumn
} from '../models/dynamic-datatable-menu-bar'

export interface IDatatableDynamicMenuBarContentItem {
  // styles?: string | string[]
  // cssClass?: string | string[]
  portal?: ComponentPortal<{}>
  // component?: string | ComponentType<{}>
  // config?: any
}

export interface IDatatableDynamicMenuBarContentColumn {
  styles?: string | string[]
  cssClass?: string | string[]
  items?: IDatatableDynamicMenuBarContentItem[]
}

export interface IDatatableDynamicMenuBarContentRowLayoutTriColumn {
  columnLeft?: IDatatableDynamicMenuBarContentColumn
  columnCenter?: IDatatableDynamicMenuBarContentColumn
  columnRight?: IDatatableDynamicMenuBarContentColumn
}

export interface IDatatableDynamicMenuBarContentRow {
  styles?: string | string[]
  cssClass?: string | string[]
  priority?: number
  layoutType?: string
  layout?: IDatatableDynamicMenuBarContentRowLayoutTriColumn
}

export interface IDatatableDynamicMenuBarContentRowContext {
  row: DynamicDatatableMenuBarRow
}

export interface IDatatableDynamicMenuBarContentColumnContext {
  column: DynamicDatatableMenuBarColumn
  row: DynamicDatatableMenuBarRow
}

export interface IDatatableDynamicMenuBarContentItemContext {
  item: DynamicDatatableMenuBarItem
  row: DynamicDatatableMenuBarRow
  column: DynamicDatatableMenuBarColumn
}

@Component({
  selector: 'seam-datatable-dynamic-menu-bar-content',
  templateUrl: './datatable-dynamic-menu-bar-content.component.html',
  styleUrls: ['./datatable-dynamic-menu-bar-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicMenuBarContentComponent implements OnInit {

  private readonly _def = new BehaviorSubject<DynamicDatatableMenuBar | undefined>(undefined)

  @Input()
  set def(value: DynamicDatatableMenuBar | undefined) { this._def.next(value) }
  get def(): DynamicDatatableMenuBar | undefined { return this._def.value }

  public readonly def$: Observable<DynamicDatatableMenuBar | undefined>

  readonly _rows$: Observable<IDatatableDynamicMenuBarContentRow[]>

  constructor(
    private readonly _valueHelper: DynamicValueHelperService,
    private readonly _dynamicComponentLoader: TheSeamDynamicComponentLoader,
    private readonly _injector: Injector,
    @Optional() @Inject(THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM)
    private readonly _menuBarItemManifests?: IDatatableDynamicMenuBarItemManifest[]
  ) {
    this.def$ = this._def.asObservable()
      // .pipe(tap(v => console.log('def$', v)))

    this._rows$ = this.def$.pipe(switchMap(def => this._mapRows(def && def.rows || [])))
      // .pipe(tap(v => console.log('_rows$', v)))
  }

  ngOnInit() { }

  private _mapRows(rows: DynamicDatatableMenuBarRow[]): Promise<IDatatableDynamicMenuBarContentRow[]> {
    return Promise.all(rows.map(r => this._mapRow(r)))
  }

  private async _mapRow(row: DynamicDatatableMenuBarRow): Promise<IDatatableDynamicMenuBarContentRow> {
    const result: IDatatableDynamicMenuBarContentRow = { }
    const context = this._createRowContext(row)

    if (hasProperty(row, 'styles')) {
      result.styles = await this._valueHelper.eval(row.styles, context)
    }

    if (hasProperty(row, 'cssClass')) {
      result.cssClass = await this._valueHelper.eval(row.cssClass, context)
    }

    if (hasProperty(row, 'priority')) {
      result.priority = await this._valueHelper.eval(row.priority, context)
    }

    result.layoutType = row.layout.type
    result.layout = await this._mapRowLayout(row.layout, row)

    return result
  }

  private async _mapRowLayout(
    layout: DynamicDatatableMenuBarRowLayoutTriColumn,
    row: DynamicDatatableMenuBarRow
  ): Promise<IDatatableDynamicMenuBarContentRowLayoutTriColumn> {
    const result: IDatatableDynamicMenuBarContentRowLayoutTriColumn = { }

    if (hasProperty(layout, 'columnLeft')) {
      result.columnLeft = await this._mapColumn(layout.columnLeft, row)
    }

    if (hasProperty(layout, 'columnCenter')) {
      result.columnCenter = await this._mapColumn(layout.columnCenter, row)
    }

    if (hasProperty(layout, 'columnRight')) {
      result.columnRight = await this._mapColumn(layout.columnRight, row)
    }

    return result
  }

  private async _mapColumn(
    column: DynamicDatatableMenuBarColumn,
    row: DynamicDatatableMenuBarRow
  ): Promise<IDatatableDynamicMenuBarContentColumn> {
    const result: IDatatableDynamicMenuBarContentColumn = { }
    const context = this._createColumnContext(column, row)

    if (hasProperty(column, 'styles')) {
      result.styles = await this._valueHelper.eval(column.styles, context)
    }

    if (hasProperty(column, 'cssClass')) {
      result.cssClass = await this._valueHelper.eval(column.cssClass, context)
    }

    result.items = await Promise.all(column.items.map(v => this._mapItem(v, row, column)))

    return result
  }

  private async _mapItem(
    item: DynamicDatatableMenuBarItem,
    row: DynamicDatatableMenuBarRow,
    column: DynamicDatatableMenuBarColumn
  ): Promise<IDatatableDynamicMenuBarContentItem> {
    const result: IDatatableDynamicMenuBarContentItem = { }
    const context = this._createItemContext(item, row, column)

    // if (hasProperty(item, 'styles')) {
    //   result.styles = await this._valueHelper.eval(item.styles, context)
    // }

    // if (hasProperty(item, 'cssClass')) {
    //   result.cssClass = await this._valueHelper.eval(item.cssClass, context)
    // }

    if (hasProperty(item, 'component')) {
      // result.component = await this._valueHelper.eval(item.component, context)
      const component = await this._valueHelper.eval(item.component, context)

      let data: any
      if (hasProperty(item, 'data')) {
        // result.data = await this._valueHelper.eval(item.data, context)
        // console.log('%cdata', 'color:cyan', item.data)
        data = await this._valueHelper.eval(item.data, context)
        // console.log('%cdata', 'color:limegreen', data)
      }

      result.portal = await this._getComponentPortal(component, data)
    }

    return result
  }

  private _createRowContext(row: DynamicDatatableMenuBarRow): IDatatableDynamicMenuBarContentRowContext {
    return {
      row
    }
  }

  private _createColumnContext(
    column: DynamicDatatableMenuBarColumn,
    row: DynamicDatatableMenuBarRow
  ): IDatatableDynamicMenuBarContentColumnContext {
    return {
      row,
      column
    }
  }

  private _createItemContext(
    item: DynamicDatatableMenuBarItem,
    row: DynamicDatatableMenuBarRow,
    column: DynamicDatatableMenuBarColumn
  ): IDatatableDynamicMenuBarContentItemContext {
    return {
      item,
      row,
      column
    }
  }

  private async _getComponentPortal(component: string, data?: any): Promise<ComponentPortal<{}> | undefined> {
    const manifest = (this._menuBarItemManifests || []).find(m => m.name === component)

    if (!manifest) {
      // TODO: Make sure the component is skipped instead of erroring outside of dev mode.
      throw Error(`MenuBar manifest for '${component}' not found.`)
    }

    // TODO: Create a new injector with the data injected
    let injector = this._injector
    if (manifest.dataToken) {
      injector = new PortalInjector(this._injector, new WeakMap([
        [manifest.dataToken, data]
      ]))
    }

    if (typeof manifest.component === 'string') {
      this._dynamicComponentLoader.getComponentFactory<{}>(manifest.component).pipe(
        map(componentFactory => {
          return new ComponentPortal(
            componentFactory.componentType,
            null,
            injector,
            (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
          )
        })
      ).toPromise()
    } else {
      return new ComponentPortal(manifest.component, null, injector, null)
    }
  }

}
