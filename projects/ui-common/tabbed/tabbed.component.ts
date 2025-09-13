import {
  AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList
} from '@angular/core'
import { AsyncPipe, NgFor, NgIf } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'
import { BehaviorSubject, combineLatest, shareReplay, tap } from 'rxjs'

import { isNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamTabbedItemComponent } from './tabbed-item/tabbed-item.component'
import { TheSeamTabbedContentComponent } from './tabbed-content/tabbed-content.component'
import { TheSeamTabbedService, TheSeamTabsDirection } from './tabbed.service'

@Component({
  selector: 'seam-tabbed',
  templateUrl: './tabbed.component.html',
  styleUrls: ['./tabbed.component.scss'],
  providers: [ TheSeamTabbedService ],
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    RouterModule,
    FlexLayoutModule,
    TheSeamTabbedContentComponent,
  ],
})
export class TheSeamTabbedComponent implements OnInit, AfterContentInit, OnDestroy {

  private _direction: TheSeamTabsDirection = 'vertical'
  private _hideTabs = false

  @ContentChildren(TheSeamTabbedItemComponent)
  set tabbedItems(val: QueryList<TheSeamTabbedItemComponent> | undefined) {
    this._tabbedItems.next(val)
  }
  get tabbedItems(): QueryList<TheSeamTabbedItemComponent> | undefined {
    return this._tabbedItems.value
  }
  private readonly _tabbedItems = new BehaviorSubject<QueryList<TheSeamTabbedItemComponent> | undefined>(undefined)
  public readonly tabbedItems$ = this._tabbedItems.asObservable()

  @Output() tabChanged = new EventEmitter<TheSeamTabbedItemComponent>()

  @Input()
  set direction(val: TheSeamTabsDirection) {
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

  get selectedTab(): TheSeamTabbedItemComponent | undefined {
    if (this.onlyRouteContent) {
      if (this._route.snapshot.children.length > 0) {
        const config = this._route.snapshot.children[0].routeConfig
        const childPath = config && config.path
        return this.tabbedItems?.find(t => t.name === childPath)
      }
    } else {
      return this._selectedTab.value
    }
  }
  set selectedTab(tab: TheSeamTabbedItemComponent | undefined) { this._selectedTab.next(tab) }
  private readonly _selectedTab = new BehaviorSubject<TheSeamTabbedItemComponent | undefined>(undefined)
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
    private readonly _tabbedService: TheSeamTabbedService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this._tabbedService.registerTab(this, 'main')
  }

  ngOnDestroy() {
    this._tabbedService.unregisterTab(this, 'main')
  }

  ngAfterContentInit() {
    combineLatest([ this.tabbedItems$, this.activeTabName$ ]).pipe(
      tap(([ _, activeTabName ]) => this.selectTab(activeTabName))
    ).subscribe()
  }

  /**
   *
   */
  public onClickTab(event: any, tab: TheSeamTabbedItemComponent) {
    this.selectedTab = tab
    if (this.onlyRouteContent) {
      this._router.navigate([ tab.name ], { relativeTo: this._route })
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
    } else {
      console.warn(`Tab with name '${name}' not found`)
    }
  }

}
