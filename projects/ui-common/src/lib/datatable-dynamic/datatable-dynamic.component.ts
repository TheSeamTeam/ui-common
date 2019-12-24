import { ComponentType } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core'
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs'
import { concatMap, map, switchMap, take, tap, toArray } from 'rxjs/operators'

// import jexl from 'jexl'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { THESEAM_DATA_FILTER_DEF } from '../data-filters/data-filter-def'
import { IDataFilter } from '../data-filters/index'
import { DynamicValueHelperService } from '../dynamic/index'
import { notNullOrUndefined } from '../utils/index'

import { IDatatableDynamicDef, IDynamicDatatableRow, IDynamicDatatableRowActionDef } from './datatable-dynamic-def'
import { DynamicDatatableDefService } from './dynamic-datatable-def.service'
import { dynamicDatatableDefHasFullSearch, setDynamicDatatableDefDefaults } from './utils/index'

// export function jexlObservable<R = any>(expression: string, context?: any): Observable<R> {
//   return from(jexl.eval(expression, context) as Promise<R>)
// }

export interface IFilterComponentRecord {
  component: ComponentType<IDataFilter>
  options?: any
  order?: number
}

export interface IActionRowExprContext {
  row: IDynamicDatatableRow
}

@Component({
  selector: 'seam-datatable-dynamic',
  templateUrl: './datatable-dynamic.component.html',
  styleUrls: ['./datatable-dynamic.component.scss'],
  providers: [ DynamicDatatableDefService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicComponent implements OnInit {

  @Input()
  set data(value: IDatatableDynamicDef | undefined | null) {
    if (value) { setDynamicDatatableDefDefaults(value) }
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
    @Inject(THESEAM_DATA_FILTER_DEF) public _dataFilters: { name: string, component: ComponentType<IDataFilter> }[],
    private _valueHelper: DynamicValueHelperService,
    private _dynamicDef: DynamicDatatableDefService
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

    this._hasFullSearch$ = this.data$.pipe(map(data => !!data && dynamicDatatableDefHasFullSearch(data)))

    this._hasFilterMenu$ = this.data$.pipe(
      switchMap(data => {
        if (data && data.filterMenu) {
          if (data.filterMenu.state === 'always-visible') {
            return of(true)
          } else if (data.filterMenu.state === 'hidden') {
            return of(false)
          }
        }

        return combineLatest([
          this._exporters$.pipe(map(e => (e || []).length > 0)),
          this._commonFilterComponents$.pipe(map(cfc => cfc.length > 0)),
          this._hasFullSearch$
        ]).pipe(map(v => v.indexOf(true) !== -1))
      })
    )
  }

  public _rowActions(row: IDynamicDatatableRow, rowActions: IDynamicDatatableRowActionDef[]): Observable<IDynamicDatatableRowActionDef[]> {
    // TODO: Fix async eval.

    if (!rowActions) { return of([]) }

    return from(rowActions).pipe(
      // concatMap(rowAction => rowAction.isHiddenExpr
      //   ? jexlObservable(rowAction.isHiddenExpr).pipe(take(1), map(v => v ? rowAction : undefined))
      //   : of(rowAction)
      // ),

      map(rowAction => {
        if (rowAction.hidden) {
          const context = this._getActionRowContext(row, rowAction)
          const isHidden = this._valueHelper.evalSync(rowAction.hidden, context)
          return isHidden ? undefined : rowAction
        }
        return rowAction
      }),

      toArray(),
      map(v => v.filter(notNullOrUndefined)),
      // tap(r => console.log('result', r)),
    )
  }

  private _getActionRowContext(row: IDynamicDatatableRow, rowActionDef: IDynamicDatatableRowActionDef): IActionRowExprContext {
    return {
      row
    }
  }

}
