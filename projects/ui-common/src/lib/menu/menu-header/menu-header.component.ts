import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core'

import { MenuItemComponent } from '../menu-item.component'
import { ITheSeamMenuPanel } from '../menu-panel'
import { THESEAM_MENU_PANEL } from '../menu-panel-token'

@Component({
  selector: 'seam-menu-header',
  templateUrl: './menu-header.component.html',
  styleUrls: ['./menu-header.component.scss'],
  host: {
    'class': 'd-flex flex-column bg-light border-bottom rounded-top py-2'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuHeaderComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(THESEAM_MENU_PANEL) @Optional() private _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>
  ) { }

  ngOnInit() {
    if (this._parentMenu && this._parentMenu.setHeader) {
      this._parentMenu.setHeader(this)
    }
  }

  ngOnDestroy() {
    if (this._parentMenu && this._parentMenu.setHeader) {
      this._parentMenu.setHeader(undefined)
    }
  }

}
