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

@Component({
  selector: 'seam-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent implements OnInit, OnDestroy, AfterContentInit {

  faBars = faBars

  @ContentChild(TopBarMenuDirective, { static: true }) _topBarMenu?: TopBarMenuDirective | null
  @ContentChildren(TopBarItemDirective) _topBarItems: QueryList<TopBarItemDirective>

  @Input() logo: string
  @Input() logoSm?: string | null

  @Input() hasTitle = false
  @Input() titleText: string
  @Input() subTitleText?: string | null

  @Input() displayName: string
  @Input() organizationName?: string | null
  @Input() originalDisplayName?: string | null

  _items$: Observable<TopBarItemDirective[]>

  public isMobile$: Observable<boolean>

  constructor(
    private _layout: TheSeamLayoutService
  ) {
    this.isMobile$ = this._layout.isMobile$
  }

  ngOnInit() { }

  ngOnDestroy() { }

  ngAfterContentInit() {
    this._items$ = this._topBarItems.changes.pipe(
      startWith(undefined),
      untilDestroyed(this),
      map(() => this._topBarItems.toArray()),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

}
