import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations'
import { BooleanInput, coerceBooleanProperty, NumberInput } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core'
import { BehaviorSubject, Subject } from 'rxjs'

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import type { SeamIcon } from '@theseam/ui-common/icon'
import type { ThemeTypes } from '@theseam/ui-common/models'

import { MenuComponent } from '@theseam/ui-common/menu'
import { notNullOrUndefined } from '@theseam/ui-common/utils'
import { horizontalNavItemHasActiveChild } from '../nav-utils'
import { INavItem, NavItemBadgeTooltip, NavItemChildAction, NavItemExpandAction } from '../nav.models'
import { TheSeamNavService } from '../nav.service'

@Component({
  selector: 'seam-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss'],
  exportAs: 'seamNavItem',
  animations: [
    trigger('childGroupAnim', [
      transition(':enter', [
        style({ height: 0 }),
        animate('0.2s ease-in-out', style({ height: '*' }))
      ]),
      transition(':leave', [
        style({ height: '*' }),
        animate('0.2s ease-in-out', style({ height: 0 }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NavItemComponent implements OnDestroy {
  static ngAcceptInputType_hierLevel: NumberInput
  static ngAcceptInputType_indentSize: NumberInput
  static ngAcceptInputType_expanded: BooleanInput
  static ngAcceptInputType_compact: BooleanInput
  static ngAcceptInputType_active: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  readonly faAngleLeft = faAngleLeft

  @Input() item: INavItem | undefined | null

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

  @Input() children: INavItem[] | undefined | null

  @Input() @InputNumber(0) hierLevel = 0

  @Input() @InputNumber(10) indentSize = 10

  @Input()
  set expanded(value: boolean) {
    this._expanded.next(coerceBooleanProperty(value))
  }
  get expanded() { return this._expanded.value }
  private readonly _expanded = new BehaviorSubject<boolean>(false)
  public readonly expanded$ = this._expanded.asObservable()

  @Input()
  set compact(value: boolean) { this._compact.next(coerceBooleanProperty(value)) }
  get compact() { return this._compact.value }
  private readonly _compact = new BehaviorSubject<boolean>(false)
  public readonly compact$ = this._compact.asObservable()

  @Input() focused = false

  @Input() badgeText: string | undefined | null
  @Input() badgeTheme: ThemeTypes | undefined | null = 'danger'

  /**
   * Content to provide to assistive technology, such as screen readers.
   */
  @Input() badgeSrContent: string | undefined | null

  @Input()
  get badgeTooltip() { return this._badgeTooltip }
  set badgeTooltip(value: string | NavItemBadgeTooltip | undefined | null) {
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
            : typeof value.tooltip !== 'string'
        }
      }
    } else {
      this._badgeTooltip = undefined
    }
  }
  private _badgeTooltip: NavItemBadgeTooltip | undefined | null

  @Input() childAction: NavItemChildAction = 'menu'

  @Input() expandAction: NavItemExpandAction = 'toggle'

  @Output() navItemExpanded = new EventEmitter<boolean>()

  @HostBinding('class.seam-nav-item--active') get _isActiveCssClass() { return this.active }

  @HostBinding('class.seam-nav-item--child-active') get _isChildActiveCssClass() { return this.hasActiveChild }

  @HostBinding('class.seam-nav-item--expanded') get _isExpandedCssClass() { return this.expanded }

  @HostBinding('class.seam-nav-item--focused') get _isFocusedCssClass() { return this.focused }

  @HostBinding('attr.data-hier-level') get _attrDataHierLevel() { return this.hierLevel }

  @ViewChild(MenuComponent) _menu?: MenuComponent

  @ViewChildren(NavItemComponent) _navItems?: NavItemComponent[]

  constructor(
    private readonly _nav: TheSeamNavService
  ) { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  get hasChildren() {
    return Array.isArray(this.children) && this.children.length > 0
  }

  get hasActiveChild() {
    if (notNullOrUndefined(this.item)) {
      return horizontalNavItemHasActiveChild(this.item)
    }
    return false
  }

  get hasMenuToggle() {
    return this.hasChildren && this.childAction === 'menu'
  }

  get menuTpl(): MenuComponent | undefined {
    return this.hasMenuToggle ? this._menu : undefined
  }

  get hasExpandingChildren() {
    return this.hasChildren && this.childAction === 'expand'
  }

  public _toggleChildren(event: Event): void {
    let ex = !this.expanded
    if (this.expandAction === 'expandOnly') {
      ex = true
    }

    this.expanded = ex
    this.navItemExpanded.emit(this.expanded)
    if (this.item && this.expanded) {
      this._nav.setItemStateProp(this.item, 'focused', this.expanded)
    }

    // Prevents seam-menu from closing out when toggling child expand
    event.stopPropagation()
  }

  // Updates expanded state when user exits seam-menu
  _menuEvent(menuExpanded: any) {
    if (menuExpanded === false) {
      this.expanded = false

      // TODO: figure out why closing seam-menu with expanded submenu messes up animation
      if (this._navItems && this._navItems.length) {
        this._navItems.forEach(navItem => {
          navItem.expanded = false
        })
      }
    }
  }

  get showIconBlock(): boolean {
    return notNullOrUndefined(this.icon) || this.hideEmptyIcon !== true
  }

}
