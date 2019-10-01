import { Component, ContentChild, ContentChildren, Input, QueryList, Renderer2 } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'

import { SeamConfirmDialogService } from '../../confirm-dialog/index'
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
    private _renderer: Renderer2,
    private _confirmDialog: SeamConfirmDialogService,
    private _router: Router
  ) { }

  activateItem(event: any, item: DatatableActionMenuItemComponent) {
    if (item.confirmDialog) {
      this._confirmDialog.open(item.confirmDialog.message, item.confirmDialog.alert)
        .afterClosed()
        .subscribe(v => {
          if (v === 'confirm') {
            item.click.emit(event)
            if (item.href) {
              window.open(item.href, item.target)
            } else {
              const extras: NavigationExtras = {}
              if (item.queryParams) { extras.queryParams = item.queryParams }
              if (item.fragment) { extras.fragment = item.fragment }
              if (item.queryParamsHandling) { extras.queryParamsHandling = item.queryParamsHandling }
              if (item.preserveFragment) { extras.preserveFragment = item.preserveFragment }
              if (item.skipLocationChange) { extras.skipLocationChange = item.skipLocationChange }
              if (item.replaceUrl) { extras.replaceUrl = item.replaceUrl }
              if (item.state) { extras.state = item.state }

              const commands = Array.isArray(item.routerLink) ? item.routerLink : [item.routerLink]
              this._router.navigate(commands, extras)
            }
          }
        })
    } else {
      item.click.emit(event)
    }


    // HACK: This is only here until the action events are emitting to a place
    // the toggler can listen for them.
    this._renderer.setAttribute(event.view.document.body, 'tabindex', '-1')
    event.view.document.body.focus()
    this._renderer.removeAttribute(event.view.document.body, 'tabindex')
  }

}
