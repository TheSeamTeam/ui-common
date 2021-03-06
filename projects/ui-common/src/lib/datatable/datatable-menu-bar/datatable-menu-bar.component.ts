import { AfterViewInit, Component, ContentChildren, EventEmitter, OnInit, QueryList } from '@angular/core'

import { IDataFilter } from '@lib/ui-common/data-filters'

import { DatatableFilterDirective } from '../directives/datatable-filter.directive'

@Component({
  selector: 'seam-datatable-menu-bar',
  templateUrl: './datatable-menu-bar.component.html',
  styleUrls: ['./datatable-menu-bar.component.scss']
})
export class DatatableMenuBarComponent implements OnInit, AfterViewInit {

  @ContentChildren(DatatableFilterDirective)
  get filterDirectives(): QueryList<DatatableFilterDirective> {
    return this._filterDirectives
  }
  set filterDirectives(value: QueryList<DatatableFilterDirective>) {
    this._filterDirectives = value
    this.filtersChanged.emit(this.filters())
  }
  private _filterDirectives: QueryList<DatatableFilterDirective>

  private _filtersArr: IDataFilter[] = []

  public readonly filtersChanged = new EventEmitter<IDataFilter[]>()

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    // console.log('_filterDirectives', this._filterDirectives, this.filters())
  }

  public filters(): IDataFilter[] {
    const fDirectives = this._filterDirectives
      ? this._filterDirectives.map(f => f.filter).filter(f => f !== undefined)
      : []

    const fArr = this._filtersArr.filter(f => fDirectives.findIndex(fd => fd.uid === f.uid) === -1)
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
