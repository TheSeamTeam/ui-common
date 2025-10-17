import { BooleanInput } from '@angular/cdk/coercion'
import { AsyncPipe, NgFor } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  ViewEncapsulation,
} from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import {
  INavItem,
  NavItemChildAction,
  NavItemExpandAction,
  NavItemExpandedEvent,
} from '../nav.models'
import { TheSeamNavService } from '../nav.service'
import { NavItemComponent } from '../nav-item/nav-item.component'

@Component({
  selector: 'seam-horizontal-nav',
  templateUrl: './horizontal-nav.component.html',
  styleUrls: ['./horizontal-nav.component.scss'],
  providers: [TheSeamNavService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, AsyncPipe, NavItemComponent],
})
export class HorizontalNavComponent implements OnDestroy {
  static ngAcceptInputType_hasHeaderToggle: BooleanInput

  private readonly _nav = inject(TheSeamNavService)

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input()
  get items(): INavItem[] {
    return this._items.value
  }
  set items(value: INavItem[]) {
    this._items.next(value)
  }
  private _items = new BehaviorSubject<INavItem[]>([])
  public readonly items$: Observable<INavItem[]>

  @Input() hideEmptyIcon: boolean | undefined | null = true

  @Input() hierLevel = 0

  @Input() childAction: NavItemChildAction = 'menu'

  @Input() expandAction: NavItemExpandAction = 'toggle'

  @Output() navItemExpanded = new EventEmitter<NavItemExpandedEvent>()

  constructor() {
    this.items$ = this._items.asObservable().pipe(
      switchMap((items) =>
        items ? this._nav.createItemsObservable(items) : [],
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  _navItemExpanded(item: INavItem, expanded: boolean) {
    this.navItemExpanded.emit({ navItem: item, expanded })
  }
}
