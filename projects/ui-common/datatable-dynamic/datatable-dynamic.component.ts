import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { IDataExporter } from '@theseam/ui-common/data-exporter'

import {
  DatatableDynamicDef,
  DynamicDatatableOptions
} from './datatable-dynamic-def'
import { DynamicDatatableDefService } from './dynamic-datatable-def.service'
import { DynamicDatatableRowActionsService } from './dynamic-datatable-row-actions.service'
import { DynamicDatatableFilterMenuItem } from './models/dynamic-datatable-filter-menu-item'
import { DynamicDatatableMenuBar } from './models/dynamic-datatable-menu-bar'

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
export class DatatableDynamicComponent {

  /** The `DatatableDynamicDef` that defines the datatable. */
  @Input() set def(value: DatatableDynamicDef | undefined | null) {
    this._dynamicDef.setDef(value || undefined)
  }

  /**
   * Observes whether the datatable has a def.
   * @ignore
   */
  _hasDef$: Observable<boolean>

  /**
   * Observes whether the datatable has a menu bar.
   */
  menuBar$: Observable<DynamicDatatableMenuBar | undefined>

  /**
   * The available exporters.
   * @ignore
   */
  _exporters$: Observable<IDataExporter[]>

  /**
   * The 'common' type filter menu items.
   * @ignore
   */
  _commonFilterMenuItems$: Observable<DynamicDatatableFilterMenuItem[]>

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
  _options$: Observable<DynamicDatatableOptions | undefined>

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
    private readonly _dynamicDef: DynamicDatatableDefService
  ) {
    this._hasDef$ = this._dynamicDef.def$.pipe(map(def => !!def))

    this.menuBar$ = this._dynamicDef.menuBar$

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
      map(def => def ? def.rows : []),
      // tap(v => console.log('_tmp_rows$', v))
    )
  }

}
