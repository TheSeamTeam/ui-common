import { Component, ContentChild, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core'
import { Subject } from 'rxjs'

import { ColumnChangesService, TableColumnProp } from '@marklb/ngx-datatable'

import { TheSeamTableCellTplDirective } from './table-cell-tpl.directive'
import { TheSeamTableColumnHeaderTplDirective } from './table-column-header-tpl.directive'

// TODO: The column component should implement `ITableColumn`, since
// providing some properties by input and some by template could be confusing.

@Component({
  selector: 'seam-table-column',
  standalone: true,
  template: ``,
})
export class TheSeamTableColumnComponent implements OnChanges {

  @Input() name?: string | null
  @Input() prop?: TableColumnProp | null

  @Input() flexGrow?: number | null
  // @Input() minWidth?: number | null
  // @Input() maxWidth?: number | null
  // @Input() width?: number | null

  // @Input() headerClass?: string | ((data: any) => string|any) | null
  @Input() headerClass?: string | null
  // @Input() cellClass?: string | ((data: any) => string|any) | null
  @Input() cellClass?: string | null

  private _isFirstChange = true

  @ContentChild(TheSeamTableCellTplDirective, { static: true }) cellTplDirective?: TheSeamTableCellTplDirective

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('cellTemplate')
  _cellTemplateInput?: TemplateRef<any> | null

  @ContentChild(TheSeamTableCellTplDirective, { read: TemplateRef, static: true })
  _cellTemplateQuery?: TemplateRef<any>

  get cellTemplate(): TemplateRef<any> | undefined | null {
    return this._cellTemplateInput || this._cellTemplateQuery
  }

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('headerTemplate')
  _headerTemplateInput?: TemplateRef<any> | null

  @ContentChild(TheSeamTableColumnHeaderTplDirective, { read: TemplateRef, static: true })
  _headerTemplateQuery?: TemplateRef<any>

  get headerTemplate(): TemplateRef<any> | undefined | null {
    return this._headerTemplateInput || this._headerTemplateQuery
  }

  private readonly _columnChange = new Subject<void>()
  public columnChange$ = this._columnChange.asObservable()

  // constructor(
  //   private _columnChangesService: DatatableColumnChangesService
  // ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this._isFirstChange) {
      this._isFirstChange = false
    } else {
      // this._columnChangesService.onInputChange()
      this._columnChange.next()
    }
  }

}
