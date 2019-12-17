import { Component, ContentChild, Input, OnChanges, OnInit, PipeTransform, SimpleChanges, TemplateRef } from '@angular/core'

import { ColumnChangesService } from '@marklb/ngx-datatable'

import { DatatableCellTplDirective } from '../directives/datatable-cell-tpl.directive'

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

  @Input() cellTemplate: TemplateRef<any>
  @Input() headerTemplate: TemplateRef<any>

  @Input() checkboxable: boolean
  @Input() headerCheckboxable: boolean

  @Input() headerClass: string | ((data: any) => string|any)
  @Input() cellClass: string | ((data: any) => string|any)

  @Input() frozenLeft: boolean
  @Input() frozenRight: boolean

  @Input() pipe: _PipeTransform

  @Input() isTreeColumn: boolean

  private _isFirstChange = true

  @ContentChild(DatatableCellTplDirective, { static: true }) cellTplDirective: DatatableCellTplDirective

  // constructor() { }
  constructor(private _columnChangesService: ColumnChangesService) {}

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (this._isFirstChange) {
      this._isFirstChange = false
    } else {
      // console.log('changes', changes)
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
