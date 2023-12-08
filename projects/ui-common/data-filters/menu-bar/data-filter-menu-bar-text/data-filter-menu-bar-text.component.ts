import { ChangeDetectionStrategy, Component, Inject, Input, Optional } from '@angular/core'

import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'
import { MenubarItemData } from '../../models/menubar-item-data'
import { THESEAM_MENUBAR_ITEM_DATA } from '../../tokens/menubar-item-data'
import { DataFilterMenuBarComponent } from '../data-filter-menu-bar/data-filter-menu-bar.component'

@Component({
  selector: 'seam-data-filter-menu-bar-text',
  templateUrl: './data-filter-menu-bar-text.component.html',
  styleUrls: ['./data-filter-menu-bar-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataFilterMenuBarTextComponent {

  @Input()
  public value: string | undefined | null

  constructor(
    private _menuBar: DataFilterMenuBarComponent,
    @Optional() @Inject(THESEAM_MENUBAR_ITEM_DATA) private _data: MenubarItemData | null
  ) {
    if (notNullOrUndefined(this._data)) {
      if (hasProperty(this._data, 'value')) {
        this.value = this._data.value
      }
    }
  }

}
