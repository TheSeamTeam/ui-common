import { ContentChild, Directive, Input, TemplateRef } from '@angular/core'
import { DatatableColumnFilterTplDirective } from './datatable-column-filter-tpl.directive'

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'seam-datatable-column-filter'
})
export class TheSeamDatatableColumnFilterDirective {

  @Input() filterName : string | undefined | null

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('template')
  _templateInput: TemplateRef<any> | undefined | null

  @ContentChild(DatatableColumnFilterTplDirective, { read: TemplateRef, static: true })
  _templateQuery: TemplateRef<any> | undefined | null

  get template(): TemplateRef<any> | undefined | null {
    return this._templateInput || this._templateQuery
  }

}
