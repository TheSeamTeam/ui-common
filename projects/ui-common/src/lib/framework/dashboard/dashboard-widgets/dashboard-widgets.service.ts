import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable, isDevMode, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { auditTime, map, mapTo, shareReplay, switchMap, take, tap } from 'rxjs/operators'

import { TheSeamDynamicComponentLoader } from '@lib/ui-common/dynamic-component-loader'
import { notNullOrUndefined } from '@lib/ui-common/utils'

import {
  IDashboardWidgetItemLayoutPreference,
  IDashboardWidgetsColumnRecord,
  IDashboardWidgetsItem,
  IDashboardWidgetsItemDef
} from './dashboard-widgets-item'
import { DashboardWidgetsPreferencesService } from './dashboard-widgets-preferences.service'

@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetsService {

  public readonly preferenceKey: string = 'datatable-widgets'

  public readonly defaultNumColumns: number = 3

  /** Used for operations, such as 'addWidget', if the column is not specified. */
  public readonly defaultColumn: number = 0

  get widgets(): IDashboardWidgetsItemDef[] { return this._widgets.value }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._widgets.next(value) }
  private _widgets = new BehaviorSubject<IDashboardWidgetsItemDef[]>([])

  get numColumns(): number { return this._numColumns.value }
  set numColumns(value: number) {
    if (value !== this._numColumns.value) {
      this._numColumns.next(value)
    }
  }
  private _numColumns = new BehaviorSubject<number>(this.defaultNumColumns)

  public readonly numColumns$: Observable<number>
  public readonly widgetItems$: Observable<IDashboardWidgetsItem[]>
  public readonly widgetColumns$: Observable<IDashboardWidgetsColumnRecord[]>

  private readonly _viewContainerRefSubject = new BehaviorSubject<ViewContainerRef | undefined>(undefined)

  constructor(
    private readonly _dynamicComponentLoaderModule: TheSeamDynamicComponentLoader,
    private readonly _preferences: DashboardWidgetsPreferencesService
  ) {
    this.numColumns$ = this._numColumns.asObservable()

    // Widget items without preferences
    const _widgetItems$ = combineLatest([ this._widgets, this._viewContainerRefSubject ])
      .pipe(switchMap(([ defs, vcr ]) => this.createWidgetItems(defs, vcr)))

    // Widget items with preferences
    this.widgetItems$ = combineLatest([ _widgetItems$, this.numColumns$ ])
      .pipe(
        // Wait until the current tick is done, incase both the widgets and
        // number of columns are set durring the same tick. Without the audit,
        // this would get called twice when the component is initialized with
        // both inputs set one after the other individually.
        auditTime(0),
        switchMap(([ items, numColumns ]) =>
          this._preferences.selectLayout(this.preferenceKey, this._layoutName(numColumns)).pipe(
            map(layout => layout ? this.withLayoutPreferences(items, layout) : items)
          )
        ),
        shareReplay({ bufferSize: 1, refCount: true })
      )

    this.widgetColumns$ = this.widgetItems$
      .pipe(
        map(items => this.toColumnRecords(items)),
        shareReplay({ bufferSize: 1, refCount: true })
      )
  }

  private _layoutName(numColumns: number): string {
    return `columns-${numColumns}`
  }

  public setViewContainerRef(vcr: ViewContainerRef | undefined) {
    this._viewContainerRefSubject.next(vcr)
  }

  public createWidgetItems(defs: IDashboardWidgetsItemDef[], vcr?: ViewContainerRef): Observable<IDashboardWidgetsItem[]> {
    const _createObservables = (defs || []).map(d => this.createWidgetItem(d, vcr))
    const items$ = _createObservables.length > 0 ? combineLatest(_createObservables) : of([])
    return items$.pipe(
      map(items => items.filter(notNullOrUndefined)),
      tap(items => {
        if (isDevMode()) {
          const ids: string[] = items.map(v => v.widgetId)
          if ((new Set(ids)).size !== ids.length) {
            console.warn(`[DashboardWidgetsService] Duplicate widget's with the same 'widgetId' found.`)
          }
        }
      })
    )
  }

  public createWidgetItem(def: IDashboardWidgetsItemDef, vcr?: ViewContainerRef): Observable<IDashboardWidgetsItem | undefined> {
    if (!def.widgetId || typeof def.widgetId !== 'string' || def.widgetId.length < 1) {
      if (isDevMode()) {
        console.warn(`[DashboardWidgetsService] Widget ignored. All widgets must have a 'widgetId'.`, def)
      }
      return of(undefined)
    }

    return this.createWidgetPortal(def, vcr).pipe(
      map(portal => ({
        ...def,
        col: def.col || this.defaultColumn,
        order: def.order || 0,
        portal,
        __itemDef: def
      }))
    )
  }

  public createWidgetPortal(def: IDashboardWidgetsItemDef, vcr?: ViewContainerRef): Observable<ComponentPortal<any>> {
    if (typeof def.component === 'string') {
      return this._dynamicComponentLoaderModule
        .getComponentFactory(def.component)
        .pipe(
          map(componentFactory => {
            return new ComponentPortal(
              componentFactory.componentType,
              vcr,
              undefined,
              (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
            )
          }),
          take(1)
        )
    }

    return def.componentFactoryResolver
      ? of(new ComponentPortal(def.component, vcr, undefined, def.componentFactoryResolver))
      : of(new ComponentPortal(def.component, vcr))
  }

  public updateOrder(): Observable<void> {
    return this.widgetColumns$
      .pipe(
        take(1),
        tap(columns => columns.forEach(col => {
          let i = 0
          col.items.forEach(itm => itm.order = i++)
        })),
        mapTo(undefined)
      )
  }

  public toColumnRecords(items: IDashboardWidgetsItem[]): IDashboardWidgetsColumnRecord[] {
    let columns: IDashboardWidgetsColumnRecord[] = []

    for (let i = 0; i < this.numColumns; i++) {
      columns.push({ column: i, items: [] })
    }

    const colNotFound: IDashboardWidgetsItem[] = []

    // Distribute items into columns
    for (const item of items) {
      const col: IDashboardWidgetsColumnRecord | undefined = columns.find(c => c.column === item.col)
      if (!col) {
        // columns.push({ column: item.col, items: [ item ] })
        // if (item.col < 0) {
        //   const col0: IDashboardWidgetsColumnRecord | undefined = columns.find(c => c.column === 0)
        //   if (col0) {
        //     col0.items.push(item)
        //   }
        // } else if (item.col > this.numColumns - 1) {
        //   const colMax: IDashboardWidgetsColumnRecord | undefined = columns.find(c => c.column === this.numColumns - 1)
        //   if (colMax) {
        //     colMax.items.push(item)
        //   }
        // }
        colNotFound.push(item)
      } else {
        col.items.push(item)
      }
    }

    for (let i = 0; i < colNotFound.length; i++) {
      const item = colNotFound[i]

      const col: IDashboardWidgetsColumnRecord | undefined = columns
        .find(c => c.column === i % this.numColumns)

      if (col) {
        col.items.push(item)
      }
    }

    // Sort columns
    columns = columns.sort((a, b) => a.column - b.column)

    // Sort columns items
    columns.forEach(col => col.items.sort((a, b) => a.order - b.order))

    return columns
  }

  public withLayoutPreferences(items: IDashboardWidgetsItem[], layout: IDashboardWidgetItemLayoutPreference): IDashboardWidgetsItem[] {
    const _items: IDashboardWidgetsItem[] = []

    for (const item of items) {
      const itemPref = layout.items.find(x => x.widgetId === item.widgetId)
      _items.push({
        ...item,
        ...(itemPref || {})
      })
    }

    return _items
  }

  public savePreferences(): Observable<void> {
    // Right now the items are moved between the column record arrays, but the
    // 'col' prop is not updated, so it is mapped to corrected items here from
    // the column records.
    const items$ = this.widgetColumns$.pipe(
      map(columns => ([] as IDashboardWidgetsItem[])
        .concat(...(columns.map(c => c.items.map(itm => ({ ...itm, col: c.column })))))
      ),
    )

    return combineLatest([ items$, this.numColumns$ ]).pipe(
      auditTime(0),
      take(1),
      switchMap(([ items, numColumns ]) => {
        return this._preferences.updateLayout(this.preferenceKey, {
          name: this._layoutName(numColumns),
          items
        })
      }),
      mapTo(undefined)
    )
  }

}
