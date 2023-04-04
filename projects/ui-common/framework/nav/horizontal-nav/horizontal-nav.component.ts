import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { areSameHorizontalNavItem } from '../nav-utils'

import { INavItem, NavItemChildAction, NavItemExpandAction, NavItemExpandedEvent } from '../nav.models'
import { TheSeamNavService } from '../nav.service'

@Component({
  selector: 'seam-horizontal-nav',
  templateUrl: './horizontal-nav.component.html',
  styleUrls: ['./horizontal-nav.component.scss'],
  providers: [
    TheSeamNavService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HorizontalNavComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_hasHeaderToggle: BooleanInput

  private readonly _ngUnsubscribe = new Subject()

  @Input()
  get items(): INavItem[] { return this._items.value }
  set items(value: INavItem[]) {
    this._items.next(value)
  }
  private _items = new BehaviorSubject<INavItem[]>([])
  public readonly items$: Observable<INavItem[]>

  @Input() hideEmptyIcon: boolean | undefined | null = true

  @Input() hierLevel: number = 0

  @Input() childAction: NavItemChildAction = 'menu'

  @Input() expandAction: NavItemExpandAction = 'toggle'

  /**
   * The 'focused' nav item refers to the item in
   * the list that was most recently expanded or activated.
   * // TODO: make all this better
   */
  @Input() get focusedNavItem(): INavItem | undefined {
    return this._focusedNavItem.value
  }
  set focusedNavItem(value: INavItem | undefined) {
    this._focusedNavItem.next(value)
  }
  private _focusedNavItem = new BehaviorSubject<INavItem | undefined>(undefined)
  public focusedNavItem$ = this._focusedNavItem.asObservable()

  @Output() navItemExpanded = new EventEmitter<NavItemExpandedEvent>()

  constructor() {
    this.items$ = this._items.asObservable()
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  _navItemExpanded(item: INavItem, expanded: boolean) {
    this.navItemExpanded.emit({ navItem: item, expanded })
  }

  _navItemIsFocused(item: INavItem): Observable<boolean> {
    return this.focusedNavItem$.pipe(
      map(focusedNavItem => areSameHorizontalNavItem(focusedNavItem, item))
    )
  }

}
