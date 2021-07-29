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
import { BooleanInput, coerceBooleanProperty, coerceNumberProperty, NumberInput } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Host,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  SkipSelf,
  ViewEncapsulation
} from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs'
import { auditTime, distinctUntilChanged, map, switchMap, take, takeUntil, tap } from 'rxjs/operators'

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

import { InputNumber } from '@theseam/ui-common/core'
import type { SeamIcon } from '@theseam/ui-common/icon'
import type { ThemeTypes } from '@theseam/ui-common/models'
import { RouterHelpersService } from '@theseam/ui-common/services'

import { SideNavComponent } from '../side-nav.component'
import { ISideNavItem } from '../side-nav.models'

export interface SideNavItemBadgeTooltip {
  tooltip?: string
  class?: string
  placement?: string
  container?: string
  disabled?: boolean
}

const EXPANDED_STATE = 'expanded'
const COLLAPSED_STATE = 'collapsed'

const FULL_STATE = 'full'
const COMPACT_STATE = 'compact'

@Component({
  selector: 'seam-side-nav-item',
  templateUrl: './side-nav-item.component.html',
  styleUrls: ['./side-nav-item.component.scss'],
  exportAs: 'seamSideNavItem',
  animations: [
    trigger('childGroupAnim', [
      state(EXPANDED_STATE, style({ height: '*' })),
      state(COLLAPSED_STATE, style({ height: 0, 'overflow-y': 'hidden', visibility: 'hidden' })),
      transition(`${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`, animate('0.2s ease-in-out')),
    ]),


    trigger('compactAnim', [
      // transition('* <=> *', [
      //   query(':enter', [
      //     style({ opacity: '0' }),
      //     animate('5.2s ease-in-out', style({ opacity: '1' }))
      //   ], { optional: true }),
      //   query(':leave', [
      //     style({ opacity: '1' }),
      //     animate('5.2s ease-in-out', style({ opacity: '0' }))
      //   ], { optional: true })
      // ])

      // state(FULL_STATE, style({ opacity: '1' })),
      // state(COMPACT_STATE, style({ opacity: '0' })),
      // transition(`${FULL_STATE} <=> ${COMPACT_STATE}`, animate('5.2s ease-in-out')),
      // transition(`${FULL_STATE} <=> ${COMPACT_STATE}`, [
      // transition('* <=> *', [
      //   query(':leave', [
      //     style({ opacity: '1' }),
      //     animate('5.2s ease-in-out', style({ opacity: '0' }))
      //   ], { optional: true })
      // ]),


    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SideNavItemComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_hierLevel: NumberInput
  static ngAcceptInputType_indentSize: NumberInput
  static ngAcceptInputType_expanded: BooleanInput
  static ngAcceptInputType_compact: BooleanInput

  private readonly _ngUnsubscribe = new Subject()

  faAngleLeft = faAngleLeft

  private _initializad = false

  @Input() itemType: 'divider' | 'basic' | 'link' | 'button' | 'title' | undefined | null

  @Input() icon: SeamIcon | undefined | null

  @Input() label: string | undefined | null

  @Input()
  set link(value: string | undefined | null) { this._link.next(value) }
  get link() { return this._link.value }
  private _link = new BehaviorSubject<string | undefined | null>(undefined)
  public link$ = this._link.asObservable()

  @Input() queryParams: { [k: string]: any } | undefined | null

  @Input() children: ISideNavItem[] | undefined | null

  @Input() @InputNumber(0) hierLevel: number = 0

  @Input() @InputNumber(10) indentSize: number = 10

  @Input()
  set expanded(value: boolean) { this._expanded.next(coerceBooleanProperty(value)) }
  get expanded() { return this._expanded.value }
  private _expanded = new BehaviorSubject<boolean>(false)
  public expanded$ = this._expanded.asObservable()

  @Input()
  set compact(value: boolean) { this._compact.next(coerceBooleanProperty(value)) }
  get compact() { return this._compact.value }
  private _compact = new BehaviorSubject<boolean>(false)
  public compact$ = this._compact.asObservable()

  @Input() badgeText: string | undefined | null
  @Input() badgeTheme: ThemeTypes | undefined | null = 'danger'

  /**
   * Content to provide to assistive technology, such as screen readers.
   */
  @Input() badgeSrContent: string | undefined | null

  @Input()
  get badgeTooltip() { return this._badgeTooltip }
  set badgeTooltip(value: string | SideNavItemBadgeTooltip | undefined | null) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        this._badgeTooltip = {
          tooltip: value,
          placement: 'auto',
          disabled: false
        }
      } else {
        this._badgeTooltip = {
          ...value,
          placement: value.placement || 'auto',
          disabled: typeof value?.disabled === 'boolean'
            ? value.disabled
            : typeof value.tooltip === 'string' ? false : true
        }
      }
    } else {
      this._badgeTooltip = undefined
    }
  }
  private _badgeTooltip: SideNavItemBadgeTooltip | undefined | null

  public isActive$: Observable<boolean>
  public childGroupAnimState$: Observable<string>
  public compactAnimState$: Observable<string>
  public hasActiveChild$: Observable<boolean>

  private _registeredChildren = new BehaviorSubject<SideNavItemComponent[]>([])

  constructor(
    private _routerHelpers: RouterHelpersService,
    private _renderer: Renderer2,
    private _element: ElementRef,
    private _sideNav: SideNavComponent,
    @Optional() @SkipSelf() @Host() private _parent?: SideNavItemComponent
  ) {

    this.hasActiveChild$ = this._registeredChildren.pipe(
      switchMap(children => Array.isArray(children) && children.length > 0
        ? combineLatest(children.map(c => c.isActive$)) : of([])
      ),
      auditTime(0),
      map(v => v.findIndex(b => !!b) !== -1),
      distinctUntilChanged()
    )

    this.isActive$ = this.link$.pipe(
      switchMap(link => link ? this._routerHelpers.isActive(link, true) : of(false)),
    )

    this.childGroupAnimState$ = this.expanded$
      .pipe(map(expanded => expanded ? EXPANDED_STATE : COLLAPSED_STATE))

    this.compactAnimState$ = this.compact$
      .pipe(map(compact => compact ? COMPACT_STATE : FULL_STATE))
      // .pipe(tap(compact => console.log('compactState', compact)))
  }

  ngOnInit() {
    if (this._parent) { this._parent._registerChild(this) }

    const isActive2 = combineLatest([ this.hasActiveChild$, this.expanded$, this.isActive$ ]).pipe(
      map(([ hasActiveChild, expanded, isActive]) => {
        if (!expanded && hasActiveChild) {
          return true
        }
        return isActive
      })
    )

    isActive2
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(isActive => {
        const c = 'seam-side-nav-item--active'
        if (isActive) {
          this._renderer.addClass(this._element.nativeElement, c)
        } else {
          this._renderer.removeClass(this._element.nativeElement, c)
        }
      })

    // TODO: Make parent nodes of active child expanded on initialization.
    //
    // This worked for children of root nodes only. This will probably not work
    // in a clean way from the node components only, because the child
    // components are rendered as needed and register with the parent component
    // when it initializes.
    this.hasActiveChild$.pipe(
      take(1),
      // tap(hasChildren => console.log('hasChildren', hasChildren)),
      tap(() => {
        if (isDevMode() && this.hierLevel > 1) {
          console.warn(
            '[SideNavItem] SideNav has a bug expanding nodes to the active node ' +
            'when it initializes. Initial side nav state may be incorrect until ' +
            'fixed.'
          )
        }
      }),
      tap(hasChildren => hasChildren ? this.expanded = true : false)
    ).subscribe()
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
    if (this._parent) { this._parent._unregisterChild(this) }
  }

  get hasChildren() {
    return Array.isArray(this.children) && this.children.length > 0
  }

  public toggleChildren(): void {
    this.expanded = !this.expanded
  }

  _registerChild(child: SideNavItemComponent) {
    const children = this._registeredChildren.value
    this._registeredChildren.next([ ...children, child ])
  }

  _unregisterChild(child: SideNavItemComponent) {
    const children = this._registeredChildren.value.filter(c => c !== child)
    this._registeredChildren.next([ ...children ])
  }

  _linkClicked() {
    // Close nav when link is clicked while in overlay state
    if (this._sideNav.overlay) {
      this._sideNav.collapse()
    }
  }

}
