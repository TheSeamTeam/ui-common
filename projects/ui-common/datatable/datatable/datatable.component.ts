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
  Inject,
  InjectionToken,
  Input,
  isDevMode,
  KeyValueDiffer,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  TemplateRef,
  ViewChild} from '@angular/core'
import { BehaviorSubject, combineLatest, from, isObservable, Observable, of, Subject, Subscription } from 'rxjs'
import { concatMap, distinctUntilChanged, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators'

import { faChevronDown, faChevronRight, faFilter, faSpinner } from '@fortawesome/free-solid-svg-icons'
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
import { isNullOrUndefined, notNullOrUndefined, waitOnConditionAsync } from '@theseam/ui-common/utils'

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
import { ActionItemColumnPosition, isActionItemColumnPosition } from '../models/action-item-column-position'
import { ColumnsFiltersService } from '../services/columns-filters.service'
import { THESEAM_DATATABLE_CONFIG, TheSeamDatatableColumnFilterUpdateMethod, TheSeamDatatableConfig, TheSeamDatatableMessages } from '../models/datatable-config'
import { SeamIcon } from '@theseam/ui-common/icon'
import { TheSeamDatatableColumnFilterDirective } from '../directives/datatable-column-filter.directive'

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
    ColumnsFiltersService
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
  private readonly _menuBarsFiltersSubject = new BehaviorSubject<DataFilter[]>([])
  private readonly _dataSourceSubject = new BehaviorSubject<DataSource<any> | any[] | undefined>(undefined)

  private _resizing: { [prop: string]: boolean } = {}

  public readonly filterStates: Observable<DataFilterState[]>

  get filters(): DataFilter[] {
    return [
      ...this._menuBarsFiltersSubject.value,
      ...this._columnsFilters.filters()
    ]
  }

  public readonly filters$: Observable<DataFilter[]>

  @Input()
  get preferencesKey(): string | undefined | null { return this._preferencesKey.value }
  set preferencesKey(value: string | undefined | null) { this._preferencesKey.next(value || undefined) }
  private _preferencesKey = new BehaviorSubject<string | undefined | null>(undefined)

  @Input() targetMarkerTemplate: any

  @Input()
  set columns(value: TheSeamDatatableColumn[]) {
    this._columnsManager.setInputColumns(Array.isArray(value) ? value : [])
    this._columnsFilters.registerColumnFilters(Array.isArray(value) ? value : [])
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

  @Input() @InputBoolean() externalPaging = false
  @Input() @InputBoolean() externalSorting = false
  @Input() @InputBoolean() externalFiltering = false

  @Input() @InputNumber() limit: number | undefined
  @Input() @InputNumber(0) count = 0
  @Input() @InputNumber(0) offset = 0

  @Input() @InputBoolean() loadingIndicator = false

  @Input()
  get selectionType(): SelectionType | undefined | null { return this._columnsManager.getSelectionType() }
  set selectionType(value: SelectionType | undefined | null) {
    this._columnsManager.setSelectionType(notNullOrUndefined(value) ? value : undefined)
  }

  @Input() @InputBoolean() reorderable = true
  @Input() @InputBoolean() swapColumns = false

  @Input()
  get sortType(): SortType { return this._sortType }
  set sortType(value: SortType) {
    if (notNullOrUndefined(value) && (value === SortType.single || value === SortType.multi)) {
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

  @Input() get cssClasses(): { [key: string]: string } | undefined | null {
    return this._cssClasses
  }
  set cssClasses(value: { [key: string]: string } | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._cssClasses = value
    }
    else if (notNullOrUndefined(this._config?.cssClasses)) {
      this._cssClasses = this._config?.cssClasses
    }
    else {
      this._cssClasses = this._cssClassesDefault
    }
  }
  private _cssClassesDefault: { [key: string]: string } = {
    sortAscending: 'datatable-icon-up',
    sortDescending: 'datatable-icon-down',
    pagerLeftArrow: 'datatable-icon-left',
    pagerRightArrow: 'datatable-icon-right',
    pagerPrevious: 'datatable-icon-prev',
    pagerNext: 'datatable-icon-skip'
  }
  _cssClasses: { [key: string]: string } | undefined | null

  @Input() get messages(): TheSeamDatatableMessages | undefined | null {
    return this._messages
  }
  set messages(value: TheSeamDatatableMessages | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._messages = value
    }
    else if (notNullOrUndefined(this._config?.messages)) {
      this._messages = {
        ...this._messagesDefault,
        ...this._config?.messages
      }
    }
    else {
      this._messages = this._messagesDefault
    }
  }
  private _messagesDefault: TheSeamDatatableMessages = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: 'No records found',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'selected'
  }
  _messages: TheSeamDatatableMessages | undefined | null

  @Input() rowIdentity: ((x: any) => any) | undefined | null = (x: any) => x

  @Input() rowClass: any | undefined | null

  @Input() selectCheck: any | undefined | null
  @Input() displayCheck: ((row: any, column?: any, value?: any) => boolean) | undefined | null

  @Input() @InputBoolean() groupExpansionDefault = false

  @Input() trackByProp: string | undefined | null

  @Input() @InputBoolean() selectAllRowsOnPage = false

  @Input() treeFromRelation: string | undefined | null
  @Input() treeToRelation: string | undefined | null
  @Input() @InputBoolean() summaryRow = false
  @Input() @InputNumber() summaryHeight = 30
  @Input() summaryPosition: string | undefined | null = 'top'

  @Input() @InputBoolean() virtualization = true

  @Input() @InputNumber()
  get headerHeight(): number | undefined | null {
    return this._headerHeight
  }
  set headerHeight(value: number | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._headerHeight = value
    }
    else if (notNullOrUndefined(this._config?.headerHeight)) {
      this._headerHeight = this._config?.headerHeight
    }
    else {
      this._headerHeight = this._headerHeightDefault
    }
  }
  private readonly _headerHeightDefault: number = 50
  _headerHeight: number | undefined | null

  @Input() @InputNumber()
  get rowHeight(): number | undefined | null {
    return this._rowHeight
  }
  set rowHeight(value: number | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._rowHeight = value
    }
    else if (notNullOrUndefined(this._config?.rowHeight)) {
      this._rowHeight = this._config?.rowHeight
    }
    else {
      this._rowHeight = this._rowHeightDefault
    }
  }
  private readonly _rowHeightDefault: number = 50
  _rowHeight: number | undefined | null

  @Input() @InputNumber()
  get footerHeight(): number | undefined | null {
    return this._footerHeight
  }
  set footerHeight(value: number | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._footerHeight = value
    }
    else if (notNullOrUndefined(this._config?.footerHeight)) {
      this._footerHeight = this._config?.footerHeight
    }
    else {
      this._footerHeight = this._footerHeightDefault
    }
  }
  private readonly _footerHeightDefault: number = 40
  _footerHeight: number | undefined | null

  @Input() @InputBoolean() scrollbarV = true
  @Input() @InputBoolean() scrollbarH = true

  @Input()
  set dataSource(value: DataSource<any> | any[] | undefined | null) {
    if (value instanceof DatatableDataSource) {
      value.setDatatableAccessor(this)
    }
    this._dataSourceSubject.next(value || undefined)
  }

  /**
   * Sets position behavior for optional Action Menu Button column.
   *
   * Defaults to `frozenRight`.
   */
  @Input()
  get actionItemColumnPosition(): ActionItemColumnPosition | undefined { return this._actionItemColumnPosition }
  set actionItemColumnPosition(value: ActionItemColumnPosition | undefined) {
    if (value && isActionItemColumnPosition(value)) {
      this._actionItemColumnPosition = value
    }
    this._columnsManager.setActionItemColumnPosition(this._actionItemColumnPosition)
  }
  private _actionItemColumnPosition: ActionItemColumnPosition | undefined = 'frozenRight'

  @Input() get columnFilterIcon(): SeamIcon | undefined | null {
    return this._columnFilterIcon
  }
  set columnFilterIcon(value: SeamIcon | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._columnFilterIcon = value
    }
    else if (notNullOrUndefined(this._config?.columnFilterIcon)) {
      this._columnFilterIcon = this._config?.columnFilterIcon
    }
    else {
      this._columnFilterIcon = this._columnFilterIconDefault
    }
  }
  private readonly _columnFilterIconDefault: SeamIcon = faFilter
  _columnFilterIcon: SeamIcon | undefined | null

  @Input() get columnFilterUpdateMethod(): TheSeamDatatableColumnFilterUpdateMethod | undefined | null {
    return this._columnFilterUpdateMethod
  }
  set columnFilterUpdateMethod(value: TheSeamDatatableColumnFilterUpdateMethod | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._columnFilterUpdateMethod = value
    }
    else if (notNullOrUndefined(this._config?.columnFilterUpdateMethod)) {
      this._columnFilterUpdateMethod = this._config?.columnFilterUpdateMethod
    }
    else {
      this._columnFilterUpdateMethod = this._columnFilterUpdateMethodDefault
    }
  }
  private readonly _columnFilterUpdateMethodDefault: TheSeamDatatableColumnFilterUpdateMethod = 'valueChanges'
  _columnFilterUpdateMethod: TheSeamDatatableColumnFilterUpdateMethod | undefined | null

  @Input() get columnFilterUpdateDebounce(): number | undefined | null {
    return this._columnFilterUpdateDebounce
  }
  set columnFilterUpdateDebounce(value: number | undefined | null) {
    if (notNullOrUndefined(value)) {
      this._columnFilterUpdateDebounce = value
    }
    else if (notNullOrUndefined(this._config?.columnFilterUpdateDebounce)) {
      this._columnFilterUpdateDebounce = this._config?.columnFilterUpdateDebounce
    }
    else {
      this._columnFilterUpdateDebounce = this._columnFilterUpdateDebounceDefault
    }
  }
  private readonly _columnFilterUpdateDebounceDefault: number = 400
  _columnFilterUpdateDebounce: number | undefined | null

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly scroll = new EventEmitter<any>()
  @Output() readonly activate = new EventEmitter<any>()
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly select = new EventEmitter<any>()
  @Output() readonly sort = new EventEmitter<SortEvent>()
  @Output() readonly page = new EventEmitter<TheSeamPageInfo>()
  @Output() readonly reorder = new EventEmitter<any>()
  // eslint-disable-next-line @angular-eslint/no-output-native
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
  @ContentChild(DatatableRowActionItemDirective)
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

  @ContentChildren(TheSeamDatatableColumnFilterDirective)
  set columnFilterTemplates(value: QueryList<TheSeamDatatableColumnFilterDirective> | undefined) {
    this._columnsFilters.setFilterTemplates(value?.toArray() ?? [])
  }

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
    const isHandle = (event.target as HTMLElement).classList.contains('resize-handle')
    if (isHandle) {
      const isResizeable = (event.target as HTMLElement).parentElement?.classList.contains('resizeable')
      if (isResizeable) {
        event.stopPropagation()
        const id = (event.target as HTMLElement).parentElement
          ?.querySelector('.datatable-column-header-separator')
          ?.getAttribute('data-column-id')
        this._columnsManager.columns$.pipe(
          take(1),
        ).subscribe(columns => {
          const column = columns.find(c => c.$$id === id)
          if (column) {
            const columnProp = getColumnProp(column)
            if (columnProp) {
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
    private readonly _columnsFilters: ColumnsFiltersService,
    @Optional() @Inject(THESEAM_DATATABLE_CONFIG) private readonly _config?: TheSeamDatatableConfig
  ) {
    this._preferencesKey.pipe(
      distinctUntilChanged(),
      switchMap(key => {
        if (!notNullOrUndefined(key) || key.length === 0) {
          return of(undefined)
        }

        return from(waitOnConditionAsync(() => this._preferences.isLoaded(key))).pipe(
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
          switchMap(async preferences => {
            await waitOnConditionAsync(() => this._preferences.isLoaded(prefsKey))
            return preferences
          }),
          take(1),
          map(preferences => {
            let alterations: ColumnsAlteration[] = []
            try {
              alterations = mapColumnsAlterationsStates(preferences.alterations)
            } catch (e) {
              if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn('Unable to map columns alterations states')
                // eslint-disable-next-line no-console
                console.warn(e)
              }
            }

            this._columnsAlterationsManager.add(alterations)
          })
        )
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()

    this.columns$ = combineLatest([this._columnsManager.columns$, this._columnsFilters.columnActiveFilterProps$]).pipe(
      map(([ columns, columnActiveFilterProps ]) => columns.map(col => ({
        ...col,
        filterActive: columnActiveFilterProps.includes(this._columnsFilters.getColumnFilterProp(col) || '')
      })))
    )

    this.displayColumns$ = this.columns$.pipe(
      switchMap(cols => applyPrefs(cols)),
      map(cols => cols.filter(c => !c.hidden)),
      tap(v => removeUnusedDiffs(v, this._colDiffersInp, this._colDiffersTpl)),
    )

    this.filters$ = combineLatest([ this._menuBarsFiltersSubject.asObservable(), this._columnsFilters.columnsFilters$ ]).pipe(
      map(([ menuFilters, columnsFilters ]) => [ ...menuFilters, ...columnsFilters ])
    )

    this.filterStates = this.filters$.pipe(
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
            switchMap(rows => this.filters$.pipe(
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

    this._setDatatableConfigOrDefault()
  }

  /** Sets missing inputs from config */
  private _setDatatableConfigOrDefault() {
    if (isNullOrUndefined(this.messages)) {
      this.messages = undefined
    }
    if (isNullOrUndefined(this.headerHeight)) {
      this.headerHeight = undefined
    }
    if (isNullOrUndefined(this.rowHeight)) {
      this.rowHeight = undefined
    }
    if (isNullOrUndefined(this.footerHeight)) {
      this.footerHeight = undefined
    }
    if (isNullOrUndefined(this.cssClasses)) {
      this.cssClasses = undefined
    }
    if (isNullOrUndefined(this.columnFilterIcon)) {
      this.columnFilterIcon = undefined
    }
    if (isNullOrUndefined(this.columnFilterUpdateMethod)) {
      this.columnFilterUpdateMethod = undefined
    }
    if (isNullOrUndefined(this.columnFilterUpdateDebounce)) {
      this.columnFilterUpdateDebounce = undefined
    }
  }

  ngOnDestroy() {
    this._rowDetailToggleSubscription.unsubscribe()
  }

  private _setMenuBarFilters(filters: DataFilter[]) {
    this._menuBarsFiltersSubject.next(filters || [])
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
          ...(currentOrderAlteration?.state.columns || []).filter((x: any) => x.columnProp !== columnProp),
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
