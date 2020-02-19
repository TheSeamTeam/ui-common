import { ComponentType } from '@angular/cdk/portal'
import { Inject, Injectable } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { THESEAM_DATA_FILTER_DEF } from '../data-filters/index'
import { IDataFilter } from '../data-filters/index'
import { DynamicValueHelperService } from '../dynamic/index'
import { hasProperty, notNullOrUndefined } from '../utils/index'

import { DynamicDatatableOptions } from './datatable-dynamic-def'
import { DatatableDynamicDef } from './datatable-dynamic-def'
import { DynamicDatatableMenuBar } from './models/dynamic-datatable-menu-bar'
import { DynamicDatatableFilterMenuItem } from './models/index'
import { setDynamicDatatableDefDefaults } from './utils/index'

/**
 * Manages the data defined in the `DatatableDynamicDef`. Simplifies accessing
 * and observing the needed data based on the `DatatableDynamicDef`.
 */
@Injectable()
export class DynamicDatatableDefService {

  /**
   * @deprecated
   * @ignore
   */
  private _dataExporters: IDataExporter[]

  /**
   * @deprecated
   * @ignore
   */
  private _dataFilters: { name: string, component: ComponentType<IDataFilter> }[]

  /** @ignore */
  private readonly _defSubject = new BehaviorSubject<DatatableDynamicDef | undefined>(undefined)

  /** Dynamic datatable definition. */
  public readonly def$: Observable<DatatableDynamicDef | undefined>

  /**
   * Exporters in the def that are available.
   * @deprecated
   */
  public readonly exporters$: Observable<IDataExporter[]>

  /**
   * Filter menu items in the def that are available.
   * @deprecated
   */
  public readonly filterMenuItems$: Observable<DynamicDatatableFilterMenuItem[]>

  /**
   * Observes whether the datatable has a filter menu.
   * @deprecated
   */
  public readonly hasFilterMenu$: Observable<boolean>

  /** Observes datatable options. */
  public readonly options$: Observable<DynamicDatatableOptions | undefined>

  /** Observes the datatable def menu bar. */
  public readonly menuBar$: Observable<DynamicDatatableMenuBar | undefined>

  constructor(
    @Inject(THESEAM_DATA_EXPORTER) dataExporters: IDataExporter[],
    @Inject(THESEAM_DATA_FILTER_DEF) dataFilters: { name: string, component: ComponentType<IDataFilter> }[],
    private _valueHelper: DynamicValueHelperService,
  ) {
    this._dataExporters = (dataExporters || [])
    this._dataFilters = (dataFilters || [])

    this.def$ = this._defSubject.asObservable()

    this.exporters$ = this.def$.pipe(
      map(def => !!def ? this._mapExporters(def) : []),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.filterMenuItems$ = this.def$.pipe(
      map(def => !!def ? this._mapFilterMenuItems(def) : []),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.hasFilterMenu$ = this.def$.pipe(
      switchMap(def => {
        if (!def) { return of(false) }

        // Check if the visibility can be determined by the state value only.
        if (def.filterMenu && def.filterMenu.state) {
          switch (def.filterMenu.state) {
            case 'always-visible': return of(true)
            case 'hidden': return of(false)
          }
        }

        // Check if there is anything to put in the filter menu.
        return combineLatest([
          this.exporters$.pipe(map(e => e.length > 0)),
          this.filterMenuItems$.pipe(map(f => f.length > 0))
        ]).pipe(map(v => v.indexOf(true) !== -1))
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.options$ = this.def$.pipe(
      map(def => !!def ? def.options : undefined),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.menuBar$ = this.def$.pipe(
      map(def => (notNullOrUndefined(def) && hasProperty(def, 'menuBar')) ? def.menuBar : undefined),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  /** Sets the `DatatableDynamicDef` that defines the datatable.  */
  public setDef(def: DatatableDynamicDef | undefined): void {
    if (def) { setDynamicDatatableDefDefaults(def) }
    this._defSubject.next(def || undefined)
  }

  /** Map the def exporters to the provided `IDataExporter` objects. */
  private _mapExporters(def: DatatableDynamicDef): IDataExporter[] {
    if (!def.filterMenu || !Array.isArray(def.filterMenu.exporters)) {
      return []
    }

    return def.filterMenu.exporters
      .map(e => this._dataExporters.find(de => de.name === e))
      .filter(notNullOrUndefined)
  }

  /** Map the def filter menu items to provided components. */
  private _mapFilterMenuItems(def: DatatableDynamicDef): DynamicDatatableFilterMenuItem[] {
    if (!def.filterMenu || !def.filterMenu.filters || !Array.isArray(def.filterMenu.filters)) {
      return []
    }

    return def.filterMenu.filters
      .map(f => {
        const _df = this._dataFilters.find(df => df.name === f.name)
        if (_df) { return { ...f, component: _df.component } }
      })
      .filter(notNullOrUndefined)
  }

}
