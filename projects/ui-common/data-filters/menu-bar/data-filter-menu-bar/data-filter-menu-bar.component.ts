import { Component, ContentChildren, EventEmitter, forwardRef, QueryList } from '@angular/core'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { DataFilterDirective } from '../../directives/data-filter.directive'
import { THESEAM_DATA_FILTER_CONTAINER } from '../../data-filter-container'
import { DataFilter } from '../../data-filter'

export const _THESEAM_DATA_FILTER_CONTAINER: any = {
  provide: THESEAM_DATA_FILTER_CONTAINER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterMenuBarComponent)
}

@Component({
  selector: 'seam-data-filter-menu-bar',
  templateUrl: './data-filter-menu-bar.component.html',
  styleUrls: ['./data-filter-menu-bar.component.scss'],
  providers: [ _THESEAM_DATA_FILTER_CONTAINER ]
})
export class DataFilterMenuBarComponent {

  @ContentChildren(DataFilterDirective)
  get filterDirectives(): QueryList<DataFilterDirective> | undefined {
    return this._filterDirectives
  }
  set filterDirectives(value: QueryList<DataFilterDirective> | undefined) {
    this._filterDirectives = value
    this.filtersChanged.emit(this.filters())
  }
  private _filterDirectives: QueryList<DataFilterDirective> | undefined

  private _filtersArr: DataFilter[] = []

  public readonly filtersChanged = new EventEmitter<DataFilter[]>()

  public filters(): DataFilter[] {
    const fDirectives = this._filterDirectives
      ? this._filterDirectives.map(f => f.filter).filter(notNullOrUndefined)
      : []

    const fArr = this._filtersArr
    .filter(f => fDirectives.findIndex(fd => fd.uid === f.uid) === -1)
    return [ ...fArr, ...fDirectives ]
  }

  public addFilter(dataFilter: DataFilter): void {
    this._filtersArr.push(dataFilter)
    this.filtersChanged.emit(this.filters())
  }

  public removeFilter(dataFilter: DataFilter): void {
    this._filtersArr = this._filtersArr.filter(f => f !== dataFilter)
    this.filtersChanged.emit(this.filters())
  }

}
