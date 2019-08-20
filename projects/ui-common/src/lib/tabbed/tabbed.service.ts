import { Injectable } from '@angular/core'

import { TabbedComponent } from './tabbed.component'

export declare type TabsDirection = 'horizontal' | 'vertical'

@Injectable()
export class TabbedService {

  private _tabGroups = {}

  constructor() { }

  public registerTab(tab: TabbedComponent, groupName: string) {
    if (!this._tabGroups[groupName]) {
      this._tabGroups[groupName] = []
    }

    for (const t of this._tabGroups[groupName]) {
      t.hideTabs = true
    }

    this._tabGroups[groupName].push(tab)
  }

  public unregisterTab(tab: TabbedComponent, groupName: string) {
    if (this._tabGroups[groupName]) {
      this._tabGroups[groupName] = this._tabGroups[groupName].filter(
        t => t !== tab
      )

      if (this._tabGroups[groupName].length > 0) {
        this._tabGroups[groupName][this._tabGroups[groupName].length - 1].hideTabs = false
      }
    }
  }

}
