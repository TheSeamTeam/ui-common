import { ComponentPortal } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnDestroy, OnInit } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import {CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType} from 'angular-gridster2'
import { untilDestroyed } from 'ngx-take-until-destroy'

import { notNullOrUndefined } from '../utils/index'

import { IWidgetsGridItem, IWidgetsGridItemDef } from './widgets-grid-item'

@Component({
  selector: 'seam-widgets-grid',
  templateUrl: './widgets-grid.component.html',
  styleUrls: ['./widgets-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetsGridComponent implements OnInit, OnDestroy {

  options: GridsterConfig
  dashboard: Array<GridsterItem>
  resizeEvent: EventEmitter<any> = new EventEmitter<any>()

  @Input()
  get widgets(): IWidgetsGridItemDef[] { return this._widgets.value }
  set widgets(value: IWidgetsGridItemDef[]) { this._widgets.next(value) }
  private _widgets = new BehaviorSubject<IWidgetsGridItemDef[]>([])

  public widgetItems$: Observable<IWidgetsGridItem[]>

  constructor(
    private injector: Injector
  ) { }

  ngOnInit() {
    this.options = {
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.OnDragAndResize,
      compactType: CompactType.None,
      margin: 60,
      mobileBreakpoint: 640,
      disableWindowResize: false,
      scrollToNewItems: false,
      disableWarnings: false,
      ignoreMarginInRow: false,
      itemResizeCallback: (item) => {
        // update DB with new size
        // send the update to widgets
        this.resizeEvent.emit(item)
      },
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    }

    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0, type: 'widgetA'},
      {cols: 2, rows: 2, y: 0, x: 2, type: 'widgetB'},
      {cols: 2, rows: 1, y: 1, x: 0, type: 'widgetC'},
    ]

    this.widgetItems$ = this._widgets
      .pipe(
        untilDestroyed(this),
        map(defs => defs.map(d => this._createWidgetGridItem(d)).filter(notNullOrUndefined)),
        // tap(items => console.log('items', items))
      )

    this.widgetItems$.subscribe()
  }

  ngOnDestroy() { }

  private _createWidgetGridItem(def: IWidgetsGridItemDef): IWidgetsGridItem {
    let portal: ComponentPortal<any>
    if (def.componentFactoryResolver) {
      portal = new ComponentPortal(def.type, undefined, undefined, def.componentFactoryResolver)
    } else {
      portal = new ComponentPortal(def.type)
    }

    const item: IWidgetsGridItem = {
      ...def,
      portal: portal
    }

    return item
  }

}
