import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional } from '@angular/core'

import { MenuItemComponent } from '../menu-item.component'
import { ITheSeamMenuPanel } from '../menu-panel'
import { THESEAM_MENU_PANEL } from '../menu-panel-token'

@Component({
  selector: 'seam-menu-footer',
  templateUrl: './menu-footer.component.html',
  styleUrls: ['./menu-footer.component.scss'],
  host: {
    'class': 'd-flex flex-column text-center bg-light border-top py-2'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuFooterComponent implements OnInit {

  constructor(
    @Inject(THESEAM_MENU_PANEL) @Optional() private _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>
  ) {
    if (_parentMenu && _parentMenu.setFooter) {
      _parentMenu.setFooter(this)
    }
  }

  ngOnInit() { }

}
