import {
  AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { TabbedItemComponent } from './tabbed-item/tabbed-item.component'
import { TabbedService, TabsDirection } from './tabbed.service'

@Component({
  selector: 'seam-tabbed',
  templateUrl: './tabbed.component.html',
  styleUrls: ['./tabbed.component.scss'],
  providers: [ TabbedService ]
})
export class TabbedComponent implements OnInit, AfterContentInit, OnDestroy {

  private _direction: TabsDirection = 'vertical'
  private _hideTabs = false

  @ContentChildren(TabbedItemComponent) tabbedItems?: QueryList<TabbedItemComponent>

  @Output() tabChanged = new EventEmitter<TabbedItemComponent>()

  @Input()
  set direction(val: TabsDirection) {
    this._direction = val
  }
  get direction() {
    return this._direction
  }

  @Input()
  set hideTabs(val: boolean) {
    setTimeout(() => {
      this._hideTabs = val
    })
  }
  get hideTabs(): boolean {
    return this._hideTabs
  }

  @Input()
  public onlyRouteContent = false

  get selectedTab(): TabbedItemComponent | undefined {
    if (this.onlyRouteContent) {
      if (this.route.snapshot.children.length > 0) {
        const config = this.route.snapshot.children[0].routeConfig
        const childPath = config && config.path
        return this.tabbedItems?.find(t => t.name === childPath)
      }
    } else {
      return this._selectedTab
    }
  }
  set selectedTab(tab: TabbedItemComponent | undefined) { this._selectedTab = tab }
  private _selectedTab: TabbedItemComponent | undefined

  private _activeTabNameTimeout: any
  @Input()
  set activeTabName(val: string) {
    clearTimeout(this._activeTabNameTimeout)
    this._activeTabNameTimeout = setTimeout(() => {
      if (!val) {
        this.selectedTab = undefined
      } else {
        this.selectTab(val)
      }
    })
  }

  constructor(
    public tabbedService: TabbedService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.tabbedService.registerTab(this, 'main')
  }

  ngOnDestroy() {
    this.tabbedService.unregisterTab(this, 'main')
  }

  ngAfterContentInit() {
    if (this.tabbedItems && this.tabbedItems.length > 0) {
      this.selectedTab = this.tabbedItems.first
    }
  }

  /**
   *
   */
  public onClickTab(event: any, tab: TabbedItemComponent) {
    this.selectedTab = tab
    if (this.onlyRouteContent) {
      this.router.navigate([ tab.name ], { relativeTo: this.route })
    }
    this.tabChanged.emit(tab)
  }

  /**
   * TODO: Make more generic, so that the name isn't the only way
   *  to select a tab
   */
  public selectTab(name: string) {
    const tab = this.tabbedItems?.find(t => t.name === name)
    if (tab) {
      this.selectedTab = tab
    } else {
      throw new Error(`Tab with name '${name}' not found`)
    }
  }

}
