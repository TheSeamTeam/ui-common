import { animate, style, transition, trigger } from '@angular/animations'
import {
  AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, ContentChildren,
  ElementRef, EventEmitter, forwardRef, InjectionToken, Input, KeyValueDiffer,
  KeyValueDiffers, OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewChild
} from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, skip, startWith, switchMap, tap } from 'rxjs/operators'

import { faChevronDown, faChevronRight, faEllipsisH, faSpinner } from '@fortawesome/free-solid-svg-icons'
import {
  ColumnMode,
  ContextmenuType,
  DataTableColumnCellTreeToggle,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  DatatableComponent as NgxDatatableComponent,
  DatatableRowDetailDirective,
  SelectionType,
  setColumnDefaults,
  SortType,
  translateTemplates,
  TreeStatus
} from '@marklb/ngx-datatable'
import { untilDestroyed } from 'ngx-take-until-destroy'

import { composeDataFilters, IDataFilter } from '../../data-filters/index'
import { IElementResizedEvent } from '../../shared/index'

import { DatatableActionMenuComponent } from '../datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableMenuBarComponent } from '../datatable-menu-bar/datatable-menu-bar.component'
import { TheSeamDatatableRowDetailDirective } from '../datatable-row-detail/datatable-row-detail.directive'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { ITheSeamDatatableColumn } from '../models/table-column'
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'

export function _setColumnDefaults(columns: ITheSeamDatatableColumn[]): void {
  for (const column of columns) {
    if (!column.hasOwnProperty('hidden')) {
      column.hidden = false
    }
  }
  setColumnDefaults(columns)
}

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
    console.log('columns input', value)
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
  @Input() swapColumns = false
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
  @Output() readonly hiddenColumnsChange = new EventEmitter<string[]>()

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

  @ViewChild('actionMenuCellTpl', { static: true }) actionMenuCellTpl: TemplateRef<DataTableColumnDirective>
  @ViewChild('treeToggleTpl', { static: true }) treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle>
  @ViewChild('headerTpl', { static: true }) headerTpl: TemplateRef<DataTableColumnHeaderDirective>
  @ViewChild('blankHeaderTpl', { static: true }) blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective>
  @ViewChild('cellTypeSelectorTpl', { static: true }) cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective>

  public columnComponents$: Observable<DatatableColumnComponent[]>
  public columns$: Observable<ITheSeamDatatableColumn[]>
  public displayColumns$: Observable<ITheSeamDatatableColumn[]>
  private _colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> } = {}
  private _colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> } = {}

  // get hiddenColumns(): string[] { return this._hiddenColumns.value }
  // // set hiddenColumns(val: string[]) { this._hiddenColumns.next(val) }
  // private _hiddenColumns = new BehaviorSubject<string[]>([])
  // hiddenColumns$: Observable<string[]>

  constructor(
    private _columnChangesService: DatatableColumnChangesService,
    private _differs: KeyValueDiffers
  ) {
    this.rows$ = this._filtersSubject.asObservable()
      .pipe(switchMap(filters => this._rows.asObservable()
        .pipe(composeDataFilters(filters))
      ))

    // this.hiddenColumns$ = this._hiddenColumns.asObservable()

    // this._hiddenColumns.pipe(
    //   skip(1),
    //   distinctUntilChanged((a, b) => {
    //     const _a = Array.isArray(a) ? a : []
    //     const _b = Array.isArray(b) ? b : []
    //     if (_a.length !== _b.length) { return false }
    //     const _as = _a.sort()
    //     const _bs = _b.sort()
    //     return !_as.sort().every((value: string, index: number) => _bs[index] === value)
    //   }),
    //   tap(v => this.hiddenColumnsChange.emit(v)),
    //   untilDestroyed(this)
    // ).subscribe(v => console.log('hiddenColumnsChange', v))
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
    this.columnComponents$ = this._columnChangesService.columnInputChanges$.pipe(
      map(() => this.columnComponents.toArray()),
      startWith(this.columnComponents.toArray()),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.columns$ =
      combineLatest([
        this.columnComponents$,
        this._columns
      ]).pipe(
        map(v => this._getMergedTplAndInpColumns(v[0], v[1])),
        // tap(v => console.log('cols', v)),
        shareReplay({ bufferSize: 1, refCount: true })
      )

    // this.displayColumns$ = this.hiddenColumns$.pipe(
    //   switchMap(hiddenColumns => this.columns$.pipe(map(cols => cols.filter(c => hiddenColumns.findIndex(hc => hc === c.prop) === -1))))
    // )

    this.displayColumns$ = this.columns$.pipe(
      map(cols => cols.filter(c => !c.hidden)),
      tap(v => this._removeUnusedDiffs(v))
    )
  }

  private _getMergedTplAndInpColumns(
    tplCols: DatatableColumnComponent[],
    inpCols: ITheSeamDatatableColumn[]
  ): ITheSeamDatatableColumn[] {
    const cols: ITheSeamDatatableColumn[] = []

    if (this.selectionType === 'checkbox') {
      const checkBoxCol: ITheSeamDatatableColumn = {
        prop: '$$__checkbox__',
        name: '',
        width: 30,
        sortable: false,
        canAutoResize: false,
        draggable: false,
        resizeable: false,
        headerCheckboxable: true,
        checkboxable: true
      }

      cols.push(checkBoxCol)
    }

    const _tplCols = translateTemplates(<any>(tplCols || []))
    for (const col of inpCols) {
      const tplCol = _tplCols.find(t => t.prop === col.prop)
      // console.log({ col: { ...(col || {}) }, tplCol: { ...(tplCol || {}) } })

      const dtColumns = (this.ngxDatatable && this.ngxDatatable._internalColumns) || []
      const prev = dtColumns.find(c => c.prop === col.prop)

      const inpColDiff = this._getColDiff(col)
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

      const _col: ITheSeamDatatableColumn = {
        ...(prev || {}),
        ..._inpCol,
        ..._tplCol
      }

      cols.push(_col)
    }

    if (this.rowActionItem) {
      const actionMenuColumn: ITheSeamDatatableColumn = {
        prop: '$$__actionMenu__',
        name: '',
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        // TODO: Fix column auto sizing with fixed column and cell overlay before enabling.
        // frozenRight: true,
        cellTemplate: this.actionMenuCellTpl,
        headerTemplate: this.blankHeaderTpl
      }
      cols.push(actionMenuColumn)
    }

    for (const col of cols) {
      if (col.isTreeColumn && !col.treeToggleTemplate) {
        col.treeToggleTemplate = this.treeToggleTpl
      }

      if (!col.headerTemplate) {
        col.headerTemplate = this.headerTpl
      }

      if (!!col.cellType) {
        col.cellTemplate = this.cellTypeSelectorTpl
      }
    }

    // setColumnDefaults(cols)
    _setColumnDefaults(cols)


    // console.log(cols.map(c => ({ prop: c.prop, canAutoResize: c.canAutoResize })))

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

  private _removeUnusedDiffs(cols: ITheSeamDatatableColumn[]) {
    const inpKeys = Object.keys(this._colDiffersInp)
    inpKeys.filter(k => cols.findIndex(c => c.prop === k) === -1)
      .forEach(k => { delete this._colDiffersInp[k] })

    const tplKeys = Object.keys(this._colDiffersTpl)
    tplKeys.filter(k => cols.findIndex(c => c.prop === k) === -1)
      .forEach(k => { delete this._colDiffersTpl[k] })
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
      this.ngxDatatable.recalculate()
    }
  }

  _onResize(event) {
    // console.log('resize', event, event.column.prop)
    this.resize.emit(event)

    if (event.isDone) {
      const columns = this.columns
      const col = columns.find(c => c.prop === event.column.prop)
      if (col) {
        col.canAutoResize = false
      }
      this.columns = [ ...this.columns ]
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
