import { animate, style, transition, trigger } from '@angular/animations'
import {
  ChangeDetectionStrategy, Component, ContentChild, ContentChildren,
  ElementRef, EventEmitter, forwardRef, InjectionToken, Input, OnInit, Output, QueryList, ViewChild
} from '@angular/core'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { faChevronDown, faChevronRight, faEllipsisH, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { ColumnMode, ContextmenuType, SelectionType, SortType, TreeStatus } from '@marklb/ngx-datatable'
import { DatatableComponent as NgxDatatableComponent } from '@marklb/ngx-datatable'
import { camelCase, deCamelCase, getterForProp, isNullOrUndefined } from '@marklb/ngx-datatable/release/utils'

import { composeDataFilters, IDataFilter } from '../../data-filters/index'
import { IElementResizedEvent } from '../../shared/index'

import { DatatableActionMenuComponent } from '../datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component'
import { DatatableMenuBarComponent } from '../datatable-menu-bar/datatable-menu-bar.component'
import { DatatableRowActionItemDirective } from '../directives/datatable-row-action-item.directive'
import { ITheSeamTableColumn } from '../models/table-column'

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
  column?: ITheSeamTableColumn
  rowHeight?: number
  isSelected?: boolean
  rowIndex?: number
  treeStatus?: TreeStatus
  onTreeAction?: any
}

export interface IDatatableAccessor {
  columns: ITheSeamTableColumn[]
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
  providers: [ _THESEAM_DATATABLE ]
})
export class DatatableComponent implements OnInit {

  faEllipsisH = faEllipsisH
  faChevronDown = faChevronDown
  faChevronRight = faChevronRight
  faSpinner = faSpinner

  private _filtersSubject = new BehaviorSubject<IDataFilter[]>([])


  @Input() targetMarkerTemplate: any

  @Input()
  get columns(): ITheSeamTableColumn[] { return this._columns }
  set columns(value: ITheSeamTableColumn[]) {
    if (value) {
      // Need to call `setColumnDefaults` before ngx-datatable gets it because
      // of how this wrapper is implemented.

      // NOTE: Custom `this._setColumnDefaults` used because the
      // `setColumnDefaults` imported from `ngx-datatable` is causing a circular
      // dependency.
      //
      // TODO: Consider implementing differently to avoid maintaining defaults
      // or having to remove the properties set by `setColumnDefaults` function
      // in the `ngx-datatable` utilities that shouldn't be set yet.
      this._setColumnDefaults(value)
    }
    this._columns = value
  }
  private _columns: ITheSeamTableColumn[]

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

  @Input() virtualization = false

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

  @ContentChildren(DatatableColumnComponent) columnComponents: QueryList<DatatableColumnComponent>

  @ContentChild(DatatableActionMenuComponent, { static: true }) actionMenu: DatatableActionMenuComponent
  @ContentChild(DatatableRowActionItemDirective, { static: true }) rowActionItem: DatatableRowActionItemDirective

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

  constructor() {
    this.rows$ = this._filtersSubject.asObservable()
      .pipe(switchMap(filters => this._rows.asObservable()
        .pipe(composeDataFilters(filters))
      ))
  }

  ngOnInit() { }

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

  public trackByFnColumn(index, item) {
    return item.prop
  }

  public onDatatableResize(event: IElementResizedEvent) {
    // console.log('onDatatableResize')
    if (this.ngxDatatable && this.ngxDatatableElement && this.ngxDatatableElement.nativeElement) {
      // TODO: Consider integrating this into the ngx-datatable library to avoid
      // multiple resize calls when the table resizes itself.
      this.ngxDatatable.recalculate()
    }
  }

  /**
   * This is just the `setColumnDefaults` function from
   * '@marklb/ngx-datatable/release/utils' without the internally maintained
   * properties( the props starting with '$$').
   */
  private _setColumnDefaults(columns: ITheSeamTableColumn[]) {
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

}
