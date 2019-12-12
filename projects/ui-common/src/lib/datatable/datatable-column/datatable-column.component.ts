import { Component, ContentChild, Input, OnInit, PipeTransform, TemplateRef } from '@angular/core'

import { DatatableCellTplDirective } from '../directives/datatable-cell-tpl.directive'

// HACK: Union type prevents the not found warning
type _PipeTransform = PipeTransform | PipeTransform

@Component({
  selector: 'seam-datatable-column',
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss']
})
export class DatatableColumnComponent implements OnInit {

  @Input() name: string
  @Input() prop: string | number

  @Input() flexGrow: number
  @Input() minWidth = 100
  @Input() maxWidth: number
  @Input() width = 150

  @Input() resizeable = true
  @Input() sortable = true
  @Input() draggable = true

  @Input() canAutoResize = true

  @Input() comparator: (valueA, valueB, rowA?, rowB?, sortDirection?: 'asc' | 'desc') => -1 | 0 | 1

  @Input() cellTemplate: TemplateRef<any>
  @Input() headerTemplate: TemplateRef<any>

  @Input() checkboxable: boolean
  @Input() headerCheckboxable: boolean

  @Input() headerClass: string | ((data: any) => string|any)
  @Input() cellClass: string | ((data: any) => string|any)

  @Input() frozenLeft = false
  @Input() frozenRight = false

  @Input() pipe: _PipeTransform

  @Input() isTreeColumn = false


  @ContentChild(DatatableCellTplDirective, { static: true }) cellTplDirective: DatatableCellTplDirective

  constructor() { }

  ngOnInit() { }

  public getCellDirective(): DatatableCellTplDirective | null {
    if (this.cellTplDirective) {
      return this.cellTplDirective
    }

    return null
  }

}
