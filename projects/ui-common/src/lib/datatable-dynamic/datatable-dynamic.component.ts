import { ComponentType } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { THESEAM_DATA_FILTER_DEF } from '../data-filters/data-filter-def'
import { IDataFilter } from '../data-filters/index'
import { notNullOrUndefined } from '../utils/index'

import { IDatatableDynamicDef } from './datatable-dynamic-def'

export interface IFilterComponentRecord {
  component: ComponentType<IDataFilter>
  options?: any
  order?: number
}

@Component({
  selector: 'seam-datatable-dynamic',
  templateUrl: './datatable-dynamic.component.html',
  styleUrls: ['./datatable-dynamic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicComponent implements OnInit {

  @Input()
  set data(value: IDatatableDynamicDef | undefined | null) {
    console.log('value', value)
    if (value) {
      this._setDefaults(value)
    }
    this._data.next(value)
  }
  get data() { return this._data.value }
  private _data = new BehaviorSubject<IDatatableDynamicDef | undefined | null>(undefined)

  public data$ = this._data.asObservable()

  _exporters$: Observable<IDataExporter[] | undefined>
  _commonFilterComponents$: Observable<IFilterComponentRecord[]>
  _hasFullSearch$: Observable<boolean>
  _hasFilterMenu$: Observable<boolean>

  constructor(
    @Inject(THESEAM_DATA_EXPORTER) public _dataExporters: IDataExporter[],
    @Inject(THESEAM_DATA_FILTER_DEF) public _dataFilters: { name: string, component: ComponentType<IDataFilter> }[]
  ) { }

  ngOnInit() {
    this._exporters$ = this.data$.pipe(map(data => {
      if (data && data.filterMenu && Array.isArray(data.filterMenu.exporters)) {
        return data.filterMenu.exporters
          .map(e => this._dataExporters.find(de => de.name === e))
          .filter(notNullOrUndefined)
      }
      return undefined
    }))

    this._commonFilterComponents$ = this.data$.pipe(map(data => {
      if (
        data && data.filterMenu && Array.isArray(data.filterMenu.filters) &&
        this._dataFilters && Array.isArray(this._dataFilters)
      ) {
        const commonFilters = data.filterMenu.filters.filter(f => f.type === 'common')

        if (!commonFilters || commonFilters.length < 1) {
          return []
        }

        const r = commonFilters
          .map(cf => {
            const _df = this._dataFilters.find(df => df.name === cf.name)
            if (_df) {
              const record: IFilterComponentRecord = {
                component: _df.component,
                options: cf.options,
                order: cf.order || 0
              }
              return record
            }
            return null
          })
          .filter(notNullOrUndefined)

        return r
      }
      return []
    }))

    this._hasFullSearch$ = this.data$.pipe(map(data => {
      if (data && data.filterMenu && Array.isArray(data.filterMenu.filters)
        && data.filterMenu.filters.findIndex(f => f.type === 'full-search') !== -1
      ) {
        return true
      }
      return false
    }))

    this._hasFilterMenu$ = this.data$.pipe(
      switchMap(data => {
        if (data && data.filterMenu) {
          if (data.filterMenu.state === 'always-visible') {
            return of(true)
          } else if (data.filterMenu.state !== 'hidden') {

          }
        }
        return combineLatest([
          this._exporters$.pipe(map(e => (e || []).length > 0)),
          this._commonFilterComponents$.pipe(map(cfc => cfc.length > 0)),
          this._hasFullSearch$
        ]).pipe(map(v => v.indexOf(false) === -1))
      })
    )
  }

  private _setDefaults(def: IDatatableDynamicDef): void {
    for (const col of def.columns) {
      if (!col.cellType) {
        col.cellType = 'string'
      }
    }

    if (def.options) {
      if (def.options.virtualization === undefined || def.options.virtualization === null) {
        def.options.virtualization = false
      }
    }
  }

}
