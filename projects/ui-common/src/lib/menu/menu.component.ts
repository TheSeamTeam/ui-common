import { animate, group, query, style, transition, trigger, useAnimation } from '@angular/animations'
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
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core'
import { BehaviorSubject, fromEvent, merge, Observable, of, Subject, Subscription } from 'rxjs'

import { map, startWith, switchMap } from 'rxjs/operators'
import { menuDropdownPanelSlideIn, menuDropdownPanelSlideOut } from './menu-animations'
import { MenuItemComponent } from './menu-item.component'
import { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'

import { untilDestroyed } from 'ngx-take-until-destroy'
import { MenuFooterComponent } from './menu-footer/menu-footer.component'
import { MenuHeaderComponent } from './menu-header/menu-header.component'

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
      transition(':enter', useAnimation(menuDropdownPanelSlideIn)),
      transition(':leave', useAnimation(menuDropdownPanelSlideOut)),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit, OnDestroy, AfterContentInit, ITheSeamMenuPanel {

  private _footer = new BehaviorSubject<MenuFooterComponent | undefined | null>(undefined)
  public hasFooter$ = this._footer.pipe(map(v => v !== null && v !== undefined))

  private _header = new BehaviorSubject<MenuHeaderComponent | undefined | null>(undefined)
  public hasHeader$ = this._header.pipe(map(v => v !== null && v !== undefined))

  private _keyManager: FocusKeyManager<MenuItemComponent>

  /** Menu items inside the current menu. */
  private _items: MenuItemComponent[] = []

  /** Emits whenever the amount of menu items changes. */
  private _itemChanges = new Subject<MenuItemComponent[]>()

  /** Subscription to tab events on the menu panel */
  private _tabSubscription = Subscription.EMPTY

  /** Parent menu of the current menu panel. */
  parentMenu: ITheSeamMenuPanel | undefined

  @ViewChild(TemplateRef, { static: false }) templateRef: TemplateRef<any>

  @Output() readonly closed = new EventEmitter<void | 'click' | 'keydown' | 'tab'>()

  @Input() menuClass: string

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

  constructor() { }

  ngOnInit() {
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
      untilDestroyed(this)
    )
  }

  ngOnDestroy() {
    this._tabSubscription.unsubscribe()
    this.closed.complete()
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
      // case LEFT_ARROW:
      //   if (this.parentMenu && this.direction === 'ltr') {
      //     this.closed.emit('keydown')
      //   }
      //   break
      // case RIGHT_ARROW:
      //   if (this.parentMenu && this.direction === 'rtl') {
      //     this.closed.emit('keydown')
      //   }
      //   break
      case HOME:
      case END:
        if (!hasModifierKey(event)) {
          keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive()
          event.preventDefault()
        }
        break
      default:
        if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
          manager.setFocusOrigin('keyboard')
        }

        manager.onKeydown(event)
    }
  }

  /**
   * Focus the first item in the menu.
   * @param origin Action from which the focus originated. Used to set the correct styling.
   */
  focusFirstItem(origin: FocusOrigin = 'program'): void {
    this._keyManager.setFocusOrigin(origin).setFirstItemActive()
  }

  /**
   * Resets the active item in the menu. This is used when the menu is opened, allowing
   * the user to start from the first option when pressing the down arrow.
   */
  resetActiveItem() {
    this._keyManager.setActiveItem(-1)
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

}
