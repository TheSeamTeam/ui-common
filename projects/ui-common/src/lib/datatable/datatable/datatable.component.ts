import { animate, style, transition, trigger } from '@angular/animations'
import {
  AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, ContentChildren,
  ElementRef, EventEmitter, forwardRef, InjectionToken, Input, KeyValueDiffer, KeyValueDiffers, OnDestroy, OnInit, Output, QueryList, ViewChild
} from '@angular/core'
import { BehaviorSubject, combineLatest, merge, Observable, of, Subscription } from 'rxjs'
import { map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'

import { faChevronDown, faChevronRight, faEllipsisH, faSpinner } from '@fortawesome/free-solid-svg-icons'
import {
  camelCase,
  ColumnChangesService,
  ColumnMode,
  ContextmenuType,
  DatatableComponent as NgxDatatableComponent,
  DatatableRowDetailDirective,
  deCamelCase,
  getterForProp,
  isNullOrUndefined,
  SelectionType,
  SortType,
  TableColumn,
  TreeStatus
} from '@marklb/ngx-datatable'

import { composeDataFilters, IDataFilter } from '../../data-filters/index'
import { IElementResizedEvent } from '../../shared/index'

import { untilDestroyed } from 'ngx-take-until-destroy'
import { DatatableActionMenuComponent } from '../datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableMenuBarComponent } from '../datatable-menu-bar/datatable-menu-bar.component'
import { TheSeamDatatableRowDetailDirective } from '../datatable-row-detail/datatable-row-detail.directive'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { ITheSeamDatatableColumn } from '../models/table-column'
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'


/**
 * NOTE: This is still being worked on. I am trying to figure out this model
 * because `ngx-datatable` just uses an untyped object and sets properties in
 * multiple places.
 */
export interface ICellContext {
  allRowsSelected: false

  selectFn: () => any
  sortDir?: 'asc' | 'desc'
  sortFn: () => any

  expanded?: boolean

  onCheckboxChangeFn?: any
  activateFn?: any
  row?: any
  group?: any
  value?: any
  column?: ITheSeamDatatableColumn
  rowHeight?: number
  isSelected?: boolean
  rowIndex?: number
  treeStatus?: TreeStatus
  onTreeAction?: any
}

export interface IDatatableAccessor {
  columns: ITheSeamDatatableColumn[]
  rows$: Observable<any[]>
}

/**
 * Intended for internal classes declared by the `TheSeamDatatableModule`.
 */
export const THESEAM_DATATABLE = new InjectionToken<IDataFilter>('LibDatatable')

export const _THESEAM_DATATABLE: any = {
  provide: THESEAM_DATATABLE,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DatatableComponent)
}

@Component({
  selector: 'seam-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-20%)', opacity: '0' }),
        animate('250ms', style({ transform: 'translateY(0)', opacity: '1' })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: '1' }),
        animate('250ms', style({ transform: 'translateY(-20%)', opacity: '0' })),
      ])
    ])
  ],
  providers: [ _THESEAM_DATATABLE, DatatableColumnChangesService ]
})
export class DatatableComponent implements OnInit, OnDestroy, AfterContentInit {

  faEllipsisH = faEllipsisH
  faChevronDown = faChevronDown
  faChevronRight = faChevronRight
  faSpinner = faSpinner

  private _filtersSubject = new BehaviorSubject<IDataFilter[]>([])


  @Input() targetMarkerTemplate: any

  @Input()
  get columns(): ITheSeamDatatableColumn[] { return this._columns.value }
  set columns(value: ITheSeamDatatableColumn[]) {
    console.log('columns')
    // if (value) {
    //   // Need to call `setColumnDefaults` before ngx-datatable gets it because
    //   // of how this wrapper is implemented.

    //   // NOTE: Custom `this._setColumnDefaults` used because the
    //   // `setColumnDefaults` imported from `ngx-datatable` is causing a circular
    //   // dependency.
    //   //
    //   // TODO: Consider implementing differently to avoid maintaining defaults
    //   // or having to remove the properties set by `setColumnDefaults` function
    //   // in the `ngx-datatable` utilities that shouldn't be set yet.
    //   this._setColumnDefaults(value)
    // }
    this._columns.next(value)
  }
  private _columns = new BehaviorSubject<ITheSeamDatatableColumn[]>([])

  @Input()
  get rows(): any[] { return this._rows.value }
  set rows(value: any[]) { this._rows.next(value || []) }
  private _rows = new BehaviorSubject<any[]>([])

  public rows$: Observable<any[]>

  @Input() columnMode: ColumnMode = ColumnMode.force

  @Input() groupRowsBy: string
  @Input() groupedRows: any[]

  @Input() selected: any[] = []

  @Input() externalPaging = false
  @Input() externalSorting = false

  @Input() limit: number | undefined
  @Input() count = 0
  @Input() offset = 0

  @Input() loadingIndicator = false

  @Input() selectionType: SelectionType

  @Input() reorderable = true
  @Input() swapColumns = true
  @Input() sortType: SortType = SortType.single
  @Input() sorts: any[] = []

  @Input() cssClasses: any = {
    sortAscending: 'datatable-icon-up',
    sortDescending: 'datatable-icon-down',
    pagerLeftArrow: 'datatable-icon-left',
    pagerRightArrow: 'datatable-icon-right',
    pagerPrevious: 'datatable-icon-prev',
    pagerNext: 'datatable-icon-skip'
  }

  @Input() messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: 'No data to display',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'selected'
  }

  @Input() rowIdentity: (x: any) => any = ((x: any) => x)

  @Input() rowClass: any

  @Input() selectCheck: any
  @Input() displayCheck: (row: any, column?: any, value?: any) => boolean

  @Input() groupExpansionDefault = false

  @Input() trackByProp: string

  @Input() selectAllRowsOnPage = false

  @Input() treeFromRelation: string
  @Input() treeToRelation: string
  @Input() summaryRow = false
  @Input() summaryHeight = 30
  @Input() summaryPosition = 'top'

  @Input() virtualization = true

  @Input() headerHeight = 50
  @Input() rowHeight = 50
  @Input() footerHeight = 40

  @Input() scrollbarV = true
  @Input() scrollbarH = true

  @Output() scroll = new EventEmitter<any>()
  @Output() activate = new EventEmitter<any>()
  @Output() select = new EventEmitter<any>()
  @Output() sort = new EventEmitter<any>()
  @Output() page = new EventEmitter<any>()
  @Output() reorder = new EventEmitter<any>()
  @Output() resize = new EventEmitter<any>()
  @Output() tableContextmenu = new EventEmitter<{ event: MouseEvent, type: ContextmenuType, content: any }>(false)
  @Output() treeAction = new EventEmitter<any>()

  @Output() readonly actionRefreshRequest = new EventEmitter<void>()

  @ContentChildren(DatatableColumnComponent) columnComponents: QueryList<DatatableColumnComponent>

  @ContentChild(DatatableActionMenuComponent, { static: true }) actionMenu: DatatableActionMenuComponent
  @ContentChild(DatatableRowActionItemDirective, { static: true }) rowActionItem: DatatableRowActionItemDirective
  @ContentChild(TheSeamDatatableRowDetailDirective, { static: true }) rowDetail: TheSeamDatatableRowDetailDirective

  @ContentChild(DatatableMenuBarComponent, { static: false })
  get menuBarComponent(): DatatableMenuBarComponent { return this._menuBarComponent }
  set menuBarComponent(value: DatatableMenuBarComponent) {
    this._menuBarComponent = value

    if (this._menuBarSub) { this._menuBarSub.unsubscribe() }

    if (value) {
      this._setMenuBarFilters(value.filters())

      this._menuBarSub = this._menuBarComponent.filtersChanged
        .subscribe(v => { this._setMenuBarFilters(value.filters()) })
    }
  }
  private _menuBarComponent: DatatableMenuBarComponent
  private _menuBarSub: Subscription

  @ViewChild(NgxDatatableComponent, { static: false }) ngxDatatable: NgxDatatableComponent
  @ViewChild(NgxDatatableComponent, { read: ElementRef, static: false }) ngxDatatableElement: ElementRef
  @ViewChild(DatatableRowDetailDirective, { static: false }) ngxRowDetail: DatatableRowDetailDirective

  public columnComponents$: Observable<DatatableColumnComponent[]>
  public columns$: Observable<ITheSeamDatatableColumn[]>
  private _prevColumns: ITheSeamDatatableColumn[] = []
  private _colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> } = {}
  private _colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> } = {}

  constructor(
    // private _columnChangesService: ColumnChangesService,
    private _columnChangesService: DatatableColumnChangesService,
    private _differs: KeyValueDiffers
  ) {
    this.rows$ = this._filtersSubject.asObservable()
      .pipe(switchMap(filters => this._rows.asObservable()
        .pipe(composeDataFilters(filters))
      ))
      .pipe(tap(v => {
        console.log('rows', v, this._prevColumns)
      }))

    const _w: any = window
    _w._dt = this
  }

  ngOnInit() {
    if (this.rowDetail) {
      this.rowDetail._toggle.pipe(
        untilDestroyed(this)
      ).subscribe(event => {
        if (this.ngxRowDetail) {
          this.ngxRowDetail.toggle.emit(event)
        }
      })
    }
  }

  ngOnDestroy() { }

  ngAfterContentInit() {
    // console.log('ngAfterContentInit')
    // this.columnComponents$ = merge(
    //   this._columnChangesService.columnInputChanges$.pipe(
    //     map(() => this.columnComponents),
    //     startWith(this.columnComponents)
    //   ),
    //   this.columnComponents.changes.pipe(
    //     startWith(this.columnComponents)
    //   )
    // )
    this.columnComponents$ = this._columnChangesService.columnInputChanges$.pipe(
      map(() => this.columnComponents.toArray()),
      startWith(this.columnComponents.toArray())
    )
      .pipe(
        tap(v => console.log('columnComponents$', v)),
        shareReplay({ bufferSize: 1, refCount: true })
      )

    this.columns$ =
      combineLatest([
        this.columnComponents$, // .pipe(tap(v => console.log('columnComponents$'))),
        this._columns // .pipe(tap(v => console.log('_columns')))
      ]).pipe(
        tap(v => console.log('~v', v)),
        // map(v => this._mergeTplAndInputColumns(v[0], v[1])),
        // tap(v => console.log('~merged', v)),
        // tap(v => this._setColumnDefaults(v)),
        // tap(v => console.log('~defaults', v)),
        // // tap(v => v.forEach(c => c.canAutoResize = false)),
        // tap(v => {
        //   console.log('Diffs')
        //   const cols: ITheSeamDatatableColumn[] = []
        //   for (const col of v) {
        //     const prev = (this._prevColumns || []).find(c => c.prop === col.prop) || {}

        //     if (prev) {
        //       const differ: KeyValueDiffer<any, any> = this._differs.find({}).create()
        //       differ.diff(prev)
        //       const diff = differ.diff(col)
        //       console.log('\tdiff', diff)
        //       if (diff) {
        //         // diff.forEachItem(r => {
        //         //   console.log(r)
        //         // })
        //         const _col: ITheSeamDatatableColumn = { ...prev }

        //         diff.forEachAddedItem(r => {
        //           console.log('added', r)
        //           _col[r.key] = r.currentValue
        //         })

        //         diff.forEachChangedItem(r => {
        //           console.log('changed', r)
        //           _col[r.key] = r.currentValue
        //         })

        //         diff.forEachRemovedItem(r => {
        //           console.log('removed', r)
        //           delete _col[r.key]
        //         })

        //         cols.push(_col)
        //       } else {
        //         cols.push(prev)
        //       }
        //     } else {
        //       cols.push({ ...col })
        //     }
        //   }
        //   this._prevColumns = cols
        // }),

        map(v => this._getMergedTplAndInpColumns(v[0], v[1])),

        tap(v => console.log('~withPrev', v)),
      )
      // .subscribe()
  }

  private _mergeTplAndInputColumns(
    tplCols: DatatableColumnComponent[],
    inpCols: ITheSeamDatatableColumn[]
  ) {
    const cols: ITheSeamDatatableColumn[] = []

    for (const col of inpCols) {
      const tplCol = tplCols.find(t => t.prop === col.prop)
      const c: ITheSeamDatatableColumn = {
        ...col,
        ...tplCol
      }
      cols.push(c)
    }

    return cols
  }

  private _getMergedTplAndInpColumns(
    tplCols: DatatableColumnComponent[],
    inpCols: ITheSeamDatatableColumn[]
  ): ITheSeamDatatableColumn[] {
    const cols: ITheSeamDatatableColumn[] = []

    for (const col of inpCols) {
      const tplCol = tplCols.find(t => t.prop === col.prop)

      // const prev = (this._prevColumns || []).find(c => c.prop === col.prop)
      const dtColumns = (this.ngxDatatable && this.ngxDatatable._internalColumns) || []
      const prev = dtColumns.find(c => c.prop === col.prop)

      const inpColDiff = this._getColDiff(col)
      // console.log('inpColDiff', inpColDiff)
      // if (inpColDiff) {
      //   inpColDiff.forEachItem(r => console.log(r))
      //   inpColDiff.forEachChangedItem(r => console.log('changed', r))
      // }
      const _inpCol = inpColDiff ? {} : this._hasPrevColDiff(col) ? {} : col
      if (inpColDiff) {
        inpColDiff.forEachRemovedItem(r => {
          if (prev && prev.hasOwnProperty(r.key)) {
            delete prev[r.key]
          }
        })
        inpColDiff.forEachAddedItem(r => _inpCol[r.key] = r.currentValue)
        inpColDiff.forEachChangedItem(r => _inpCol[r.key] = r.currentValue)
      }

      let _tplCol: ITheSeamDatatableColumn = {}
      if (tplCol) {
        const tplColDiff = tplCol ? this._getColDiff(tplCol, true) : undefined
        _tplCol = tplColDiff ? {} : this._hasPrevColDiff(col, true) ? {} : tplCol
        if (tplColDiff) {
          tplColDiff.forEachRemovedItem(r => {
            if (prev && prev.hasOwnProperty(r.key)) {
              delete prev[r.key]
            }
          })
          tplColDiff.forEachAddedItem(r => _tplCol[r.key] = r.currentValue)
          tplColDiff.forEachChangedItem(r => _tplCol[r.key] = r.currentValue)
        }
      }

      // console.log(col.prop, prev, _inpCol, _tplCol)

      const _col: ITheSeamDatatableColumn = {
        ...(prev || {}),
        ..._inpCol,
        ..._tplCol
      }
      // console.log('result', { ..._col })
      cols.push(_col)
    }

    this._setColumnDefaults(cols)

    this._prevColumns = cols
    return cols
  }

  private _hasPrevColDiff(col: ITheSeamDatatableColumn, isTpl: boolean = false): boolean {
    if (!col || !col.prop) {
      return false
    }

    const differsMap = isTpl ? this._colDiffersTpl : this._colDiffersInp

    return !!differsMap
  }

  private _getColDiff(col: ITheSeamDatatableColumn, isTpl: boolean = false) {
    if (!col || !col.prop) {
      return
    }

    const differsMap = isTpl ? this._colDiffersTpl : this._colDiffersInp

    if (!differsMap[col.prop]) {
      differsMap[col.prop] = this._differs.find({}).create()
    }

    const differ = differsMap[col.prop]

    const diff = differ.diff(col)
    return diff
  }

  private _setMenuBarFilters(filters: IDataFilter[]) {
    this._filtersSubject.next(filters || [])
  }

  public getColumnComponent(propName: string): DatatableColumnComponent | null {
    if (!this.columnComponents || this.columnComponents.length === 0) {
      return null
    }

    const tpl = this.columnComponents.find(t => t.prop === propName)
    if (tpl) {
      return tpl
    }

    return null
  }

  _columnData(col: any): { col: any, comp: DatatableColumnComponent | null } {
    // console.log('_columnData', col)
    const comp = this.getColumnComponent(col.prop)
    return { col, comp }
  }

  _getRowExpanded(row) {
    if (this.ngxDatatable && this.ngxDatatable.bodyComponent) {
      return this.ngxDatatable.bodyComponent.getRowExpanded(row)
    }
    return false
  }

  public trackByFnColumn(index, item) {
    return item.prop
  }

  public onDatatableResize(event: IElementResizedEvent) {
    if (this.ngxDatatable && this.ngxDatatableElement && this.ngxDatatableElement.nativeElement) {
      // TODO: Consider integrating this into the ngx-datatable library to avoid
      // multiple resize calls when the table resizes itself.
      // this.ngxDatatable.recalculate()
    }
  }

  _onResize(event) {
    console.log('resize', event, event.column.prop)
    this.resize.emit(event)

    // const prev = (this._prevColumns || []).find(c => c.prop === event.column.prop)
    // if (prev) {
    //   prev.width = event.newValue
    //   prev.$$oldWidth = event.newValue
    //   prev.canAutoResize = false
    // }

    if (event.isDone) {
      const columns = this.columns
      // console.log('columns', columns)
      const col = (columns || []).find(c => c.prop === event.column.prop)
      if (col) {
        // col.width = event.newValue
        col.canAutoResize = false
      }
      this.columns = [ ...columns ]
    }

    // event.column.$$oldWidth = event.newValue
    // if (this._columnMode === ColumnMode.force) {

    // }
  }

  /**
   * This is just the `setColumnDefaults` function from
   * '@marklb/ngx-datatable/release/utils' without the internally maintained
   * properties( the props starting with '$$').
   */
  private _setColumnDefaults(columns: ITheSeamDatatableColumn[]) {
    if (!columns) { return }

    // Only one column should hold the tree view
    // Thus if multiple columns are provided with
    // isTreeColumn as true we take only the first one
    let treeColumnFound = false

    for (const column of columns) {

      // prop can be numeric; zero is valid not a missing prop
      // translate name => prop
      if (isNullOrUndefined(column.prop) && column.name) {
        column.prop = camelCase(column.name)
      }

      if (!column.$$valueGetter && column.prop) {
        column.$$valueGetter = getterForProp(column.prop)
      }

      // format props if no name passed
      if (!isNullOrUndefined(column.prop) && isNullOrUndefined(column.name)) {
        column.name = deCamelCase(String(column.prop))
      }

      if (isNullOrUndefined(column.prop) && isNullOrUndefined(column.name)) {
        column.name = '' // Fixes IE and Edge displaying `null`
      }

      if (!column.hasOwnProperty('resizeable')) {
        column.resizeable = true
      }

      if (!column.hasOwnProperty('sortable')) {
        column.sortable = true
      }

      if (!column.hasOwnProperty('draggable')) {
        column.draggable = true
      }

      if (!column.hasOwnProperty('canAutoResize')) {
        column.canAutoResize = true
      }

      if (!column.hasOwnProperty('width')) {
        column.width = 150
      }

      if (!column.hasOwnProperty('isTreeColumn')) {
        column.isTreeColumn = false
      } else {
        if (column.isTreeColumn && !treeColumnFound) {
          // If the first column with isTreeColumn is true found
          // we mark that treeCoulmn is found
          treeColumnFound = true
        } else {
          // After that isTreeColumn property for any other column
          // will be set as false
          column.isTreeColumn = false
        }
      }
    }
  }

  _onTreeAction(event: any) {
    const index = event.rowIndex
    const row = event.row
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded'
    } else {
      row.treeStatus = 'collapsed'
    }
    this.rows = [ ...this.rows ]
  }

  public triggerActionRefreshRequest() {
    this.actionRefreshRequest.emit(undefined)
  }

}
