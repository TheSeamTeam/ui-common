import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

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

  @Output() navItemExpanded = new EventEmitter<NavItemExpandedEvent>()

  constructor(
    private readonly _nav: TheSeamNavService
  ) {
    this.items$ = this._items.asObservable().pipe(
      switchMap(items => items ? this._nav.createItemsObservable(items) : []),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  _navItemExpanded(item: INavItem, expanded: boolean) {
    this.navItemExpanded.emit({ navItem: item, expanded })
  }

}
