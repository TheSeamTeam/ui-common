import { ComponentType } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core'
import { from, Observable, of } from 'rxjs'
import { map, switchMap, toArray } from 'rxjs/operators'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { THESEAM_DATA_FILTER_DEF } from '../data-filters/data-filter-def'
import { IDataFilter } from '../data-filters/index'
import { DynamicValueHelperService } from '../dynamic/index'
import { notNullOrUndefined } from '../utils/index'

import {
  IDatatableDynamicDef,
  IDynamicDatatableOptions,
  IDynamicDatatableRow
} from './datatable-dynamic-def'
import { DynamicDatatableDefService } from './dynamic-datatable-def.service'
import { DynamicDatatableRowActionsService } from './dynamic-datatable-row-actions.service'
import { IDynamicDatatableFilterMenuItem } from './models/dynamic-datatable-filter-menu-item'
import { IDynamicDatatableRowAction } from './models/dynamic-datatable-row-action'

/**
 * # EXPERIMENTAL
 *
 * NOTE: This component is still experimental. When stable all standard
 * datatables must use this component, unless there is a good reason not to, in
 * our apps.
 *
 * ----------------------------------------------------------------------------
 *
 * Datatable that is built from a json definition.
 *
 * All standard datatables in our apps must use this component, unless there is
 * a good reason not to. If a standard datatable does not use this component
 * then an explaination comment needs to be clearly provided in the code to
 * avoid getting migrated to this component.
 *
 * A few reasons this component should to be used:
 * - We can, more easily, control what a datatable in our app does by requiring
 *   the definition follow a json schema, instead of having full scripting
 *   access available to the developer.
 *   + By using json we can maintain the tables from any external app/language
 *     that can produce a json string.
 *   + More scripting access often leads to different hacks across the tables
 *     that should have just been supported by this component if it is a feature
 *     a datatable should be able to do in an app of ours.
 * - We can allow any of our tables to be configured by the server.
 *   + By supporting configuration on the server we can change the tables
 *     without a new build and do things like allowing non-developers/clients to
 *     maintain the tables functionality.
 */
@Component({
  selector: 'seam-datatable-dynamic',
  templateUrl: './datatable-dynamic.component.html',
  styleUrls: ['./datatable-dynamic.component.scss'],
  providers: [
    DynamicDatatableDefService,
    DynamicDatatableRowActionsService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicComponent implements OnInit {

  /** The `IDatatableDynamicDef` that defines the datatable. */
  @Input() set def(value: IDatatableDynamicDef | undefined | null) {
    this._dynamicDef.setDef(value || undefined)
  }

  /**
   * Observes whether the datatable has a def.
   * @ignore
   */
  _hasDef$: Observable<boolean>

  /**
   * The available exporters.
   * @ignore
   */
  _exporters$: Observable<IDataExporter[]>

  /**
   * The 'common' type filter menu items.
   * @ignore
   */
  _commonFilterMenuItems$: Observable<IDynamicDatatableFilterMenuItem[]>

  /**
   * Observes whether the datatable has a 'full-search' menu item.
   * @ignore
   */
  _hasFullSearch$: Observable<boolean>

  /**
   * Observes whether the datatable has a filter menu.
   * @ignore
   */
  _hasFilterMenu$: Observable<boolean>

  /**
   * Observes datatable options.
   * @ignore
   */
  _options$: Observable<IDynamicDatatableOptions | undefined>

  /**
   * TODO: Implement def columns parser.
   * @ignore
   */
  _tmp_columns$: Observable<any>

  /**
   * TODO: Implement def rows parser.
   * @ignore
   */
  _tmp_rows$: Observable<any>

  constructor(
    @Inject(THESEAM_DATA_EXPORTER) public _dataExporters: IDataExporter[],
    @Inject(THESEAM_DATA_FILTER_DEF) public _dataFilters: { name: string, component: ComponentType<IDataFilter> }[],
    private _valueHelper: DynamicValueHelperService,
    private _dynamicDef: DynamicDatatableDefService,
    private _dynamicRowActions: DynamicDatatableRowActionsService
  ) {
    this._hasDef$ = this._dynamicDef.def$.pipe(map(def => !!def))

    this._exporters$ = this._dynamicDef.exporters$

    this._commonFilterMenuItems$ = this._dynamicDef.filterMenuItems$
      .pipe(map(f => f.filter(_f => _f.type === 'common')))

    this._hasFullSearch$ = this._dynamicDef.filterMenuItems$
      .pipe(map(f => !!f.find(_f => _f.type === 'full-search')))

    this._hasFilterMenu$ = this._dynamicDef.hasFilterMenu$

    this._options$ = this._dynamicDef.options$

    this._tmp_columns$ = this._dynamicDef.def$.pipe(
      map(def => def ? def.columns : [])
    )

    this._tmp_rows$ = this._dynamicDef.def$.pipe(
      map(def => def ? def.rows : [])
    )
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  _rowActions(row: IDynamicDatatableRow): Observable<IDynamicDatatableRowAction[]> {
    return this._dynamicRowActions.rowActions(row)
  }

}
