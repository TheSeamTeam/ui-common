import { Component, ContentChild, ContentChildren, Input, QueryList, Renderer2 } from '@angular/core'

import { DatatableActionMenuItemComponent } from '../datatable-action-menu-item/datatable-action-menu-item.component'

@Component({
  selector: 'seam-datatable-action-menu',
  templateUrl: './datatable-action-menu.component.html',
  styleUrls: ['./datatable-action-menu.component.scss']
})
export class DatatableActionMenuComponent {

  @Input() row

  @ContentChildren(DatatableActionMenuItemComponent) items: QueryList<DatatableActionMenuItemComponent>

  constructor(
    private _renderer: Renderer2
  ) { }

  activateItem(event: any, item: DatatableActionMenuItemComponent) {
    item.click.emit(event)

    // HACK: This is only here until the action events are emitting to a place
    // the toggler can listen for them.
    this._renderer.setAttribute(event.view.document.body, 'tabindex', '-1')
    event.view.document.body.focus()
    this._renderer.removeAttribute(event.view.document.body, 'tabindex')
  }

}
