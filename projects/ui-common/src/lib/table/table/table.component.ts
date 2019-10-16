import { coerceArray } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

/**
 * An optional function passed into the `NgForOf` directive that defines how to track
 * changes for items in an iterable.
 * The function takes the iteration index and item ID.
 * When supplied, Angular tracks changes by the return value of the function.
 *
 * NOTE: Can't import the type from'@angular/core', because of a bug in angular-cli's
 * build that can't find exported types that only exist at compile time if there
 * are exports that exist at runtime in the same file.
 */
export type TrackByFunction<T> = (index: number, item: T) => any

export interface ITableColumn {
  prop: string
  name?: string
}

@Component({
  selector: 'seam-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T = any> implements OnInit {

  @Input()
  get columns() { return this._columns }
  set columns(value: (string | ITableColumn)[]) {
    this._columns = value
    this._setColumns(value)
  }
  private _columns: (string | ITableColumn)[]

  @Input()
  get rows(): T[] { return this._rows }
  set rows(value: T[]) {
    this._rows = !!value ? coerceArray(value) : []

    if (this._rows.length < 1) {
      this._displayedRows = [
        { _emptyDisplay: true } as any
      ]
    } else {
      this._displayedRows = this._rows
    }
  }
  private _rows: T[] = []

  get displayedRows() { return this._displayedRows }
  private _displayedRows: T[] & { _colSpan?: number } = []

  @Input() trackBy: TrackByFunction<T>

  @Input() size: 'sm' | 'md' | undefined | null

  @Input() hasHeader = true

  public displayedRecords: ITableColumn[]
  public displayedColumns: string[]

  @Output() readonly actionRefreshRequest = new EventEmitter<void>()

  constructor() { }

  ngOnInit() { }

  private _setColumns(cols: (string | ITableColumn)[]) {
    const newCols: ITableColumn[] = []

    for (const col of cols) {
      if (typeof col === 'string') {
        const newCol: ITableColumn = {
          prop: col,
          name: col
        }
        newCols.push(newCol)
      } else {
        const newCol: ITableColumn = {
          ...col,
          prop: col.prop,
          name: col.name || col.prop
        }
        newCols.push(newCol)
      }
    }

    this.displayedRecords = newCols
    this.displayedColumns = newCols.map(c => c.prop)
  }

  public triggerActionRefreshRequest() {
    this.actionRefreshRequest.emit(undefined)
  }

}
