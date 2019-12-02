import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList
} from '@angular/core'
import { Observable } from 'rxjs'

import { faBars } from '@fortawesome/free-solid-svg-icons'

import { TheSeamLayoutService } from '../../layout/index'

import { untilDestroyed } from 'ngx-take-until-destroy'
import { map, shareReplay, startWith, tap } from 'rxjs/operators'
import { TopBarItemDirective } from './top-bar-item.directive'
import { TopBarMenuDirective } from './top-bar-menu.directive'

/**
 * Top bar of a app.
 *
 * The top bar is fairly opinionated, so most parts are not intended to be
 * customized unless there is an input.
 */
@Component({
  selector: 'seam-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  host: {
    'class': 'bg-white'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamTopBarComponent implements OnInit, OnDestroy, AfterContentInit {

  /** @ignore */
  faBars = faBars

  /** @ignore */
  @ContentChild(TopBarMenuDirective, { static: true }) _topBarMenu?: TopBarMenuDirective | null
  /** @ignore */
  @ContentChildren(TopBarItemDirective) _topBarItems: QueryList<TopBarItemDirective>

  /** Logo displayed on the top bar. */
  @Input() logo: string
  /** Logo displayed on the top bar when a smaller logo is needed. */
  @Input() logoSm?: string | null

  /**
   * Determines if the title should be displayed.
   *
   * A title and info section are not supported yet, so if the title is true
   * then the info section will be hidden.
   */
  @Input() hasTitle = false

  /** Title displayed when `hasTitle` is true. */
  @Input() titleText: string

  /** Sub Title displayed when `hasTitle` is true. The sub title will be less prominent. */
  @Input() subTitleText?: string | null

  /** Display name of the authenticated user or user being impersonated. */
  @Input() displayName: string

  /** Display name of the authenticated user if a user is being impersonated. */
  @Input() originalDisplayName?: string | null

  /** Organization name of the authenticated user or user being impersonated. */
  @Input() organizationName?: string | null

  /** Organization id of the authenticated user or user being impersonated. */
  @Input() organizationId?: string | null

  /** @ignore */
  _items$: Observable<TopBarItemDirective[]>

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
  ngOnDestroy() { }

  /** @ignore */
  ngAfterContentInit() {
    this._items$ = this._topBarItems.changes.pipe(
      startWith(undefined),
      untilDestroyed(this),
      map(() => this._topBarItems.toArray()),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

}
