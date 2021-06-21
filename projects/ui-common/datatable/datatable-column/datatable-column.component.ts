import { Component, ContentChild, Input, OnChanges, OnInit, PipeTransform, SimpleChanges, TemplateRef } from '@angular/core'

import { ColumnChangesService } from '@marklb/ngx-datatable'

import { DatatableCellTplDirective } from '../directives/datatable-cell-tpl.directive'
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'

// HACK: Union type prevents the not found warning
type _PipeTransform = PipeTransform | PipeTransform

// TODO: The column component should implement `ITheSeamDatatableColumn`, since
// providing some properties by input and some by template could be confusing.

@Component({
  selector: 'seam-datatable-column',
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss']
})
export class DatatableColumnComponent implements OnInit, OnChanges {

  @Input() name: string | undefined | null
  @Input() prop: string | number | undefined | null

  @Input() flexGrow: number | undefined | null
  @Input() minWidth: number | undefined | null
  @Input() maxWidth: number | undefined | null
  @Input() width: number | undefined | null

  @Input() resizeable: boolean | undefined | null
  @Input() sortable: boolean | undefined | null
  @Input() draggable: boolean | undefined | null

  @Input() canAutoResize: boolean | undefined | null

  @Input() comparator: ((valueA: any, valueB: any, rowA?: any, rowB?: any, sortDirection?: 'asc' | 'desc') => -1 | 0 | 1) | undefined | null

  @Input() headerTemplate: TemplateRef<any> | undefined | null

  @Input() checkboxable: boolean | undefined | null
  @Input() headerCheckboxable: boolean | undefined | null

  @Input() headerClass: string | ((data: any) => string|any) | undefined | null
  @Input() cellClass: string | ((data: any) => string|any) | undefined | null

  @Input() frozenLeft: boolean | undefined | null
  @Input() frozenRight: boolean | undefined | null

  @Input() pipe: _PipeTransform | undefined | null

  @Input() isTreeColumn: boolean | undefined | null
  @Input() treeLevelIndent: number | undefined | null

  @Input() summaryFunc: ((cells: any[]) => any) | undefined | null
  @Input() summaryTemplate: TemplateRef<any> | undefined | null

  @Input() hidden: boolean | undefined | null

  private _isFirstChange = true

  @ContentChild(DatatableCellTplDirective, { static: true }) cellTplDirective?: DatatableCellTplDirective

  // tslint:disable-next-line: no-input-rename
  @Input('cellTemplate')
  _cellTemplateInput: TemplateRef<any> | undefined | null

  @ContentChild(DatatableCellTplDirective, { read: TemplateRef, static: true })
  _cellTemplateQuery?: TemplateRef<any>

  get cellTemplate(): TemplateRef<any> | undefined | null {
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
