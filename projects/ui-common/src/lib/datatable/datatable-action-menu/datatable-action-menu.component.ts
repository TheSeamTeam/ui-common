import { Component, ContentChildren, QueryList } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'

import { SeamConfirmDialogService } from '../../confirm-dialog/index'

import { DatatableActionMenuItemComponent } from '../datatable-action-menu-item/datatable-action-menu-item.component'

@Component({
  selector: 'seam-datatable-action-menu',
  templateUrl: './datatable-action-menu.component.html',
  styleUrls: ['./datatable-action-menu.component.scss']
})
export class DatatableActionMenuComponent {

  faEllipsisH = faEllipsisH

  @ContentChildren(DatatableActionMenuItemComponent) items: QueryList<DatatableActionMenuItemComponent>

  /** @ignore */
  _actionMenuPositions = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ]

  constructor(
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
              const win = window.open(item.href, item.target)
              // TODO: Consider if always setting opener to null is to restrictive
              // if (win && item.target && item.target.toLowerCase() === '_blank') {
              //   win.opener = null
              // }
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
  }

}
