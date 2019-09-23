import {
  animate,
  animateChild,
  group,
  keyframes,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { filter, map, mapTo, publishReplay, refCount, startWith, switchMap } from 'rxjs/operators'

import { ISideNavItem } from './side-nav.models'

const EXPANDED_STATE = 'expanded'
const COLLAPSED_STATE = 'collapsed'

@Component({
  selector: 'seam-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger('sideNavExpand', [
      state(EXPANDED_STATE, style({ width: '260px' })),
      state(COLLAPSED_STATE, style({ width: '50px', 'overflow-x': 'hidden' })),
      transition(`${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`, animate('0.2s ease-in-out')),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent implements OnInit {

  @HostBinding('@sideNavExpand') _sideNavExpand = EXPANDED_STATE

  @Input()
  get items(): ISideNavItem[] { return this._items.value }
  set items(value: ISideNavItem[]) { this._items.next(value) }
  private _items = new BehaviorSubject<ISideNavItem[]>([])
  public items$ = this._items.asObservable()

  // private _itemsWithState = new BehaviorSubject<ISideNavItem[]>([])
  // public itemsWithState$ = this._itemsWithState.asObservable()

  @Input()
  get expanded(): boolean { return this._expanded.value }
  set expanded(value: boolean) { this._expanded.next(coerceBooleanProperty(value)) }
  private _expanded = new BehaviorSubject<boolean>(true)
  public expanded$ = this._expanded.asObservable()

  public sideNavExpandedState$: Observable<string>

  constructor(
    private _router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const routed$ = this._router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        mapTo(undefined)
      )

    combineLatest(this.items$, routed$.pipe(startWith(undefined)))
      .pipe(
        map(v => v[0]),
        map(items => {
          const url = this._router.url
          console.log(items, url)
          console.log(this._router)
          console.log(this._router.isActive(url, false), this._router.isActive(url, true), url)
          const checkNode = node => {
            // console.log('check', node)
            if (node.link) {
              console.log(this._router.isActive(node.link, false), this._router.isActive(node.link, true), node.link)
            }
            if (node.children) {
              for (const _n of node.children) {
                checkNode(_n)
              }
            }
          }

          for (const _n of items) {
            checkNode(_n)
          }
        })
      )
      .subscribe()

    this.sideNavExpandedState$ = this.expanded$
      .pipe(map(expanded => expanded ? EXPANDED_STATE : COLLAPSED_STATE))

    this.sideNavExpandedState$.subscribe(v => this._sideNavExpand = v)
  }

  public toggleExpanded() {
    this.expanded = !this.expanded
  }

}
