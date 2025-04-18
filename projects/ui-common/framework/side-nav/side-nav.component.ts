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
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import { TemplatePortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, filter, map, mapTo, pairwise, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'
import { TheSeamLayoutService } from '@theseam/ui-common/layout'

import { ITheSeamBaseLayoutNav, ITheSeamBaseLayoutRef, THESEAM_BASE_LAYOUT_REF } from '../base-layout/index'

import { BaseLayoutSideBarFooterDirective } from '../base-layout/directives/base-layout-side-bar-footer.directive'
import { DEFAULT_SIDE_NAV_CONFIG, SideNavConfig, THESEAM_SIDE_NAV_ACCESSOR, THESEAM_SIDE_NAV_CONFIG } from './side-nav-tokens'
import { ISideNavItem, SideNavItemMenuItemTooltipConfig } from './side-nav.models'
import { TheSeamSideNavService } from './side-nav.service'
import { applyItemConfig } from './side-nav-utils'

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
        (EXPANDED_STATES.indexOf(fromState) !== -1 && COLLAPSED_STATES.indexOf(toState) !== -1) ||
        (EXPANDED_STATES.indexOf(toState) !== -1 && COLLAPSED_STATES.indexOf(fromState) !== -1)
      )
    )
}

@Component({
  selector: 'seam-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  providers: [
    TheSeamSideNavService,
    {
      provide: THESEAM_SIDE_NAV_ACCESSOR,
      // tslint:disable-next-line:no-use-before-declare
      useExisting: forwardRef(() => SideNavComponent)
    },
  ],
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
  static ngAcceptInputType_hasHeaderToggle: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  // @HostBinding('@sideNavExpand') _sideNavExpand = EXPANDED_STATE
  // _sideNavExpand = EXPANDED_STATE

  // @HostBinding('@sideNavAnim') _sideNavExpand = EXPANDED_STATE
  @HostBinding('@sideNavAnim') _sideNavExpand = 'initial'

  @Input() @InputBoolean() hasHeaderToggle = true

  @Input()
  get items(): ISideNavItem[] { return this._items.value }
  set items(value: ISideNavItem[]) { this._items.next(value) }
  private _items = new BehaviorSubject<ISideNavItem[]>([])
  public readonly items$: Observable<ISideNavItem[]>

  @Input()
  get expanded(): boolean { return this._expanded.value }
  set expanded(value: boolean) {
    const expanded = coerceBooleanProperty(value)
    const emit = expanded !== this.expanded
    this._expanded.next(expanded)

    if (emit) {
      this.toggleExpand.emit(coerceBooleanProperty(value))
    }
  }
  private _expanded = new BehaviorSubject<boolean>(true)
  public readonly expanded$ = this._expanded.asObservable()

  @Input()
  get overlay(): boolean { return this._overlay.value }
  set overlay(value: boolean) { this._overlay.next(coerceBooleanProperty(value)) }
  private _overlay = new BehaviorSubject<boolean>(false)
  public readonly overlay$ = this._overlay.asObservable()

  private _menuItemTooltipConfig: SideNavItemMenuItemTooltipConfig = {
    placement: 'right',
    container: 'body',
    behavior: 'always'
  }

  @Input()
  get menuItemTooltipConfig() { return this._menuItemTooltipConfig }
  set menuItemTooltipConfig(value: SideNavItemMenuItemTooltipConfig | undefined | null) {
    this._menuItemTooltipConfig = {
      class: value?.class,
      placement: value?.placement || this._menuItemTooltipConfig.placement,
      container: value?.container || this._menuItemTooltipConfig.container,
      behavior: value?.behavior || this._menuItemTooltipConfig.behavior
    }
  }

  public menuItemTooltipDisabled$: Observable<boolean> | undefined | null

  @Output() toggleExpand = new EventEmitter<boolean>()

  public readonly isMobile$: Observable<boolean>
  public readonly sideNavExpandedState$: Observable<string>
  public _backdropHidden = new BehaviorSubject<boolean>(true)

  @ContentChild(BaseLayoutSideBarFooterDirective, { static: true, read: TemplateRef }) _sideBarFooterTpl?: TemplateRef<any> | null
  _sideBarFooterPortal?: TemplatePortal

  constructor(
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _layout: TheSeamLayoutService,
    private readonly _sideNav: TheSeamSideNavService,
    @Optional() @Inject(THESEAM_SIDE_NAV_CONFIG) private readonly _config?: SideNavConfig,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) private readonly _baseLayoutRef?: ITheSeamBaseLayoutRef
  ) {
    const config: SideNavConfig = {
      ...DEFAULT_SIDE_NAV_CONFIG,
      ...(this._config || {}),
    }

    this.items$ = this._items.asObservable().pipe(
      map(items => (items && config) ? items.map(itm => applyItemConfig(itm, config)) : []),
      switchMap(items => items ? this._sideNav.createItemsObservable(items) : []),
      shareReplay({ bufferSize: 1, refCount: true }),
    )

    this.isMobile$ = this._layout.isMobile$.pipe(
      tap(isMobile => isMobile ? this.collapse() : this.expand())
    )

    this.sideNavExpandedState$ = combineLatest([ this.expanded$, this.overlay$ ]).pipe(
      map(([ expanded, overlay ]) => expanded
        ? overlay ? EXPANDED_OVERLAY_STATE : EXPANDED_STATE
        : overlay ? COLLAPSED_OVERLAY_STATE : COLLAPSED_STATE
      ),
      distinctUntilChanged()
    )

    this.menuItemTooltipDisabled$ = combineLatest([ this.expanded$, this.overlay$ ]).pipe(
      map(([ expanded, overlay ]) => {
        // never display tooltip on mobile, it breaks the layout
        if (overlay) {
          return true
        }

        return this.menuItemTooltipConfig?.behavior === 'always' ? false
          : this.menuItemTooltipConfig?.behavior === 'never' ? true
          : this.menuItemTooltipConfig?.behavior === 'collapseOnly' ? expanded : true
      }),
      distinctUntilChanged()
    )
  }

  ngOnInit() {
    if (this._baseLayoutRef) { this._baseLayoutRef.registerNav(this) }

    this.isMobile$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(b => this.overlay = b)

    this.sideNavExpandedState$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(v => this._sideNavExpand = v)

    if (this._sideBarFooterTpl) {
      this._sideBarFooterPortal = new TemplatePortal(this._sideBarFooterTpl, this._viewContainerRef)
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
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
