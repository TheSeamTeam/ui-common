import { Injectable } from '@angular/core'

import { TheSeamTabbedComponent } from './tabbed.component'

export declare type TheSeamTabsDirection = 'horizontal' | 'vertical'

@Injectable()
export class TheSeamTabbedService {

  private _tabGroups: { [groupName: string]: TheSeamTabbedComponent[] } = {}

  public registerTab(tab: TheSeamTabbedComponent, groupName: string) {
    if (!this._tabGroups[groupName]) {
      this._tabGroups[groupName] = []
    }

    for (const t of this._tabGroups[groupName]) {
      t.hideTabs = true
    }

    this._tabGroups[groupName].push(tab)
  }

  public unregisterTab(tab: TheSeamTabbedComponent, groupName: string) {
    if (this._tabGroups[groupName]) {
      this._tabGroups[groupName] = this._tabGroups[groupName].filter(
        t => t !== tab,
      )

      if (this._tabGroups[groupName].length > 0) {
        this._tabGroups[groupName][this._tabGroups[groupName].length - 1].hideTabs = false
      }
    }
  }

}
