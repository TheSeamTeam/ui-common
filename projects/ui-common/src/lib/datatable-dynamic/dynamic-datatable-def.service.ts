import { ComponentType } from '@angular/cdk/portal'
import { Inject, Injectable } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { IDynamicDatatableOptions } from './datatable-dynamic-def'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { THESEAM_DATA_FILTER_DEF } from '../data-filters/index'
import { IDataFilter } from '../data-filters/index'
import { DynamicValueHelperService } from '../dynamic/index'
import { notNullOrUndefined } from '../utils/index'

import { IDatatableDynamicDef } from './datatable-dynamic-def'
import { IDynamicDatatableFilterMenuItem } from './models/index'
import { setDynamicDatatableDefDefaults } from './utils/index'

/**
 * Manages the data defined in the `IDatatableDynamicDef`. Simplifies accessing
 * and observing the needed data based on the `IDatatableDynamicDef`.
 */
@Injectable()
export class DynamicDatatableDefService {

  /** @ignore */
  private _dataExporters: IDataExporter[]

  /** @ignore */
  private _dataFilters: { name: string, component: ComponentType<IDataFilter> }[]

  /** @ignore */
  private readonly _defSubject = new BehaviorSubject<IDatatableDynamicDef | undefined>(undefined)

  /** Dynamic datatable definition. */
  public readonly def$: Observable<IDatatableDynamicDef | undefined>

  /** Exporters in the def that are available. */
  public readonly exporters$: Observable<IDataExporter[]>

  /** Filter menu items in the def that are available. */
  public readonly filterMenuItems$: Observable<IDynamicDatatableFilterMenuItem[]>

  /** Observes whether the datatable has a filter menu. */
  public readonly hasFilterMenu$: Observable<boolean>

  /** Observes datatable options. */
  public readonly options$: Observable<IDynamicDatatableOptions | undefined>

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
  }

  /** Sets the `IDatatableDynamicDef` that defines the datatable.  */
  public setDef(def: IDatatableDynamicDef | undefined): void {
    if (def) { setDynamicDatatableDefDefaults(def) }
    this._defSubject.next(def || undefined)
  }

  /** Map the def exporters to the provided `IDataExporter` objects. */
  private _mapExporters(def: IDatatableDynamicDef): IDataExporter[] {
    if (!def.filterMenu || !Array.isArray(def.filterMenu.exporters)) {
      return []
    }

    return def.filterMenu.exporters
      .map(e => this._dataExporters.find(de => de.name === e))
      .filter(notNullOrUndefined)
  }

  /** Map the def filter menu items to provided components. */
  private _mapFilterMenuItems(def: IDatatableDynamicDef): IDynamicDatatableFilterMenuItem[] {
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