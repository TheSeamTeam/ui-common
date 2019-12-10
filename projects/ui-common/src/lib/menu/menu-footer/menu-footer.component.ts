import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core'

import { MenuItemComponent } from '../menu-item.component'
import { ITheSeamMenuPanel } from '../menu-panel'
import { THESEAM_MENU_PANEL } from '../menu-panel-token'

@Component({
  selector: 'seam-menu-footer',
  templateUrl: './menu-footer.component.html',
  styleUrls: ['./menu-footer.component.scss'],
  host: {
    'class': 'd-flex flex-column text-center bg-light border-top rounded-bottom py-2'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuFooterComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(THESEAM_MENU_PANEL) @Optional() private _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>
  ) { }

  ngOnInit() {
    if (this._parentMenu && this._parentMenu.setFooter) {
      this._parentMenu.setFooter(this)
    }
  }

  ngOnDestroy() {
    if (this._parentMenu && this._parentMenu.setFooter) {
      this._parentMenu.setFooter(undefined)
    }
  }

}
