import {
  AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, combineLatest, shareReplay, tap } from 'rxjs'

import { isNullOrUndefined } from '@theseam/ui-common/utils'

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

  @ContentChildren(TabbedItemComponent)
  set tabbedItems(val: QueryList<TabbedItemComponent> | undefined) {
    this._tabbedItems.next(val)
  }
  get tabbedItems(): QueryList<TabbedItemComponent> | undefined {
    return this._tabbedItems.value
  }
  private readonly _tabbedItems = new BehaviorSubject<QueryList<TabbedItemComponent> | undefined>(undefined)
  public readonly tabbedItems$ = this._tabbedItems.asObservable()

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
      return this._selectedTab.value
    }
  }
  set selectedTab(tab: TabbedItemComponent | undefined) { this._selectedTab.next(tab) }
  private readonly _selectedTab = new BehaviorSubject<TabbedItemComponent | undefined>(undefined)
  public readonly selectedTab$ = this._selectedTab.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  )

  @Input()
  set activeTabName(val: string) {
    this._activeTabName.next(val)
  }
  private readonly _activeTabName = new BehaviorSubject<string | undefined>(undefined)
  private readonly activeTabName$ = this._activeTabName.asObservable()

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
    combineLatest([ this.tabbedItems$, this.activeTabName$ ]).pipe(
      tap(([ _, activeTabName ]) => this.selectTab(activeTabName))
    ).subscribe()
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
  public selectTab(name?: string) {
    if (isNullOrUndefined(name) || name === this.selectedTab?.name) {
      return
    }

    const tab = this.tabbedItems?.find(t => t.name === name)
    if (tab) {
      this.selectedTab = tab
    }
    else {
      console.warn(`Tab with name '${name}' not found`)
    }
  }

}
