import { BooleanInput, coerceArray } from '@angular/cdk/coercion'
import { AfterContentChecked, ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { merge, Subject, Subscription } from 'rxjs'

import { InputBoolean } from '@theseam/ui-common/core'

import { TheSeamTableColumnComponent } from '../table-column.component'

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
  cellTemplate?: TemplateRef<any>
  headerTemplate?: TemplateRef<any>
  cellClass?: string // | ((data: any) => string | any)
  headerClass?: string // | ((data: any) => string | any)
}

function mergeColumnsAndTplColumns(columns: (string | ITableColumn)[], tplColumns: TheSeamTableColumnComponent[]): ITableColumn[] {
  const newCols: ITableColumn[] = []

  for (const col of columns) {
    const newCol: ITableColumn = {
      ...((typeof col === 'string') ? {
          prop: col,
          name: col,
        } : col),
    }
    const tplCol = tplColumns.find(c => c.prop === newCol.prop)
    // newCol.cellTypeConfig = tplCol?.cellTypeConfig
    if (tplCol) {
      if (tplCol.name !== undefined && tplCol.name !== null) {
        newCol.name = tplCol.name ?? undefined
      }
      if (tplCol.cellTemplate !== undefined && tplCol.cellTemplate !== null) {
        newCol.cellTemplate = tplCol.cellTemplate ?? undefined
      }
      if (tplCol.headerTemplate !== undefined && tplCol.headerTemplate !== null) {
        newCol.headerTemplate = tplCol.headerTemplate ?? undefined
      }
      if (tplCol.cellClass !== undefined && tplCol.cellClass !== null) {
        newCol.cellClass = tplCol.cellClass ?? undefined
      }
      if (tplCol.headerClass !== undefined && tplCol.headerClass !== null) {
        newCol.headerClass = tplCol.headerClass ?? undefined
      }
    }

    newCols.push(newCol)
  }

  return newCols
}

@Component({
  selector: 'seam-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T = any> implements OnInit, OnChanges, AfterContentChecked {
  static ngAcceptInputType_hasHeader: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input()
  get columns() { return this._columns }
  set columns(value: (string | ITableColumn)[] | undefined | null) {
    this._columns = value
    // this._setColumns(value || [])
    const cols = mergeColumnsAndTplColumns(value || [], this._columnComponents?.toArray() ?? [])
    // this._setColumns(cols)
    this._pendingColumns = cols
  }
  private _columns: (string | ITableColumn)[] | undefined | null

  @Input()
  get rows(): T[] | undefined | null { return this._rows }
  set rows(value: T[] | undefined | null) {
    this._rows = value ? coerceArray(value) : []

    if (this._rows.length < 1) {
      this._displayedRows = [
        { _emptyDisplay: true } as any
      ]
    } else {
      this._displayedRows = this._rows
    }
  }
  private _rows: T[] | undefined | null = []

  get displayedRows() { return this._displayedRows }
  private _displayedRows: T[] & { _colSpan?: number } = []

  @Input() trackBy: TrackByFunction<T> | undefined | null

  @Input() size: 'sm' | 'md' | undefined | null

  @Input() @InputBoolean() hasHeader = true

  private _pendingColumns?: ITableColumn[]

  public displayedRecords?: ITableColumn[]
  public displayedColumns?: string[]

  @Output() readonly columnsChange = new EventEmitter<{ previous: ITableColumn[] | undefined, current: ITableColumn[] }>()
  @Output() readonly actionRefreshRequest = new EventEmitter<void>()

  @ContentChildren(TheSeamTableColumnComponent)
  set columnComponents(value: QueryList<TheSeamTableColumnComponent> | undefined) {
    // this._columnsManager.setTemplateColumns(translateTemplateColumns(value?.toArray() ?? []))
    this._columnComponents = value
    if (value?.toArray().length === 0) return
    const cols = mergeColumnsAndTplColumns(this._columns || [], value?.toArray() ?? [])
    // this._setColumns(cols)
    this._pendingColumns = cols

    if (this._columnComponentChange) this._columnComponentChange.unsubscribe()
    const obsArr = value?.toArray().map(c => c.columnChange$)
    if (obsArr && obsArr.length > 0) {
      this._columnComponentChange = merge(obsArr).subscribe(() => {
        const _cols = mergeColumnsAndTplColumns(this._columns || [], value?.toArray() ?? [])
        // this._setColumns(_cols)
        this._pendingColumns = _cols
      })
    }
  }
  private _columnComponents: QueryList<TheSeamTableColumnComponent> | undefined
  private _columnComponentChange = Subscription.EMPTY

  constructor(
    private readonly _sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this._updateColumns()
  }

  ngAfterContentChecked() {
    this._updateColumns()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columns) {
      this._updateColumns()
    }
  }

  private _updateColumns() {
    const pending = this._pendingColumns
    this._pendingColumns = undefined
    if (pending) {
      this._setColumns(pending)
    }
  }

  // TODO: Improve column handling, like datatable, to avoid excessive updates.
  private _setColumns(cols: (string | ITableColumn)[]) {
    const prev = this.displayedRecords
    const newCols: ITableColumn[] = []

    for (const col of cols) {
      if (typeof col === 'string') {
        const newCol: ITableColumn = {
          prop: col,
          name: col
        }
        newCols.push(newCol)
      } else {
        let name = col.name
        if (name === undefined || name === null) {
          name = col.prop
        }
        const newCol: ITableColumn = {
          ...col,
          prop: col.prop,
          name
        }
        newCols.push(newCol)
      }
    }

    for (const col of newCols) {
      const _col = col as any
      if (_col && _col.cellTypeConfig && _col.cellTypeConfig.styles) {
        _col.cellTypeConfig.styles = this._sanitizer.bypassSecurityTrustStyle(_col.cellTypeConfig.styles)
      }
    }

    this.displayedRecords = newCols
    this.displayedColumns = newCols.map(c => c.prop)
    this.columnsChange.emit({ previous: prev, current: newCols })
  }

  public triggerActionRefreshRequest() {
    this.actionRefreshRequest.emit(undefined)
  }

  _trackByRecords(r: any) {
    return r.prop + r.name
  }

}
