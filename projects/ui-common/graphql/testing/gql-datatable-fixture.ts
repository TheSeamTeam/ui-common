import { EventEmitter } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import { DataFilterState } from '@theseam/ui-common/data-filters'
import { SortEvent, SortItem, TheSeamPageInfo } from '@theseam/ui-common/datatable'

import { GqlDatatableAccessor } from '../models'

export class GqlDatatableFixture implements GqlDatatableAccessor {
  private _sorts: SortItem[] = []
  private _filterStatesSubject = new BehaviorSubject<DataFilterState[]>([])
  private _rows: any[] = []
  private _offset: number = 0
  private _rowHeight: number = 50
  private _bodyHeight: number = 500
  private _scrolledPosV: number = 0

  page: EventEmitter<TheSeamPageInfo> = new EventEmitter()
  sort: EventEmitter<SortEvent> = new EventEmitter<SortEvent>()
  get sorts(): SortItem[] { return this._sorts }
  set sorts(value: SortItem[]) { this._sorts = value }
  public filterStates: Observable<DataFilterState[]> = this._filterStatesSubject.asObservable()

  get ngxDatatable(): { offset: number; pageSize: number; limit?: number; count: number } {
    return {
      offset: this.getPage(),
      pageSize: this.getPageSize(),
      count: this._rows.length
    }
  }

  setSorts(v: SortItem[]): void {
    this._sorts = v
    this.sort.emit({ sorts: this._sorts })
  }

  setFilterStates(v: DataFilterState[]): void {
    this._filterStatesSubject.next(v)
  }

  getNumPages(): number {
    if (this._rows.length === 0) { return 1 }
    const t = this._rows.length / this.getPageSize()
    if (t <= 0) { return 1 }
    return t
  }

  _calcPage(): number {
    return Math.floor((this._scrolledPosV / this._rowHeight) / this.getPageSize())
  }

  _calcScrolledPosV(): number {
    return this._offset * this._rowHeight
  }

  getPage(): number {
    return this._offset
  }

  setPage(v: number): void {
    if (v === this.getPage()) {
      return
    }
    this._offset = v
    this._scrolledPosV = this._calcScrolledPosV()
    this.page.emit(this.ngxDatatable)
  }

  getPageSize(): number {
    return Math.floor(this._bodyHeight / this._rowHeight)
  }

  setRows(v: any[]): void {
    this._rows = v
  }

  setScrolledPosV(v: number): void {
    if (this._scrolledPosV === v) { return }
    const pageBefore = this.getPage()
    this._scrolledPosV = v
    this._offset = this._calcPage()
    if (this.getPage() !== pageBefore) {
      this.page.emit(this.ngxDatatable)
    }
  }
}
