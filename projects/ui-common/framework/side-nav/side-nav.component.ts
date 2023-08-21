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
import { PortalModule, TemplatePortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
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
import { CommonModule } from '@angular/common'
import { A11yModule } from '@angular/cdk/a11y'
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators'

import { faBars } from '@fortawesome/free-solid-svg-icons'
import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import { TheSeamLayoutModule, TheSeamLayoutService } from '@theseam/ui-common/layout'
import { SeamIcon } from '@theseam/ui-common/icon'
import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { ITheSeamBaseLayoutNav, ITheSeamBaseLayoutRef, THESEAM_BASE_LAYOUT_REF } from '../base-layout/index'

import { BaseLayoutSideBarFooterDirective } from '../base-layout/directives/base-layout-side-bar-footer.directive'
import { BaseLayoutSideBarHeaderDirective } from '../base-layout/directives/base-layout-side-bar-header.directive'
import { THESEAM_SIDE_NAV_ACCESSOR } from './side-nav-tokens'
import { ISideNavItem } from './side-nav.models'
import { TheSeamSideNavService } from './side-nav.service'
import { SideNavToggleComponent } from './side-nav-toggle/side-nav-toggle.component'

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
      useExisting: SideNavComponent
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
      // TODO: Make width configurable for non-overlay state.
      state(EXPANDED_STATE, style({ width: '260px' })),
      state(COLLAPSED_STATE, style({ width: '50px', 'overflow-x': 'hidden' })),

      state(EXPANDED_OVERLAY_STATE, style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          height: '{{ height }}',
          width: '{{ width }}',
          transform: '{{ origin }}',
          zIndex: '9999',
        }),
        {
          params: {
            origin: 'translateX(100%)',
            height: '100%',
            width: 'calc(100vw - 50px)',
          }
        }
      ),
      state(COLLAPSED_OVERLAY_STATE, style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          height: '{{ height }}',
          width: '{{ width }}',
          transform: '{{ origin }}',
          'overflow-x': 'hidden',
          zIndex: '9999',
        }),
        {
          params: {
            origin: 'translateX(0)',
            height: '100%',
            width: 'calc(100vw - 50px)',
          }
        }
      ),

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
  imports: [
    CommonModule,
    A11yModule,
    TheSeamScrollbarModule,
    TheSeamLayoutModule,
    PortalModule,
    SideNavToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class SideNavComponent implements OnInit, OnDestroy, ITheSeamBaseLayoutNav {
  static ngAcceptInputType_hasHeaderToggle: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  faBars = faBars

  // @HostBinding('@sideNavExpand') _sideNavExpand = EXPANDED_STATE
  // _sideNavExpand = EXPANDED_STATE

  // @HostBinding('@sideNavAnim') _sideNavExpand = EXPANDED_STATE
  @HostBinding('@sideNavAnim') _sideNavExpand = 'initial'

  @Input() @InputBoolean() hasHeaderToggle = true

  @Input() toggleIcon: SeamIcon | null | undefined = faBars

  @Input() toggleTpl: TemplateRef<any> | undefined | null

  @Input()
  get items(): ISideNavItem[] { return this._items.value }
  set items(value: ISideNavItem[]) { this._items.next(value) }
  private _items = new BehaviorSubject<ISideNavItem[]>([])
  public readonly items$: Observable<ISideNavItem[]>

  @Input() hideEmptyIcon: boolean | null | undefined

  @Input() @InputNumber(10) indentSize = 10

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

  @Input() expandOrigin: 'left' | 'right' | 'top' | 'bottom' = 'left'

  @Input() expandHeight = '100%'

  @Input() expandWidth = 'calc(100vw - 50px)'

  @Input()
  get overlay(): boolean { return this._overlay.value }
  set overlay(value: boolean) { this._overlay.next(coerceBooleanProperty(value)) }
  private _overlay = new BehaviorSubject<boolean>(false)
  public readonly overlay$ = this._overlay.asObservable()

  @Output() toggleExpand = new EventEmitter<boolean>()

  public readonly isMobile$: Observable<boolean>
  public readonly sideNavExpandedState$: Observable<string>
  public _backdropHidden = new BehaviorSubject<boolean>(true)

  @ContentChild(BaseLayoutSideBarHeaderDirective, { static: true, read: TemplateRef }) _sideBarHeaderTpl?: TemplateRef<any> | null
  _sideBarHeaderPortal?: TemplatePortal

  @ContentChild(BaseLayoutSideBarFooterDirective, { static: true, read: TemplateRef }) _sideBarFooterTpl?: TemplateRef<any> | null
  _sideBarFooterPortal?: TemplatePortal

  constructor(
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _layout: TheSeamLayoutService,
    private readonly _sideNav: TheSeamSideNavService,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) private readonly _baseLayoutRef: ITheSeamBaseLayoutRef
  ) {
    this.items$ = this._items.asObservable().pipe(
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
  }

  ngOnInit() {
    if (this._baseLayoutRef) { this._baseLayoutRef.registerNav(this) }

    this.isMobile$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(b => this.overlay = b)

    this.sideNavExpandedState$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(v => this._sideNavExpand = v)

    if (this._sideBarHeaderTpl) {
      this._sideBarHeaderPortal = new TemplatePortal(this._sideBarHeaderTpl, this._viewContainerRef)
    }

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

  get expandOriginTransform(): string | null {
    switch (this.expandOrigin) {
      case 'right':
        return this._sideNavExpand === EXPANDED_OVERLAY_STATE ? 'translateX(100vw) translateX(-100%)'
            : this._sideNavExpand === COLLAPSED_OVERLAY_STATE ? 'translateX(100vw)' : null
      case 'top':
        return this._sideNavExpand === EXPANDED_OVERLAY_STATE ? 'translateY(0)'
            : this._sideNavExpand === COLLAPSED_OVERLAY_STATE ? 'translateY(-100%)' : null
      case 'bottom':
        return this._sideNavExpand === EXPANDED_OVERLAY_STATE ? 'translateY(100vh) translateY(-100%)'
            : this._sideNavExpand === COLLAPSED_OVERLAY_STATE ? 'translateY(100vh)' : null
      case 'left':
      default:
        return this._sideNavExpand === EXPANDED_OVERLAY_STATE ? 'translateX(0)'
            : this._sideNavExpand === COLLAPSED_OVERLAY_STATE ? 'translateX(-100%)' : null
    }
  }

}
