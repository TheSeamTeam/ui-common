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
import { filter, map, mapTo, startWith } from 'rxjs/operators'

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
      // transition(`${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`, animate('0.2s ease-in-out')),
      transition(`${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`, [
        // query(':leave', animateChild(), { optional: true }),
        // query(':enter', animateChild(), { optional: true }),
        group([
          query(':leave', animateChild(), { optional: true }),
          query(':enter', animateChild(), { optional: true }),
          query('@compactAnim', animateChild(), { optional: true }),
          animate('5.2s ease-in-out')
        ])
      ]),
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
          const checkNode = node => {
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
