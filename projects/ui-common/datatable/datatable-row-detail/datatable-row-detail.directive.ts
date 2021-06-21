import { ContentChild, Directive, EventEmitter, Input, Output, TemplateRef } from '@angular/core'

import { DatatableRowDetailTplDirective } from './datatable-row-detail-tpl.directive'

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'seam-datatable-row-detail'
})
export class TheSeamDatatableRowDetailDirective {

  /**
   * The detail row height is required especially
   * when virtual scroll is enabled.
   */
  @Input() rowHeight: number | ((row?: any, index?: number) => number) | undefined | null = 0

  // tslint:disable-next-line: no-input-rename
  @Input('template')
  _templateInput: TemplateRef<any> | undefined | null

  @ContentChild(DatatableRowDetailTplDirective, { read: TemplateRef, static: true })
  _templateQuery: TemplateRef<any> | undefined | null

  get template(): TemplateRef<any> | undefined | null {
    return this._templateInput || this._templateQuery
  }

  /**
   * Row detail row visbility was toggled.
   */
  // NOTE: This will trigger from the internal ngx-datatable toggle event.
  @Output() toggle: EventEmitter<any> = new EventEmitter()

  /**
   * Internal use for wrapper only.
   *
   * To avoid confusion with this directives output and the ngx-datatable
   * directive being wrapped, this directive emits `_toggle` stream to the
   * `ngx-datatable-row-detail` directive and emits it's `toggle` stream out to
   * this directives `toggle` stream.
   * @ignore
   */
  _toggle: EventEmitter<any> = new EventEmitter()

  /**
   * Toggle the expansion of the row
   */
  toggleExpandRow(row: any): void {
    this._toggle.emit({
      type: 'row',
      value: row
    })
  }

  /**
   * API method to expand all the rows.
   */
  expandAllRows(): void {
    this._toggle.emit({
      type: 'all',
      value: true
    })
  }

  /**
   * API method to collapse all the rows.
   */
  collapseAllRows(): void {
    this._toggle.emit({
      type: 'all',
      value: false
    })
  }

}
