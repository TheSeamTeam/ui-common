import { animate, style, transition, trigger } from '@angular/animations'
import { BooleanInput, coerceArray, NumberInput } from '@angular/cdk/coercion'
import { CollectionViewer, DataSource, isDataSource, ListRange } from '@angular/cdk/collections'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  InjectionToken,
  Input,
  isDevMode,
  KeyValueDiffer,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core'
import { BehaviorSubject, from, isObservable, Observable, of, Subject, Subscription } from 'rxjs'
import { concatMap, distinctUntilChanged, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators'

import { faChevronDown, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import {
  ColumnMode,
  ContextmenuType,
  DataTableColumnCellTreeToggle,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  DatatableComponent as NgxDatatableComponent,
  DatatableRowDetailDirective,
  SortType,
  TreeStatus
} from '@marklb/ngx-datatable'
import type { SelectionType } from '@marklb/ngx-datatable'

import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import { composeDataFilters, composeDataFilterStates, DataFilter, DataFilterState } from '@theseam/ui-common/data-filters'
import { IElementResizedEvent } from '@theseam/ui-common/shared'
import { notNullOrUndefined, waitOnConditionAsync } from '@theseam/ui-common/utils'

import { DatatableActionMenuComponent } from '../datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { TheSeamDatatableFooterDirective } from '../datatable-footer/datatable-footer.directive'
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
import { removeUnusedDiffs } from '../utils/remove-unused-diffs'
import { translateTemplateColumns } from '../utils/translate-templates'
import { ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'
import { ColumnsAlteration } from '../models/columns-alteration'
import { mapColumnsAlterationsStates } from '../utils/map-columns-alterations-states'
import { WidthColumnsAlteration } from '../models/columns-alterations/width.columns-alteration'
import { getColumnProp } from '../utils/get-column-prop'
import { OrderColumnsAlteration, OrderColumnsAlterationState } from '../models/columns-alterations/order.columns-alteration'
import { SortColumnsAlteration } from '../models/columns-alterations/sort.columns-alteration'

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
  implements OnInit, OnDestroy, TheSeamDatatableAccessor, CollectionViewer {
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
  private readonly _dataSourceSubject = new BehaviorSubject<DataSource<any> | any[] | undefined>(undefined)

  private _resizing: { [prop: string]: boolean } = {}

  public readonly filterStates: Observable<DataFilterState[]>

  get filters(): DataFilter[] { return this._filtersSubject.value }

  public readonly filters$: Observable<DataFilter[]>

  @Input()
  get preferencesKey(): string | undefined | null { return this._preferencesKey.value }
  set preferencesKey(value: string | undefined | null) { this._preferencesKey.next(value || undefined) }
  private _preferencesKey = new BehaviorSubject<string | undefined | null>(undefined)

  @Input() targetMarkerTemplate: any

  @Input()
  set columns(value: TheSeamDatatableColumn[]) {
    this._columnsManager.setInputColumns(Array.isArray(value) ? value : [])
  }

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
  get selectionType(): SelectionType | undefined | null { return this._columnsManager.getSelectionType() }
  set selectionType(value: SelectionType | undefined | null) {
    this._columnsManager.setSelectionType(notNullOrUndefined(value) ? value : undefined)
  }

  @Input() @InputBoolean() reorderable: boolean = true
  @Input() @InputBoolean() swapColumns: boolean = false

  @Input()
  get sortType(): SortType { return this._sortType }
  set sortType(value: SortType) {
    if (notNullOrUndefined(value) && (value === SortType.single || value == SortType.multi)) {
      this._sortType = value
    } else {
      this._sortType = SortType.single
    }
  }
  _sortType: SortType = SortType.single

  @Input()
  get sorts(): SortItem[] {
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

  @ContentChildren(DatatableColumnComponent)
  set columnComponents(value: QueryList<DatatableColumnComponent> | undefined) {
    this._columnsManager.setTemplateColumns(translateTemplateColumns(value?.toArray() ?? []))
  }

  @ContentChild(DatatableActionMenuComponent, { static: true }) actionMenu?: DatatableActionMenuComponent
  @ContentChild(DatatableRowActionItemDirective, { static: true })
  get rowActionItem(): DatatableRowActionItemDirective | undefined { return this._rowActionItem }
  set rowActionItem(value: DatatableRowActionItemDirective | undefined) {
    this._rowActionItem = value
    this._columnsManager.setRowActionItem(notNullOrUndefined(value) ? value : undefined)
  }
  private _rowActionItem: DatatableRowActionItemDirective | undefined

  @ContentChild(TheSeamDatatableRowDetailDirective, { static: true }) rowDetail?: TheSeamDatatableRowDetailDirective
  @ContentChild(TheSeamDatatableFooterDirective, { static: true }) footer?: TheSeamDatatableFooterDirective

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

  // TODO: Remove this DOM-dependent code when a way to property listen for
  // dblclick on the header reasize handles.
  @HostListener('dblclick', [ '$event' ])
  _dblClick(event: any) {
    const isHandle = (<HTMLElement>event.target).classList.contains('resize-handle')
    if (isHandle) {
      const isResizeable = (<HTMLElement>event.target).parentElement?.classList.contains('resizeable')
      if (isResizeable) {
        event.stopPropagation()
        const id = (<HTMLElement>event.target).parentElement
          ?.querySelector('.datatable-column-header-separator')
          ?.getAttribute('data-column-id')
        this._columnsManager.columns$.pipe(
          take(1),
        ).subscribe(columns => {
          const column = columns.find(c => c.$$id === id)
          if (column) {
            const columnProp = getColumnProp(column)
            if (columnProp)  {
              const alteration = new WidthColumnsAlteration({ columnProp, canAutoResize: true }, false)
              this._columnsAlterationsManager.add([ alteration ])
            }
          }
        })
      }
    }
  }

  constructor(
    private readonly _preferences: DatatablePreferencesService,
    private readonly _columnsManager: ColumnsManagerService,
    private readonly _columnsAlterationsManager: ColumnsAlterationsManagerService,
  ) {
    this._preferencesKey.pipe(
      distinctUntilChanged(),
      switchMap(key => {
        if (!notNullOrUndefined(key) || key.length === 0) {
          return of(undefined)
        }

        return from(waitOnConditionAsync(() => this._preferences.loaded)).pipe(
          switchMap(() => this._columnsAlterationsManager.changes.pipe(
            startWith(undefined),
            tap(() => {
              this._preferences.setAlterations(key, this._columnsAlterationsManager.get())
            }),
          ))
        )
      }),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    const applyPrefs = (cols: TheSeamDatatableColumn[]) => this._columnsAlterationsManager.changes.pipe(
      startWith(undefined),
      map(() => {
        this._columnsAlterationsManager.apply(cols, this)
        return cols
      }),
    )

    this._preferencesKey.pipe(
      distinctUntilChanged(),
      switchMap(prefsKey => {
        if (!notNullOrUndefined(prefsKey)) {
          return of(undefined)
        }
        return this._preferences.preferences(prefsKey).pipe(
          switchMap(async (preferences) => {
            await waitOnConditionAsync(() => this._preferences.loaded)
            return preferences
          }),
          take(1),
          map(preferences => {
            let alterations: ColumnsAlteration[] = []
            try {
              alterations = mapColumnsAlterationsStates(preferences.alterations)
            } catch (e) {
              if (isDevMode()) {
                console.warn('Unable to map columns alterations states')
                console.warn(e)
              }
            }

            this._columnsAlterationsManager.add(alterations)
          })
        )
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()

    this.columns$ = this._columnsManager.columns$

    this.displayColumns$ = this.columns$.pipe(
      switchMap(cols => applyPrefs(cols)),
      map(cols => cols.filter(c => !c.hidden)),
      tap(v => removeUnusedDiffs(v, this._colDiffersInp, this._colDiffersTpl)),
    )

    this.filters$ = this._filtersSubject.asObservable()

    this.filterStates = this._filtersSubject.asObservable().pipe(
      switchMap(filters => composeDataFilterStates(filters))
    )

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

  private _setMenuBarFilters(filters: DataFilter[]) {
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
    this.resize.emit(event)

    if (!notNullOrUndefined(event.column)) {
      return
    }

    const columnProp = getColumnProp(event.column)
    if (columnProp) {
      let addAlteration = false

      if (!this._resizing[columnProp]) {
        this._resizing[columnProp] = true
        addAlteration = true
      }

      if (event.isDone) {
        this._resizing[columnProp] = false
        addAlteration = true
      }

      if (addAlteration) {
        const alteration = new WidthColumnsAlteration({
          columnProp,
          width: event.column.width,
          canAutoResize: false
        }, true)
        this._columnsAlterationsManager.add([ alteration ])
      }
    }

  }

  _onReorder(event: any): void {
    this.reorder.emit(event)

    const columnProp = getColumnProp(event.column)
    if (columnProp) {
      const currentOrderAlteration = this._columnsAlterationsManager.get().find(x => x.type === 'order')
      const state: OrderColumnsAlterationState = {
        columns: [
          ...(currentOrderAlteration?.state.columns || []),
          { columnProp, index: event.newValue }
        ]
      }
      const alteration = new OrderColumnsAlteration(state, true)
      this._columnsAlterationsManager.add([ alteration ])
    }
  }

  _onSort(event: any): void {
    this.sort.emit(event)

    const alteration = new SortColumnsAlteration({ sorts: event.sorts }, true)
    this._columnsAlterationsManager.add([ alteration ])
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
