import { animate, group, query, style, transition, trigger, useAnimation, AnimationEvent } from '@angular/animations'
import { FocusKeyManager, FocusOrigin } from '@angular/cdk/a11y'
import { coerceNumberProperty } from '@angular/cdk/coercion'
import { DOWN_ARROW, END, ESCAPE, hasModifierKey, HOME, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@angular/cdk/keycodes'
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core'
import { BehaviorSubject, fromEvent, merge, Observable, of, Subject, Subscription } from 'rxjs'

import { distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { menuDropdownPanelIn, menuDropdownPanelOut, menuDropdownPanelSlideIn, menuDropdownPanelSlideOut } from './menu-animations'
import { MenuItemComponent } from './menu-item.component'
import { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'

import { MenuFooterComponent } from './menu-footer/menu-footer.component'
import { MenuHeaderComponent } from './menu-header/menu-header.component'
import { Direction } from '@angular/cdk/bidi'

let menuPanelUid = 0

/** Reason why the menu was closed. */
export type MenuCloseReason = void | 'click' | 'keydown' | 'tab'

export const LIB_MENU: any = {
  provide: THESEAM_MENU_PANEL,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => MenuComponent)
}

@Component({
  selector: 'seam-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [ LIB_MENU ],
  animations: [
    trigger('slideDown', [
      transition(':enter', useAnimation(menuDropdownPanelIn)),
      transition(':leave', useAnimation(menuDropdownPanelOut)),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'seamMenu'
})
export class MenuComponent implements OnDestroy, AfterContentInit, ITheSeamMenuPanel {

  private readonly _ngUnsubscribe = new Subject<void>()

  readonly panelId = `menu-panel-${menuPanelUid++}`

  private _footer = new BehaviorSubject<MenuFooterComponent | undefined | null>(undefined)
  public hasFooter$ = this._footer.pipe(map(v => v !== null && v !== undefined))

  private _header = new BehaviorSubject<MenuHeaderComponent | undefined | null>(undefined)
  public hasHeader$ = this._header.pipe(map(v => v !== null && v !== undefined))

  private _keyManager?: FocusKeyManager<MenuItemComponent>

  /** Menu items inside the current menu. */
  private _items: MenuItemComponent[] = []

  /** Emits whenever the amount of menu items changes. */
  private _itemChanges = new Subject<MenuItemComponent[]>()

  /** Subscription to tab events on the menu panel */
  private _tabSubscription = Subscription.EMPTY

  /** Parent menu of the current menu panel. */
  parentMenu: ITheSeamMenuPanel | undefined

  /** Layout direction of the menu. */
  direction: Direction | undefined

  /** Emits whenever an animation on the menu completes. */
  readonly _animationDone = new Subject<AnimationEvent>()

  /** Whether the menu is animating. */
  _isAnimating = false

  @ViewChild(TemplateRef) templateRef?: TemplateRef<any>

  @Output() readonly closed = new EventEmitter<MenuCloseReason>()

  @Input() menuClass: string | undefined | null

  /**
   * Defines a width for a menu that will scale down if the window innerWidth is
   * smaller than the value.
   */
  @Input()
  get baseWidth() { return this._baseWidth.value }
  set baseWidth(value: number | null) {
    const _val = coerceNumberProperty(value, null)
    if (_val !== this._baseWidth.value) {
      this._baseWidth.next(_val)
    }
  }
  private _baseWidth = new BehaviorSubject<number | null>(null)
  _menuWidth$: Observable<string | undefined>

  @Input() animationType: 'slide' | 'fade' = 'slide'

  constructor() {
    this._menuWidth$ = this._baseWidth.pipe(
      switchMap(baseWidth => {
        if (baseWidth) {
          return fromEvent(window, 'resize').pipe(
            startWith(undefined),
            map(() => window.innerWidth < baseWidth ? `${window.innerWidth}px` : `${baseWidth}px`)
          )
        }
        return of(undefined)
      }),
      distinctUntilChanged(),
      takeUntil(this._ngUnsubscribe)
    )
  }

  ngOnDestroy() {
    this._tabSubscription.unsubscribe()
    this.closed.complete()

    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager<MenuItemComponent>(this._items).withWrap().withTypeAhead()
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'))
  }

  /** Stream that emits whenever the hovered menu item changes. */
  _hovered(): Observable<MenuItemComponent> {
    return this._itemChanges.pipe(
      startWith(this._items),
      switchMap(items => merge(...items.map(item => item._hovered)))
    )
  }

  /** Handle a keyboard event from the menu, delegating to the appropriate action. */
  _handleKeydown(event: KeyboardEvent) {
    // tslint:disable-next-line:deprecation
    const keyCode = event.keyCode
    const manager = this._keyManager

    switch (keyCode) {
      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault()
          this.closed.emit('keydown')
        }
        break
      case LEFT_ARROW:
        if (this.parentMenu && this.direction === 'ltr') {
          this.closed.emit('keydown')
        }
        break
      case RIGHT_ARROW:
        if (this.parentMenu && this.direction === 'rtl') {
          this.closed.emit('keydown')
        }
        break
      case HOME:
      case END:
        if (!hasModifierKey(event)) {
          keyCode === HOME ? manager?.setFirstItemActive() : manager?.setLastItemActive()
          event.preventDefault()
        }
        break
      default:
        if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
          manager?.setFocusOrigin('keyboard')
        }

        manager?.onKeydown(event)
    }
  }

  /**
   * Focus the first item in the menu.
   * @param origin Action from which the focus originated. Used to set the correct styling.
   */
  focusFirstItem(origin: FocusOrigin = 'program'): void {
    this._keyManager?.setFocusOrigin(origin).setFirstItemActive()
  }

  /**
   * Resets the active item in the menu. This is used when the menu is opened, allowing
   * the user to start from the first option when pressing the down arrow.
   */
  resetActiveItem() {
    this._keyManager?.setActiveItem(-1)
  }

  /** Registers a menu item with the menu. */
  addItem(item: MenuItemComponent) {
    // We register the items through this method, rather than picking them up through
    // `ContentChildren`, because we need the items to be picked up by their closest
    // `seam-menu` ancestor. If we used `@ContentChildren(MenuItemComponent, {descendants: true})`,
    // all descendant items will bleed into the top-level menu in the case where the consumer
    // has `seam-menu` instances nested inside each other.
    if (this._items.indexOf(item) === -1) {
      this._items.push(item)
      this._itemChanges.next(this._items)
    }
  }

  /** Removes an item from the menu. */
  removeItem(item: MenuItemComponent) {
    const index = this._items.indexOf(item)

    if (this._items.indexOf(item) > -1) {
      this._items.splice(index, 1)
      this._itemChanges.next(this._items)
    }
  }

  /** Sets the footer component. */
  setFooter(footer?: MenuFooterComponent) {
    this._footer.next(footer)
  }

  /** Sets the header component. */
  setHeader(header?: MenuHeaderComponent) {
    this._header.next(header)
  }

  _dropdownMenuClick(event: Event) {
    // This is needed, because some menu's will get stuck open if the component
    // managing the menu is destroyed before the menu finishes its cleanup. I
    // may look for a fix to that eventually.
    this.closed.emit('click')
  }

  /** Callback that is invoked when the panel animation completes. */
  _onAnimationDone(event: AnimationEvent) {
    this._animationDone.next(event)
    this._isAnimating = false
  }

  _onAnimationStart(event: AnimationEvent) {
    this._isAnimating = true

    // Scroll the content element to the top as soon as the animation starts. This is necessary,
    // because we move focus to the first item while it's still being animated, which can throw
    // the browser off when it determines the scroll position. Alternatively we can move focus
    // when the animation is done, however moving focus asynchronously will interrupt screen
    // readers which are in the process of reading out the menu already. We take the `element`
    // from the `event` since we can't use a `ViewChild` to access the pane.
    if (event.toState === 'enter' && this._keyManager?.activeItemIndex === 0) {
      event.element.scrollTop = 0
    }
  }

}
