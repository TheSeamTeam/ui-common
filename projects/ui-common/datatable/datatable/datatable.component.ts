import { animate, style, transition, trigger } from '@angular/animations'
import { BooleanInput, coerceArray, NumberInput } from '@angular/cdk/coercion'
import { CollectionViewer, DataSource, isDataSource, ListRange } from '@angular/cdk/collections'
import {
  AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, ContentChildren,
  ElementRef, EventEmitter, forwardRef, InjectionToken, Input, KeyValueDiffer,
  KeyValueDiffers, OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewChild
} from '@angular/core'
import { BehaviorSubject, combineLatest, isObservable, Observable, of, Subject, Subscription } from 'rxjs'
import { concatMap, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators'

import { faChevronDown, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import {
  ColumnMode,
  ContextmenuType,
  DataTableColumnCellTreeToggle,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  DatatableComponent as NgxDatatableComponent,
  DatatableRowDetailDirective,
  setColumnDefaults,
  SortType,
  TableColumn,
  TreeStatus
} from '@marklb/ngx-datatable'
import type { SelectionType } from '@marklb/ngx-datatable'

import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import { composeDataFilters, composeDataFilterStates, DataFilter, DataFilterState } from '@theseam/ui-common/data-filters'
import { IElementResizedEvent } from '@theseam/ui-common/shared'
import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'

import { DatatableActionMenuComponent } from '../datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableMenuBarComponent } from '../datatable-menu-bar/datatable-menu-bar.component'
import { TheSeamDatatableRowDetailDirective } from '../datatable-row-detail/datatable-row-detail.directive'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { TheSeamDatatableAccessor } from '../models/datatable-accessor'
import { DatatableDataSource } from '../models/datatable-data-source'
import { TheSeamPageInfo } from '../models/page-info'
import { SortEvent } from '../models/sort-event'
import { SortItem } from '../models/sort-item'
import { TheSeamDatatableColumn } from '../models/table-column'
import { ColumnsManagerService } from '../services/columns-manager.service'
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'
import { DatatablePreferencesService } from '../services/datatable-preferences.service'
import { THESEAM_DATATABLE_ACCESSOR } from '../tokens/datatable-accessor'
import { mergeTplAndInpColumns } from '../utils/merge-tpl-and-input-columns'
import { removeUnusedDiffs } from '../utils/remove-unused-diffs'
import { translateTemplateColumns } from '../utils/translate-templates'
import { ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'

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
  column?: TheSeamDatatableColumn
  rowHeight?: number
  isSelected?: boolean
  rowIndex?: number
  treeStatus?: TreeStatus
  onTreeAction?: any
}

/**
 * Intended for internal classes declared by the `TheSeamDatatableModule`.
 */
export const THESEAM_DATATABLE = new InjectionToken<DataFilter>('LibDatatable')

export const _THESEAM_DATATABLE: any = {
  provide: THESEAM_DATATABLE,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DatatableComponent)
}

export const _THESEAM_DATATABLE_ACCESSOR: any = {
  provide: THESEAM_DATATABLE_ACCESSOR,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DatatableComponent)
}

// TODO: Reduce reliance on BehaviorSubject based observables, because it should
// be easier to avoit over emitting observables.
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
  providers: [
    _THESEAM_DATATABLE,
    DatatableColumnChangesService,
    _THESEAM_DATATABLE_ACCESSOR,
    ColumnsManagerService,
    ColumnsAlterationsManagerService,
  ]
})
export class DatatableComponent
  implements OnInit, OnDestroy, AfterContentInit, TheSeamDatatableAccessor, CollectionViewer {
  static ngAcceptInputType_externalPaging: BooleanInput
  static ngAcceptInputType_externalSorting: BooleanInput
  static ngAcceptInputType_externalFiltering: BooleanInput
  static ngAcceptInputType_loadingIndicator: BooleanInput
  static ngAcceptInputType_reorderable: BooleanInput
  static ngAcceptInputType_swapColumns: BooleanInput
  static ngAcceptInputType_groupExpansionDefault: BooleanInput
  static ngAcceptInputType_selectAllRowsOnPage: BooleanInput
  static ngAcceptInputType_summaryRow: BooleanInput
  static ngAcceptInputType_virtualization: BooleanInput
  static ngAcceptInputType_scrollbarV: BooleanInput
  static ngAcceptInputType_scrollbarH: BooleanInput
  static ngAcceptInputType_limit: NumberInput
  static ngAcceptInputType_count: NumberInput
  static ngAcceptInputType_offset: NumberInput
  static ngAcceptInputType_headerHeight: NumberInput
  static ngAcceptInputType_rowHeight: NumberInput
  static ngAcceptInputType_footerHeight: NumberInput
  static ngAcceptInputType_summaryHeight: NumberInput
  static ngAcceptInputType_columns: TheSeamDatatableColumn[] | undefined | null
  static ngAcceptInputType_sorts: SortItem[] | undefined | null

  readonly _faChevronDown = faChevronDown
  readonly _faChevronRight = faChevronRight
  readonly _faSpinner = faSpinner

  private readonly _ngUnsubscribe = new Subject()
  private readonly _filtersSubject = new BehaviorSubject<DataFilter[]>([])
  // private readonly _columnsObservable = new BehaviorSubject<Observable<TheSeamDatatableColumn[]> | undefined>(undefined)
  private readonly _dataSourceSubject = new BehaviorSubject<DataSource<any> | any[] | undefined>(undefined)

  public readonly filterStates: Observable<DataFilterState[]>

  get filters(): DataFilter[] { return this._filtersSubject.value }

  public readonly filters$: Observable<DataFilter[]>

  @Input()
  get preferencesKey(): string | undefined | null { return this._preferencesKey.value }
  set preferencesKey(value: string | undefined | null) { this._preferencesKey.next(value || undefined) }
  private _preferencesKey = new BehaviorSubject<string | undefined | null>(undefined)

  @Input() targetMarkerTemplate: any

  @Input()
  // get columns(): TheSeamDatatableColumn[] { return this._columns.value }
  set columns(value: TheSeamDatatableColumn[]) {
    // console.log('columns input', value)
    // this._columns.next(Array.isArray(value) ? value : [])
    this._columnsManager.setInputColumns(Array.isArray(value) ? value : [])
  }
  // private _columns = new BehaviorSubject<TheSeamDatatableColumn[]>([])

  @Input()
  get rows(): any[] { return this._rows.value }
  set rows(value: any[]) {
    this._rows.next(value || [])
  }
  private _rows = new BehaviorSubject<any[]>([])

  public rows$: Observable<any[]>

  @Input() columnMode: ColumnMode | undefined | null = ColumnMode.force

  @Input() groupRowsBy: string | undefined | null
  @Input() groupedRows: any[] | undefined | null

  @Input() selected: any[] | undefined | null = []

  @Input() @InputBoolean() externalPaging: boolean = false
  @Input() @InputBoolean() externalSorting: boolean = false
  @Input() @InputBoolean() externalFiltering: boolean = false

  @Input() @InputNumber() limit: number | undefined
  @Input() @InputNumber(0) count: number = 0
  @Input() @InputNumber(0) offset: number = 0

  @Input() @InputBoolean() loadingIndicator: boolean = false

  @Input()
  // get selectionType(): SelectionType | undefined | null { return this._selectionType }
  get selectionType(): SelectionType | undefined | null { return this._columnsManager.getSelectionType() }
  set selectionType(value: SelectionType | undefined | null) {
    // this._selectionType = value
    this._columnsManager.setSelectionType(notNullOrUndefined(value) ? value : undefined)
  }
  // private _selectionType: SelectionType | undefined | null

  @Input() @InputBoolean() reorderable: boolean = true
  @Input() @InputBoolean() swapColumns: boolean = false

  @Input() sortType: SortType | undefined | null = SortType.single

  @Input()
  get sorts(): SortItem[] {
    console.log('sorts', this.ngxDatatable, this._sorts)
    return this.ngxDatatable ? this.ngxDatatable.sorts : this._sorts
  }
  set sorts(value: SortItem[]) {
    this._sorts = notNullOrUndefined(value) ? coerceArray(value) : []
  }
  _sorts: SortItem[] = []

  @Input() cssClasses: any | undefined | null = {
    sortAscending: 'datatable-icon-up',
    sortDescending: 'datatable-icon-down',
    pagerLeftArrow: 'datatable-icon-left',
    pagerRightArrow: 'datatable-icon-right',
    pagerPrevious: 'datatable-icon-prev',
    pagerNext: 'datatable-icon-skip'
  }

  @Input() messages: any | undefined | null = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: 'No records found',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'selected'
  }

  @Input() rowIdentity: ((x: any) => any) | undefined | null = ((x: any) => x)

  @Input() rowClass: any | undefined | null

  @Input() selectCheck: any | undefined | null
  @Input() displayCheck: ((row: any, column?: any, value?: any) => boolean) | undefined | null

  @Input() @InputBoolean() groupExpansionDefault: boolean = false

  @Input() trackByProp: string | undefined | null

  @Input() @InputBoolean() selectAllRowsOnPage: boolean = false

  @Input() treeFromRelation: string | undefined | null
  @Input() treeToRelation: string | undefined | null
  @Input() @InputBoolean() summaryRow: boolean = false
  @Input() @InputNumber() summaryHeight: number = 30
  @Input() summaryPosition: string | undefined | null = 'top'

  @Input() @InputBoolean() virtualization: boolean = true

  @Input() @InputNumber() headerHeight: number = 50
  @Input() @InputNumber() rowHeight: number = 50
  @Input() @InputNumber() footerHeight: number = 40

  @Input() @InputBoolean() scrollbarV: boolean = true
  @Input() @InputBoolean() scrollbarH: boolean = true

  @Input()
  set dataSource(value: DataSource<any> | any[] | undefined | null) {
    if (value instanceof DatatableDataSource) {
      value.setDatatableAccessor(this)
    }
    this._dataSourceSubject.next(value || undefined)
  }

  @Output() readonly scroll = new EventEmitter<any>()
  @Output() readonly activate = new EventEmitter<any>()
  @Output() readonly select = new EventEmitter<any>()
  @Output() readonly sort = new EventEmitter<SortEvent>()
  @Output() readonly page = new EventEmitter<TheSeamPageInfo>()
  @Output() readonly reorder = new EventEmitter<any>()
  @Output() readonly resize = new EventEmitter<any>()
  @Output() readonly tableContextmenu = new EventEmitter<{ event: MouseEvent, type: ContextmenuType, content: any }>(false)
  @Output() readonly treeAction = new EventEmitter<any>()

  @Output() readonly actionRefreshRequest = new EventEmitter<void>()
  @Output() readonly hiddenColumnsChange = new EventEmitter<string[]>()

  // @ContentChildren(DatatableColumnComponent) columnComponents?: QueryList<DatatableColumnComponent>
  @ContentChildren(DatatableColumnComponent)
  // get columnComponents(): QueryList<DatatableColumnComponent> | undefined {
  //   return this._columnComponents
  // }
  set columnComponents(value: QueryList<DatatableColumnComponent> | undefined) {
    // this._columnComponents = value
    this._columnsManager.setTemplateColumns(translateTemplateColumns(value?.toArray() ?? []))
  }
  // private _columnComponents: QueryList<DatatableColumnComponent> | undefined

  @ContentChild(DatatableActionMenuComponent, { static: true }) actionMenu?: DatatableActionMenuComponent
  @ContentChild(DatatableRowActionItemDirective, { static: true })
  get rowActionItem(): DatatableRowActionItemDirective | undefined { return this._rowActionItem }
  set rowActionItem(value: DatatableRowActionItemDirective | undefined) {
    this._rowActionItem = value
    this._columnsManager.setRowActionItem(notNullOrUndefined(value) ? value : undefined)
  }
  private _rowActionItem: DatatableRowActionItemDirective | undefined

  @ContentChild(TheSeamDatatableRowDetailDirective, { static: true }) rowDetail?: TheSeamDatatableRowDetailDirective

  @ContentChild(DatatableMenuBarComponent)
  get menuBarComponent(): DatatableMenuBarComponent | undefined { return this._menuBarComponent }
  set menuBarComponent(value: DatatableMenuBarComponent | undefined) {
    this._menuBarComponent = value

    if (this._menuBarSub) { this._menuBarSub.unsubscribe() }

    if (value) {
      this._setMenuBarFilters(value.filters())

      this._menuBarSub = this._menuBarComponent?.filtersChanged
        .subscribe(v => { this._setMenuBarFilters(value.filters()) })
    }
  }
  private _menuBarComponent: DatatableMenuBarComponent | undefined
  private _menuBarSub: Subscription | undefined

  @ViewChild(NgxDatatableComponent) ngxDatatable?: NgxDatatableComponent
  @ViewChild(NgxDatatableComponent, { read: ElementRef }) ngxDatatableElement?: ElementRef
  @ViewChild(DatatableRowDetailDirective) ngxRowDetail?: DatatableRowDetailDirective

  @ViewChild('actionMenuCellTpl', { static: true })
  get actionMenuCellTpl(): TemplateRef<DataTableColumnDirective> | undefined { return this._actionMenuCellTpl }
  set actionMenuCellTpl(value: TemplateRef<DataTableColumnDirective> | undefined) {
    this._actionMenuCellTpl = value
    this._columnsManager.setActionMenuCellTpl(notNullOrUndefined(value) ? value : undefined)
  }
  private _actionMenuCellTpl: TemplateRef<DataTableColumnDirective> | undefined

  @ViewChild('treeToggleTpl', { static: true })
  get treeToggleTpl(): TemplateRef<DataTableColumnCellTreeToggle> | undefined { return this._treeToggleTpl }
  set treeToggleTpl(value: TemplateRef<DataTableColumnCellTreeToggle> | undefined) {
    this._treeToggleTpl = value
    this._columnsManager.setTreeToggleTpl(notNullOrUndefined(value) ? value : undefined)
  }
  private _treeToggleTpl: TemplateRef<DataTableColumnCellTreeToggle> | undefined

  @ViewChild('headerTpl', { static: true })
  get headerTpl(): TemplateRef<DataTableColumnHeaderDirective> | undefined { return this._headerTpl }
  set headerTpl(value: TemplateRef<DataTableColumnHeaderDirective> | undefined) {
    this._headerTpl = value
    this._columnsManager.setHeaderTpl(notNullOrUndefined(value) ? value : undefined)
  }
  private _headerTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined

  @ViewChild('blankHeaderTpl', { static: true })
  get blankHeaderTpl(): TemplateRef<DataTableColumnHeaderDirective> | undefined { return this._blankHeaderTpl }
  set blankHeaderTpl(value: TemplateRef<DataTableColumnHeaderDirective> | undefined) {
    this._blankHeaderTpl = value
    this._columnsManager.setBlankHeaderTpl(notNullOrUndefined(value) ? value : undefined)
  }
  private _blankHeaderTpl: TemplateRef<DataTableColumnHeaderDirective> | undefined

  @ViewChild('cellTypeSelectorTpl', { static: true })
  get cellTypeSelectorTpl(): TemplateRef<DataTableColumnDirective> | undefined { return this._cellTypeSelectorTpl }
  set cellTypeSelectorTpl(value: TemplateRef<DataTableColumnDirective> | undefined) {
    this._cellTypeSelectorTpl = value
    this._columnsManager.setCellTypeSelectorTpl(notNullOrUndefined(value) ? value : undefined)
  }
  private _cellTypeSelectorTpl: TemplateRef<DataTableColumnDirective> | undefined

  public columnComponents$?: Observable<DatatableColumnComponent[]>
  private _colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> } = {}
  private _colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> } = {}

  public readonly columns$: Observable<TheSeamDatatableColumn[]>
  public readonly displayColumns$: Observable<TheSeamDatatableColumn[]>

  viewChange: Observable<ListRange>

  private _rowDetailToggleSubscription = Subscription.EMPTY

  constructor(
    private readonly _columnChangesService: DatatableColumnChangesService,
    private readonly _differs: KeyValueDiffers,
    private readonly _preferences: DatatablePreferencesService,
    private readonly _columnsManager: ColumnsManagerService,
    private readonly _columnsAlterationsManager: ColumnsAlterationsManagerService,
  ) {
    // this.displayColumns$ = this.hiddenColumns$.pipe(
    //   switchMap(hiddenColumns => this.columns$.pipe(map(cols => cols.filter(c => hiddenColumns.findIndex(hc => hc === c.prop) === -1))))
    // )

    const applyPrefs = (cols: TheSeamDatatableColumn[]) => this._preferencesKey.pipe(
      switchMap(name => !!name
        // NOTE: This pending check is temporary to avoid table using previously
        // retrieved preference while the new one is being updated on the
        // server.
        ? !this._preferences.pending
          ? this._preferences.withColumnPreferences(name, cols)
          : of(cols)
        : of(cols)
      )
    )

    // this.columns$ = this._columnsObservable.pipe(switchMap(colsObs => colsObs ?? of([])))
    this.columns$ = this._columnsManager.columns$

    this.displayColumns$ = this.columns$.pipe(
      map(cols => cols.filter(c => !c.hidden)),
      tap(v => removeUnusedDiffs(v, this._colDiffersInp, this._colDiffersTpl)),
      switchMap(cols => applyPrefs(cols)),
    )

    this.filters$ = this._filtersSubject.asObservable()

    this.filterStates = this._filtersSubject.asObservable().pipe(
      switchMap(filters => composeDataFilterStates(filters))
    )

    // this.rows$ = this._filtersSubject.asObservable()
    //   .pipe(
    //     switchMap(filters => {
    //       if (this.externalFiltering) {
    //         return this._rows.asObservable()
    //       }
    //       return this._rows.asObservable().pipe(composeDataFilters(filters))
    //     })
    //   )

    this.rows$ = this._dataSourceSubject.pipe(
      switchMap(dataSource => {
        // console.log('dataSource', dataSource)
        let dataStream: Observable<any[]>

        if (isDataSource(dataSource)) {
          // console.log('~datasource')
          dataStream = dataSource.connect(this) as any
        } else if (isObservable(dataSource)) {
          // console.log('~observable')
          dataStream = dataSource as any
        } else if (Array.isArray(dataSource)) {
          // console.log('~array')
          dataStream = of(dataSource)
        } else {
          // console.log('~rows fallback')
          dataStream = this._rows.asObservable()
            // .pipe(tap(v => console.log('rows~', v)))
        }

        if (!this.externalFiltering) {
          // console.log('not using externalFiltering')
          dataStream = dataStream.pipe(
            switchMap(rows => this._filtersSubject.pipe(
              // tap(v => console.log('filters', v)),
              concatMap(filters => of(rows).pipe(composeDataFilters(filters))),
              // tap(v => console.log('composed filters', v)),
            ))
          )

          // dataStream = this._filtersSubject.pipe(
          //   tap(v => console.log('filters', v)),
          //   concatMap(filters => dataStream.pipe(composeDataFilters(filters))),
          //   tap(v => console.log('composed filters', v)),
          // )
        }

        return dataStream.pipe(
          // tap(v => console.log('stream', v)),
          takeUntil(this._ngUnsubscribe)
        )
      })
    )

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

    // TODO: Implement viewChange for CollectionViewer.
    this.viewChange = this.page.pipe(map(p => ({ start: 0, end: p.count })))
  }

  ngOnInit() {
    if (this.rowDetail) {
      this._rowDetailToggleSubscription = this.rowDetail._toggle.subscribe(event => {
        if (this.ngxRowDetail) {
          this.ngxRowDetail.toggle.emit(event)
        }
      })
    }
  }

  ngOnDestroy() {
    this._rowDetailToggleSubscription.unsubscribe()
  }

  ngAfterContentInit() {
    // this.columnComponents$ = this._columnChangesService.columnInputChanges$.pipe(
    //   map(() => this.columnComponents?.toArray() ?? []),
    //   startWith(this.columnComponents?.toArray() ?? []),
    //   shareReplay({ bufferSize: 1, refCount: true })
    // )

    // const _columns = combineLatest([
    //   this.columnComponents$,
    //   this._columns
    // ]).pipe(
    //   // map(v => this._getMergedTplAndInpColumns(v[0], v[1] ?? [])),
    //   map(v => {
    //     return mergeTplAndInpColumns(
    //       v[0],
    //       v[1] ?? [],
    //       (this.ngxDatatable && this.ngxDatatable._internalColumns) || [],
    //       this.selectionType,
    //       this._colDiffersInp,
    //       this._colDiffersTpl,
    //       this.rowActionItem,
    //       this.actionMenuCellTpl,
    //       this.blankHeaderTpl,
    //       this.treeToggleTpl,
    //       this.headerTpl,
    //       this.cellTypeSelectorTpl,
    //       this._differs,
    //     )
    //   }),
    //   // tap(v => console.log('cols', v)),
    //   shareReplay({ bufferSize: 1, refCount: true }),
    // )
    // this._columnsObservable.next(_columns)
  }



  private _setMenuBarFilters(filters: DataFilter[]) {
    // console.log('_setMenuBarFilters', filters)
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

  _getRowExpanded(row: any) {
    if (this.ngxDatatable && this.ngxDatatable.bodyComponent) {
      return this.ngxDatatable.bodyComponent.getRowExpanded(row)
    }
    return false
  }

  public trackByFnColumn(index: number, item: any) {
    return item.prop
  }

  public onDatatableResize(event: IElementResizedEvent) {
    if (this.ngxDatatable && this.ngxDatatableElement && this.ngxDatatableElement.nativeElement) {
      // TODO: Consider integrating this into the ngx-datatable library to avoid
      // multiple resize calls when the table resizes itself.
      this.ngxDatatable.recalculate()
    }
  }

  _onResize(event: any) {
    // console.log('resize', event, event.column.prop)
    this.resize.emit(event)

    // TODO: Fix.
    // if (event.isDone && this.columns) {
    //   const columns = this.columns
    //   const col = columns.find(c => c.prop === event.column.prop)
    //   if (col) {
    //     col.canAutoResize = false
    //   }

    //   if (this.preferencesKey) {
    //     const pref = { prop: event.column.prop, width: event.column.width, canAutoResize: false }
    //     this._preferences.setColumnPreference(this.preferencesKey, pref)
    //   }

    //   this.columns = [ ...this.columns ]
    // }
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

  /**
   * Returns the page info from the wrapped NgxDatatable instance or defaults.
   */
  public get pageInfo(): TheSeamPageInfo {
    return {
      offset: this.ngxDatatable?.offset ?? 0,
      pageSize: this.ngxDatatable?.pageSize ?? 0,
      limit: this.ngxDatatable?.limit,
      count: this.ngxDatatable?.count ?? 0
    }
  }

}
