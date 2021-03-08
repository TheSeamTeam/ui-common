import {
  animate,
  animateChild,
  group,
  query,
  state,
  style,
  transition,
  trigger
} from '@angular/animations'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, filter, map, mapTo, pairwise, startWith, takeUntil, tap } from 'rxjs/operators'

import { TheSeamLayoutService } from '@lib/ui-common/layout'
import { THESEAM_BASE_LAYOUT_REF } from '../base-layout/index'
import type { ITheSeamBaseLayoutNav, ITheSeamBaseLayoutRef } from '../base-layout/index'

import { ISideNavItem } from './side-nav.models'

const EXPANDED_STATE = 'expanded'
const COLLAPSED_STATE = 'collapsed'

const EXPANDED_OVERLAY_STATE = 'expanded-overlay'
const COLLAPSED_OVERLAY_STATE = 'collapsed-overlay'

const EXPANDED_STATES = [ EXPANDED_STATE, EXPANDED_OVERLAY_STATE ]
const COLLAPSED_STATES = [ COLLAPSED_STATE, COLLAPSED_OVERLAY_STATE ]
const EXPAND_STATES = [ ...EXPANDED_STATES, ...COLLAPSED_STATES ]

export function sideNavExpandStateChangeFn(fromState: string, toState: string) {
  // console.log({ fromState, toState })
  return fromState !== toState &&
    (
      // NOTE: The current way the side nav is being used it causes the
      // component to sometimes get placed in the wrong location initially. It
      // is fast enough to not be noticed without an initial animation usually,
      // so it is commented out below until the initial placement issue it
      // fixed.
      //
      // (
      //   fromState === 'void' && EXPAND_STATES.indexOf(toState) !== -1
      //   ||
      //   toState === 'void' && EXPAND_STATES.indexOf(fromState) !== -1
      // )
      // ||
      (
        (EXPANDED_STATES.indexOf(fromState) !== -1 && COLLAPSED_STATES.indexOf(toState) !== -1)
        ||
        (EXPANDED_STATES.indexOf(toState) !== -1 && COLLAPSED_STATES.indexOf(fromState) !== -1)
      )
    )
}

@Component({
  selector: 'seam-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [

    //
    // TODO: This animation code turned into a mess. Clean it up and make it
    // more smooth.
    //

    trigger('sideNavAnim', [
      transition(sideNavExpandStateChangeFn, [
        group([
          query('@sideNavBackdrop', animateChild(), { optional: true }),
          query('@sideNavExpand', animateChild(), { optional: true }),
        ]),
      ]),
    ]),

    trigger('sideNavBackdrop', [
      state(EXPANDED_OVERLAY_STATE, style({ opacity: '1' })),
      state(COLLAPSED_OVERLAY_STATE, style({ opacity: '0' })),

      // transition((fromState, toState, element, params) => {
      //   console.log('sideNavBackdrop v', fromState, toState, element, params)
      //   return false
      // }, []),

      transition(sideNavExpandStateChangeFn, animate('0.2s ease-in-out')),
    ]),

    trigger('sideNavExpand', [
      // TODO: Make width configurable.
      state(EXPANDED_STATE, style({ width: '260px' })),
      state(COLLAPSED_STATE, style({ width: '50px', 'overflow-x': 'hidden' })),

      state(EXPANDED_OVERLAY_STATE, style({
        position: 'absolute',
        top: 0,
        height: '100%',
        bottom: 0,
        left: 0,
        float: 'left',
        zIndex: '9999',
        width: 'calc(100vw - 50px)',
        transform: 'translateX(0)'
      })),
      state(COLLAPSED_OVERLAY_STATE, style({
        position: 'absolute',
        top: 0,
        height: '100%',
        bottom: 0,
        left: 0,
        float: 'left',
        zIndex: '9999',
        width: 'calc(100vw - 50px)',
        transform: 'translateX(calc(-100vw + 50px))',
        'overflow-x': 'hidden'
      })),

      // transition(`${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`, animate('0.2s ease-in-out')),

      transition(sideNavExpandStateChangeFn, animate('0.2s ease-in-out')),

      // transition(`${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`, [
      //   // query(':leave', animateChild(), { optional: true }),
      //   // query(':enter', animateChild(), { optional: true }),
      //   group([
      //     query(':leave', animateChild(), { optional: true }),
      //     query(':enter', animateChild(), { optional: true }),
      //     query('@compactAnim', animateChild(), { optional: true }),
      //     animate('5.2s ease-in-out')
      //   ])
      // ]),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SideNavComponent implements OnInit, OnDestroy, ITheSeamBaseLayoutNav {

  private readonly _ngUnsubscribe = new Subject()

  // @HostBinding('@sideNavExpand') _sideNavExpand = EXPANDED_STATE
  // _sideNavExpand = EXPANDED_STATE

  // @HostBinding('@sideNavAnim') _sideNavExpand = EXPANDED_STATE
  @HostBinding('@sideNavAnim') _sideNavExpand = 'initial'

  @Input() hasHeaderToggle = true

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

  @Input()
  get overlay(): boolean { return this._overlay.value }
  set overlay(value: boolean) { this._overlay.next(coerceBooleanProperty(value)) }
  private _overlay = new BehaviorSubject<boolean>(false)
  public overlay$ = this._overlay.asObservable()

  public isMobile$: Observable<boolean>
  public sideNavExpandedState$: Observable<string>
  public _backdropHidden = new BehaviorSubject<boolean>(true)

  constructor(
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private _layout: TheSeamLayoutService,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) private _baseLayoutRef: ITheSeamBaseLayoutRef
  ) { }

  ngOnInit() {
    if (this._baseLayoutRef) { this._baseLayoutRef.registerNav(this) }

    this.isMobile$ = this._layout.isMobile$
      .pipe(tap(isMobile => isMobile && this.collapse()))

    const routed$ = this._router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        mapTo(undefined)
      )

    combineLatest([ this.items$, routed$.pipe(startWith(undefined)) ])
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
        }),
        takeUntil(this._ngUnsubscribe)
      )
      .subscribe()

    this.isMobile$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(b => this.overlay = b)

    this.sideNavExpandedState$ = combineLatest([ this.expanded$, this.overlay$ ])
      .pipe(
        map(([ expanded, overlay ]) => expanded
          ? overlay ? EXPANDED_OVERLAY_STATE : EXPANDED_STATE
          : overlay ? COLLAPSED_OVERLAY_STATE : COLLAPSED_STATE
        ),
        distinctUntilChanged()
      )

    this.sideNavExpandedState$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(v => this._sideNavExpand = v)
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
    if (this._baseLayoutRef) { this._baseLayoutRef.unregisterNav(this) }
  }

  public expand() {
    this.expanded = true
  }

  public collapse() {
    this.expanded = false
  }

  public toggle() {
    this.expanded = !this.expanded
  }

  public animateStart() {
    if (this.expanded) {
      this._backdropHidden.next(false)
    }
  }

  public animateEnd() {
    if (!this.expanded) {
      this._backdropHidden.next(true)
    }
  }

}
