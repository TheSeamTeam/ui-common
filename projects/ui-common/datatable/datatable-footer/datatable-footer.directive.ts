import { ContentChild, Directive, Input, TemplateRef } from '@angular/core'

import { DatatableFooterTplDirective } from './datatable-footer-tpl.directive'

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'seam-datatable-footer'
})
export class TheSeamDatatableFooterDirective {

  // tslint:disable-next-line: no-input-rename
  @Input('template')
  _templateInput: TemplateRef<any> | undefined | null

  @ContentChild(DatatableFooterTplDirective, { read: TemplateRef, static: true })
  _templateQuery: TemplateRef<any> | undefined | null

  get template(): TemplateRef<any> | undefined | null {
    return this._templateInput || this._templateQuery
  }

}
