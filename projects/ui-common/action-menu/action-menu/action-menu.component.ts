import { BooleanInput } from '@angular/cdk/coercion'
import { ConnectionPositionPair } from '@angular/cdk/overlay'
import { Component, ContentChildren, Input, QueryList, ViewChild } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { SeamConfirmDialogService } from '@theseam/ui-common/confirm-dialog'
import { InputBoolean } from '@theseam/ui-common/core'
import { MenuComponent } from '@theseam/ui-common/menu'

import { ActionMenuItemComponent } from '../action-menu-item/action-menu-item.component'
import { SeamIcon } from '@theseam/ui-common/icon'
import { OutlineThemeTypes, ThemeTypes } from '@theseam/ui-common/models'

@Component({
  selector: 'seam-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss'],
  exportAs: 'seamDatatableActionMenu'
})
export class ActionMenuComponent {
  static ngAcceptInputType_isSubMenu: BooleanInput

  @Input() buttonIcon: SeamIcon = faEllipsisH

  @Input() buttonTheme: ThemeTypes | OutlineThemeTypes = 'primary'

  @Input() buttonText = 'Row Actions'

  @ViewChild(MenuComponent, { static: true }) menu?: MenuComponent

  @ContentChildren(ActionMenuItemComponent) items?: QueryList<ActionMenuItemComponent>

  /** @ignore */
  _actionMenuPositions: ConnectionPositionPair[] = [
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

  @Input() @InputBoolean() isSubMenu = false

  constructor(
    private _confirmDialog: SeamConfirmDialogService,
    private _router: Router
  ) { }

  activateItem(event: any, item: ActionMenuItemComponent) {
    if (item.confirmDialog) {
      this._confirmDialog.open(item.confirmDialog.message, item.confirmDialog.alert)
        .afterClosed()
        .subscribe(v => {
          if (v === 'confirm') {
            item.click.emit(event)
            if (item.href) {
              const win = window.open(item.href, item.target || undefined)
              // TODO: Consider if always setting opener to null is to restrictive
              // if (win && item.target && item.target.toLowerCase() === '_blank') {
              //   win.opener = null
              // }
            } else if (item.routerLink) {
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
