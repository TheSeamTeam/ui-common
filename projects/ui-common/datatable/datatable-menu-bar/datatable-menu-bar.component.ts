import { Component, ContentChildren, EventEmitter, forwardRef, QueryList } from '@angular/core'

import { IDataFilter, THESEAM_DATA_FILTER_CONTAINER } from '@theseam/ui-common/data-filters'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { DatatableFilterDirective } from '../directives/datatable-filter.directive'

export const _THESEAM_DATA_FILTER_CONTAINER: any = {
  provide: THESEAM_DATA_FILTER_CONTAINER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DatatableMenuBarComponent)
}

@Component({
  selector: 'seam-datatable-menu-bar',
  templateUrl: './datatable-menu-bar.component.html',
  styleUrls: ['./datatable-menu-bar.component.scss'],
  providers: [ _THESEAM_DATA_FILTER_CONTAINER ]
})
export class DatatableMenuBarComponent {

  @ContentChildren(DatatableFilterDirective)
  get filterDirectives(): QueryList<DatatableFilterDirective> | undefined {
    return this._filterDirectives
  }
  set filterDirectives(value: QueryList<DatatableFilterDirective> | undefined) {
    this._filterDirectives = value
    this.filtersChanged.emit(this.filters())
  }
  private _filterDirectives: QueryList<DatatableFilterDirective> | undefined

  private _filtersArr: IDataFilter[] = []

  public readonly filtersChanged = new EventEmitter<IDataFilter[]>()

  public filters(): IDataFilter[] {
    const fDirectives = this._filterDirectives
      ? this._filterDirectives.map(f => f.filter).filter(notNullOrUndefined)
      : []

    const fArr = this._filtersArr
    .filter(f => fDirectives.findIndex(fd => fd.uid === f.uid) === -1)
    return [ ...fArr, ...fDirectives ]
  }

  public addFilter(dataFilter: IDataFilter): void {
    this._filtersArr.push(dataFilter)
    this.filtersChanged.emit(this.filters())
  }

  public removeFilter(dataFilter: IDataFilter): void {
    this._filtersArr = this._filtersArr.filter(f => f !== dataFilter)
    this.filtersChanged.emit(this.filters())
  }

}
