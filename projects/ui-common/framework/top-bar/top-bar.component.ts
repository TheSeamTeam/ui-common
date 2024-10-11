import { BooleanInput } from '@angular/cdk/coercion'
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  OnDestroy,
  QueryList,
  ViewEncapsulation
} from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { map, shareReplay, startWith, takeUntil } from 'rxjs/operators'

import { faBars } from '@fortawesome/free-solid-svg-icons'

import { InputBoolean } from '@theseam/ui-common/core'
import { TheSeamLayoutService } from '@theseam/ui-common/layout'

import { faUserCircle } from '@fortawesome/free-regular-svg-icons'
import { SeamIcon } from '@theseam/ui-common/icon'
import { TopBarCompactMenuBtnDetailDirective } from './top-bar-compact-menu-btn-detail.directive'
import { TopBarItemDirective } from './top-bar-item.directive'
import { TopBarMenuBtnDetailDirective } from './top-bar-menu-btn-detail.directive'
import { TopBarMenuDirective } from './top-bar-menu.directive'
import { TopBarNavToggleBtnDetailDirective } from './top-bar-nav-toggle-btn-detail.directive'

/**
 * Top bar of an app.
 *
 * The top bar is fairly opinionated, so most parts are not intended to be
 * customized unless there is an input.
 *
 * > If you have to make a change and apply it externally with a css class or js
 * > make sure there is an issue to get the feature changed, so we don't have
 * > different modifications across our apps. Also, this will help make sure
 * > your change should have even been done.
 */
@Component({
  selector: 'seam-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'seamTopBar',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamTopBarComponent implements OnDestroy, AfterContentInit {
  static ngAcceptInputType_hasTitle: BooleanInput

  /** @ignore */
  private readonly _ngUnsubscribe = new Subject<void>()

  /** @ignore */
  faBars = faBars

  /** @ignore */
  @ContentChild(TopBarMenuDirective, { static: true }) _topBarMenu?: TopBarMenuDirective | null
  /** @ignore */
  @ContentChildren(TopBarItemDirective) _topBarItems?: QueryList<TopBarItemDirective>
  /** @ignore */
  @ContentChild(TopBarMenuBtnDetailDirective) _topBarMenuBtnDetailTpl?: TopBarMenuBtnDetailDirective | null
  /** @ignore */
  @ContentChild(TopBarCompactMenuBtnDetailDirective) _topBarCompactMenuBtnDetailTpl?: TopBarCompactMenuBtnDetailDirective | null
  /** @ignore */
  @ContentChild(TopBarNavToggleBtnDetailDirective) _topBarNavToggleBtnDetailTpl?: TopBarNavToggleBtnDetailDirective | null

  /** Logo displayed on the top bar. */
  @Input() logo: string | undefined | null
  /** Logo displayed on the top bar when a smaller logo is needed. */
  @Input() logoSm: string | undefined | null

  /** External url to link to when `logo` is clicked. */
  @Input() logoHref?: string | null

  /** Link target used when `logoHref` is specified. Defaults to `"_blank"` */
  @Input() logoHrefTarget = '_blank'

  /** Route to link to when `logo` is clicked. Defaults to `/`. */
  @Input() logoRoute = '/'

  /** Determines if the title should be displayed. */
  @Input() @InputBoolean() hasTitle = false

  /** Title text displayed when `hasTitle` is true. */
  @Input() titleText: string | undefined | null

  /** Sub Title text displayed when `hasTitle` is true. The sub title will be less prominent. */
  @Input() subTitleText: string | undefined | null

  /** Determines if the top bar button should be displayed. */
  @Input() @InputBoolean() hasTopBarMenuButton: boolean = true

  /** Icon to display on mobile to activate profile dropdown. Defaults to faUserCircle. */
  @Input() profileIcon: SeamIcon | undefined | null = faUserCircle

  /** Icon to display for mobile nav toggle. Defaults to faBars. */
  @Input() toggleIcon: SeamIcon | undefined | null = faBars

  /** Display nav toggle on either left or right side of top bar. Defaults to left. */
  @Input() navToggleAlign: 'left' | 'right' | undefined | null = 'left'

  /** @ignore */
  _leftItems = new BehaviorSubject<TopBarItemDirective[]>([])
  /** Additional templates to display on left side of top bar */
  leftItems$ = this._leftItems.asObservable()

  /** @ignore */
  _centerItems = new BehaviorSubject<TopBarItemDirective[]>([])
  /** Additional templates to display in center of top bar */
  centerItems$ = this._centerItems.asObservable()

  /** @ignore */
  _rightItems = new BehaviorSubject<TopBarItemDirective[]>([])
  /** Additional templates to display on right side of top bar */
  rightItems$ = this._rightItems.asObservable()

  /** @ignore */
  isMobile$: Observable<boolean>

  constructor(
    private _layout: TheSeamLayoutService
  ) {
    this.isMobile$ = this._layout.isMobile$
  }

  /** @ignore */
  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  /** @ignore */
  ngAfterContentInit() {
    if (this._topBarItems) {
      this._topBarItems.changes.pipe(
        startWith(undefined),
        takeUntil(this._ngUnsubscribe),
        map(() => {
          const items = this._topBarItems?.toArray() || []

          const left = items.filter(i => i.position === 'left')
          const right = items.filter(i => i.position === 'right')
          const center = items.filter(i => i.position === 'center')

          this._leftItems.next(left)
          this._rightItems.next(right)
          this._centerItems.next(center)
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      ).subscribe()
    }
  }

}
