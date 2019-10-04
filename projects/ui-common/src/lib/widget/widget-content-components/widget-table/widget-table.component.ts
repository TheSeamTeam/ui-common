import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

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

// NOTE: I am considering if it will be worth it to implement a seam-table
// component wrapping cdk-table that will use a similar, but simplified, api
// that is compatible with our seam-datatable component. If we need features
// more advanced than just a simple html table, then I think that is the way to
// go. This component will wrap it for extra functionality if so. For now this
// will just be a simple table to make our widget tables look the same.

export interface ITableColumn {
  prop: string
  name?: string
}

@Component({
  selector: 'seam-widget-table',
  templateUrl: './widget-table.component.html',
  styleUrls: ['./widget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetTableComponent<T> implements OnInit {

  @Input()
  get columns() { return this._columns }
  set columns(value: (string | ITableColumn)[]) {
    this._columns = value
    this._setColumns(value)
  }
  private _columns: (string | ITableColumn)[]

  @Input() rows: T[]

  @Input() trackBy: TrackByFunction<T>

  public displayedRecords: ITableColumn[]
  public displayedColumns: string[]

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
          prop: col.prop,
          name: col.name || col.prop
        }
        newCols.push(newCol)
      }
    }

    this.displayedRecords = newCols
    this.displayedColumns = newCols.map(c => c.prop)
  }

}
