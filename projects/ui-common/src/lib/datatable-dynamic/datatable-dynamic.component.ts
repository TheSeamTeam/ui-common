import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { notNullOrUndefined } from '../utils/index'

import { IDatatableDynamicDef } from './datatable-dynamic-def'

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
  _hasFilterMenu$: Observable<boolean>

  constructor(
    @Inject(THESEAM_DATA_EXPORTER) public _dataExporters: IDataExporter[]
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

    this._hasFilterMenu$ = this.data$.pipe(
      switchMap(data => {
        if (data && data.filterMenu) {
          if (data.filterMenu.state === 'always-visible') {
            return of(true)
          } else if (data.filterMenu.state !== 'hidden') {

          }
        }
        return this._exporters$.pipe(map(e => (e || []).length > 0))
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
