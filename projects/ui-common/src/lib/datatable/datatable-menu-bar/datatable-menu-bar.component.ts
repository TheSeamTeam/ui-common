import { AfterViewInit, Component, ContentChildren, EventEmitter, OnInit, QueryList } from '@angular/core'

import { IDataFilter } from '../../data-filters'

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
  _filterDirectives: QueryList<DatatableFilterDirective>

  filtersChanged = new EventEmitter<IDataFilter[]>()

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    // console.log('_filterDirectives', this._filterDirectives, this.filters())
  }

  filters(): IDataFilter[] {
    return this._filterDirectives
      ? this._filterDirectives.map(f => f.filter).filter(f => f !== undefined)
      : []
  }

}
