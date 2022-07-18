import { BooleanInput } from '@angular/cdk/coercion'
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewEncapsulation
} from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { map, shareReplay, startWith, takeUntil } from 'rxjs/operators'

import { faBars } from '@fortawesome/free-solid-svg-icons'

import { InputBoolean } from '@theseam/ui-common/core'
import { TheSeamLayoutService } from '@theseam/ui-common/layout'

import { TopBarItemDirective } from './top-bar-item.directive'
import { TopBarMenuBtnDetailDirective } from './top-bar-menu-btn-detail.directive'
import { TopBarMenuDirective } from './top-bar-menu.directive'
import { SeamIcon } from '@theseam/ui-common/icon'
import { faUserCircle } from '@fortawesome/free-regular-svg-icons'

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
export class TheSeamTopBarComponent implements OnInit, OnDestroy, AfterContentInit {
  static ngAcceptInputType_hasTitle: BooleanInput

  /** @ignore */
  private readonly _ngUnsubscribe = new Subject()

  /** @ignore */
  faBars = faBars

  /** @ignore */
  @ContentChild(TopBarMenuDirective, { static: true }) _topBarMenu?: TopBarMenuDirective | null
  /** @ignore */
  @ContentChildren(TopBarItemDirective) _topBarItems?: QueryList<TopBarItemDirective>
  /** @ignore */
  @ContentChild(TopBarMenuBtnDetailDirective) _topBarMenuBtnDetailTpl?: TopBarMenuBtnDetailDirective | null

  /** Logo displayed on the top bar. */
  @Input() logo: string | undefined | null
  /** Logo displayed on the top bar when a smaller logo is needed. */
  @Input() logoSm: string | undefined | null

  /** External url to link to when `logo` is clicked. */
  @Input() logoHref?: string | null

  /** Link target used when `logoHref` is specified. Defaults to `"_blank"` */
  @Input() logoHrefTarget: string = '_blank'

  /** Route to link to when `logo` is clicked. Defaults to `/`. */
  @Input() logoRoute: string = '/'

  /** Determines if the title should be displayed. */
  @Input() @InputBoolean() hasTitle: boolean = false

  /** Title text displayed when `hasTitle` is true. */
  @Input() titleText: string | undefined | null

  /** Sub Title text displayed when `hasTitle` is true. The sub title will be less prominent. */
  @Input() subTitleText: string | undefined | null

  /** Icon to display on mobile to activate profile dropdown. Defaults to faUserCircle. */
  @Input() profileIcon: SeamIcon | undefined | null = faUserCircle

  /** @ignore */
  _items$?: Observable<TopBarItemDirective[]>

  /** @ignore */
  isMobile$: Observable<boolean>

  constructor(
    private _layout: TheSeamLayoutService
  ) {
    this.isMobile$ = this._layout.isMobile$
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  /** @ignore */
  ngAfterContentInit() {
    if (this._topBarItems) {
      this._items$ = this._topBarItems.changes.pipe(
        startWith(undefined),
        takeUntil(this._ngUnsubscribe),
        map(() => this._topBarItems?.toArray() || []),
        shareReplay({ bufferSize: 1, refCount: true })
      )
    }
  }

}
