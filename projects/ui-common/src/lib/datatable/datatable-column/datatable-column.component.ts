import { Component, ContentChild, Input, OnChanges, OnInit, PipeTransform, SimpleChanges, TemplateRef } from '@angular/core'

import { ColumnChangesService } from '@marklb/ngx-datatable'

import { DatatableCellTplDirective } from '../directives/datatable-cell-tpl.directive'
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'

// HACK: Union type prevents the not found warning
type _PipeTransform = PipeTransform | PipeTransform

@Component({
  selector: 'seam-datatable-column',
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss']
})
export class DatatableColumnComponent implements OnInit, OnChanges {

  @Input() name: string
  @Input() prop: string | number

  @Input() flexGrow: number
  @Input() minWidth: number
  @Input() maxWidth: number
  @Input() width: number

  @Input() resizeable: boolean
  @Input() sortable: boolean
  @Input() draggable: boolean

  @Input() canAutoResize: boolean

  @Input() comparator: (valueA, valueB, rowA?, rowB?, sortDirection?: 'asc' | 'desc') => -1 | 0 | 1

  @Input() headerTemplate: TemplateRef<any>

  @Input() checkboxable: boolean
  @Input() headerCheckboxable: boolean

  @Input() headerClass: string | ((data: any) => string|any)
  @Input() cellClass: string | ((data: any) => string|any)

  @Input() frozenLeft: boolean
  @Input() frozenRight: boolean

  @Input() pipe: _PipeTransform

  @Input() isTreeColumn: boolean
  @Input() treeLevelIndent: number

  @Input() summaryFunc: (cells: any[]) => any
  @Input() summaryTemplate: TemplateRef<any>

  private _isFirstChange = true

  @ContentChild(DatatableCellTplDirective, { static: true }) cellTplDirective: DatatableCellTplDirective

  // tslint:disable-next-line: no-input-rename
  @Input('cellTemplate')
  _cellTemplateInput: TemplateRef<any>

  @ContentChild(DatatableCellTplDirective, { read: TemplateRef, static: true })
  _cellTemplateQuery: TemplateRef<any>

  get cellTemplate(): TemplateRef<any> {
    return this._cellTemplateInput || this._cellTemplateQuery
  }

  // @Input('headerTemplate')
  // _headerTemplateInput: TemplateRef<any>;

  // @ContentChild(DataTableColumnHeaderDirective, { read: TemplateRef, static: true })
  // _headerTemplateQuery: TemplateRef<any>;

  // get headerTemplate(): TemplateRef<any> {
  //   return this._headerTemplateInput || this._headerTemplateQuery;
  // }

  // @Input('treeToggleTemplate')
  // _treeToggleTemplateInput: TemplateRef<any>;

  // @ContentChild(DataTableColumnCellTreeToggle, { read: TemplateRef, static: true })
  // _treeToggleTemplateQuery: TemplateRef<any>;

  // get treeToggleTemplate(): TemplateRef<any> {
  //   return this._treeToggleTemplateInput || this._treeToggleTemplateQuery;
  // }

  constructor(
    private _columnChangesService: DatatableColumnChangesService
  ) {}

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._isFirstChange) {
      this._isFirstChange = false
    } else {
      this._columnChangesService.onInputChange()
    }
  }

  public getCellDirective(): DatatableCellTplDirective | null {
    if (this.cellTplDirective) {
      return this.cellTplDirective
    }

    return null
  }

}
