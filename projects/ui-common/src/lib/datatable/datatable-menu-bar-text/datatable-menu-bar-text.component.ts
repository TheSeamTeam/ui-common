import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, Optional } from '@angular/core'

import { hasProperty, notNullOrUndefined } from '../../utils'
import { DatatableMenuBarComponent } from './../datatable-menu-bar/datatable-menu-bar.component'
import { MenubarItemData } from './../models/menubar-item-data'
import { THESEAM_MENUBAR_ITEM_DATA } from './../tokens/menubar-item-data'


@Component({
  selector: 'seam-datatable-menu-bar-text',
  templateUrl: './datatable-menu-bar-text.component.html',
  styleUrls: ['./datatable-menu-bar-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableMenuBarTextComponent implements OnInit {

  @Input()
  public value: string

  constructor(
    private _menuBar: DatatableMenuBarComponent,
    @Optional() @Inject(THESEAM_MENUBAR_ITEM_DATA) private _data: MenubarItemData | null
  ) {
    if (notNullOrUndefined(this._data)) {
      if (hasProperty(this._data, 'value')) {
        this.value = this._data.value
      }
    }
  }

  ngOnInit(): void { }

}
