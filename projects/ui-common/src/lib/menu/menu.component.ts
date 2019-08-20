import { animate, group, query, style, transition, trigger, useAnimation } from '@angular/animations'
import { FocusKeyManager, FocusOrigin } from '@angular/cdk/a11y'
import { DOWN_ARROW, END, ESCAPE, hasModifierKey, HOME, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@angular/cdk/keycodes'
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core'
import { merge, Observable, Subject, Subscription } from 'rxjs'

import { startWith, switchMap } from 'rxjs/operators'
import { menuDropdownPanelSlideIn, menuDropdownPanelSlideOut } from './menu-animations'
import { MenuItemComponent } from './menu-item.component'
import { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'

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

  constructor() { }

  ngOnInit() { }

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
    console.log('focusFirstItem', this._items, origin)
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

}
