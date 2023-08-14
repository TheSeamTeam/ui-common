import {
  animate,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations'
import { BooleanInput, coerceBooleanProperty, NumberInput } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  Host,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Optional,
  SkipSelf,
  ViewEncapsulation
} from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import type { SeamIcon } from '@theseam/ui-common/icon'
import type { ThemeTypes } from '@theseam/ui-common/models'

import { notNullOrUndefined } from '@theseam/ui-common/utils'
import { SideNavComponent } from '../side-nav.component'
import { SideNavAccessor, THESEAM_SIDE_NAV_ACCESSOR } from '../side-nav-tokens'
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
export class SideNavItemComponent implements OnDestroy {
  static ngAcceptInputType_hierLevel: NumberInput
  static ngAcceptInputType_indentSize: NumberInput
  static ngAcceptInputType_expanded: BooleanInput
  static ngAcceptInputType_compact: BooleanInput
  static ngAcceptInputType_active: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  readonly faAngleLeft = faAngleLeft

  @Input() itemType: 'divider' | 'basic' | 'link' | 'button' | 'title' | undefined | null

  @Input() icon: SeamIcon | undefined | null

  @Input() hideEmptyIcon: boolean | undefined | null

  @Input() label: string | undefined | null

  @Input() @InputBoolean() active = false

  @Input()
  set link(value: string | undefined | null) { this._link.next(value) }
  get link() { return this._link.value }
  private readonly _link = new BehaviorSubject<string | undefined | null>(undefined)
  public readonly link$ = this._link.asObservable()

  @Input() queryParams: { [k: string]: any } | undefined | null

  @Input() children: ISideNavItem[] | undefined | null

  @Input() @InputNumber(0) hierLevel = 0

  @Input() @InputNumber(10) indentSize = 10

  @Input()
  set expanded(value: boolean) { this._expanded.next(coerceBooleanProperty(value)) }
  get expanded() { return this._expanded.value }
  private readonly _expanded = new BehaviorSubject<boolean>(false)
  public readonly expanded$ = this._expanded.asObservable()

  @Input()
  set compact(value: boolean) { this._compact.next(coerceBooleanProperty(value)) }
  get compact() { return this._compact.value }
  private readonly _compact = new BehaviorSubject<boolean>(false)
  public readonly compact$ = this._compact.asObservable()

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
          disabled: false,
          container: 'body'
        }
      } else {
        this._badgeTooltip = {
          ...value,
          placement: value.placement || 'auto',
          disabled: typeof value?.disabled === 'boolean'
            ? value.disabled
            : typeof value.tooltip === 'string' ? false : true,
          container: value.container || 'body'
        }
      }
    } else {
      this._badgeTooltip = undefined
    }
  }
  private _badgeTooltip: SideNavItemBadgeTooltip | undefined | null

  @HostBinding('class.seam-side-nav-item--active') get _isActiveCssClass() { return this.active }

  @HostBinding('attr.data-hier-level') get _attrDataHierLevel() { return this.hierLevel }

  public readonly childGroupAnimState$: Observable<string>
  public readonly compactAnimState$: Observable<string>

  constructor(
    @Inject(THESEAM_SIDE_NAV_ACCESSOR) private readonly _sideNav: SideNavAccessor,
    @Optional() @SkipSelf() @Host() private readonly _parent?: SideNavItemComponent
  ) {
    this.childGroupAnimState$ = this.expanded$
      .pipe(map(expanded => expanded ? EXPANDED_STATE : COLLAPSED_STATE))

    this.compactAnimState$ = this.compact$
      .pipe(map(compact => compact ? COMPACT_STATE : FULL_STATE))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  get hasChildren() {
    return Array.isArray(this.children) && this.children.length > 0
  }

  public toggleChildren(): void {
    this.expanded = !this.expanded
  }

  _linkClicked() {
    // Close nav when link is clicked while in overlay state
    if (this._sideNav.overlay) {
      this._sideNav.collapse()
    }
  }

  get showIconBlock(): boolean {
    return notNullOrUndefined(this.icon) || this.hideEmptyIcon !== true
  }

}
