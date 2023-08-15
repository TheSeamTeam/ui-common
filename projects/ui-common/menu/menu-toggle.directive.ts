import { FocusMonitor, FocusOrigin, isFakeMousedownFromScreenReader } from '@angular/cdk/a11y'
import { Direction, Directionality } from '@angular/cdk/bidi'
import { DOWN_ARROW, ESCAPE, UP_ARROW } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay'
import { normalizePassiveListenerOptions } from '@angular/cdk/platform'
import { TemplatePortal } from '@angular/cdk/portal'
import { AfterContentInit, ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, inject, Inject, Input, OnDestroy, Optional, Output, Self, ViewContainerRef } from '@angular/core'
import { asapScheduler, delay, filter, merge, Observable, of, Subscription, take, takeUntil } from 'rxjs'

import { MenuItemComponent } from './menu-item.component'
import { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'
import { MenuCloseReason, MenuComponent } from './menu.component'

declare const ngDevMode: any

/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true })

@Directive({
  selector: '[seamMenuToggle]',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'class': 'seam-menu-toggle',
    'aria-haspopup': 'true',
    '[attr.aria-expanded]': 'menuOpen() || null',
    '[attr.aria-controls]': 'menuOpen() ? menu.panelId : null',
  },
  exportAs: 'seamMenuToggle'
})
export class MenuToggleDirective implements OnDestroy, AfterContentInit {

  private _active = false
  private _overlayRef?: OverlayRef
  private _menuClosedSubscription = Subscription.EMPTY
  private _closingActionsSubscription = Subscription.EMPTY
  private _hoverSubscription = Subscription.EMPTY
  private readonly _changeDetectorRef = inject(ChangeDetectorRef)

  public restoreFocus = true

  // Tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  _openedBy: 'mouse' | 'touch' | null = null

  @Input('seamMenuToggle')
  get menu() { return this._menu }
  set menu(menu: MenuComponent | undefined | null) {
    if (menu === this._menu) {
      return
    }

    this._menu = menu
    this._menuClosedSubscription.unsubscribe()

    if (menu) {
      if (menu === this._parentMenuComponent && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error(
          `seamMenuToggle: menu cannot contain its own trigger. Assign a menu that is ` +
          `not a parent of the trigger or move the trigger outside of the menu.`,
        )
      }

      this._menuClosedSubscription = menu.closed.subscribe((reason: MenuCloseReason) => {
        // this._destroyMenu(reason)
        this.closeMenu()

        // If a click closed the menu, we should close the entire chain of nested menus.
        if ((reason === 'click' || reason === 'tab') && this._parentMenuComponent) {
          this._parentMenuComponent.closed.emit(reason)
        }
      })
    }

    this._menuItemInstance?._setTriggersSubmenu(this.triggersSubmenu())
  }
  _menu: MenuComponent | undefined | null

  @Input()
  set positions(val: ConnectionPositionPair[]) {
    this._positions = val
    if (this.menuOpen()) {
      this._overlayRef?.updatePositionStrategy(this.getOverlayPosition(this._elementRef.nativeElement))
    }
  }
  get positions() {
    const positions = this._positions

    if (this.triggersSubmenu()) {
      return [
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
      ]
    }

    return positions
  }
  private _positions: ConnectionPositionPair[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ]

  /** Event emitted when the associated menu is opened. */
  @Output() readonly menuOpened = new EventEmitter<void>()

  /** Event emitted when the associated menu is opened. */
  @Output() readonly menuClosed = new EventEmitter<void>()

  @HostListener('mousedown', [ '$event' ])
  _onMouseDown(event: MouseEvent) {
    if (!isFakeMousedownFromScreenReader(event)) {
      // Since right or middle button clicks won't trigger the `click` event,
      // we shouldn't consider the menu as opened by mouse in those cases.
      this._openedBy = event.button === 0 ? 'mouse' : null

      // Since clicking on the trigger won't close the menu if it opens a sub-menu,
      // we should prevent focus from moving onto it via click to avoid the
      // highlight from lingering on the menu item.
      if (this.triggersSubmenu()) {
        event.preventDefault()
      }
    }
  }

  @HostListener('keydown', [ '$event' ])
  _onKeydown(event: any) {
    this._openedBy = null
    // console.log('keydown', event)

    // tslint:disable-next-line:deprecation
    const keyCode = event.keyCode

    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
      if (this.menuOpen()) {
        this.menu?.focusFirstItem(this._openedBy || 'program')
      }
    } else if (keyCode === ESCAPE) {
      this.closeMenu()
    }
  }

  @HostListener('click', [ '$event' ])
  _onClick(event: any) {
    if (this.triggersSubmenu()) {
      // Stop event propagation to avoid closing the parent menu.
      event.stopPropagation()
      this.openMenu()
    } else {
      this.toggle()
    }
  }

  @HostListener('document:keydown', [ '$event' ])
  _onDocumentKeydown(event: any) {
    if (event.keyCode === ESCAPE) {
      this.closeMenu()
    }
  }

  // @HostListener('document:mousedown', [ '$event' ])
  // _onDocumentMouseDown(event: any) {
  //   console.log('outside click')
  // }

  private readonly _parentMenuComponent?: MenuComponent

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _overlay: Overlay,
    private readonly _focusMonitor: FocusMonitor,
    @Inject(THESEAM_MENU_PANEL) @Optional() private readonly _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>,
    @Optional() @Self() private readonly _menuItemInstance?: MenuItemComponent,
    @Optional() private readonly _dir?: Directionality,
  ) {
    this._parentMenuComponent = this._parentMenu instanceof MenuComponent ? this._parentMenu : undefined

    this._elementRef.nativeElement.addEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)
  }

  ngOnDestroy() {
    this.closeMenu()

    this._elementRef.nativeElement.removeEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)

    this._menuClosedSubscription.unsubscribe()
    this._closingActionsSubscription.unsubscribe()
    this._hoverSubscription.unsubscribe()
  }

  ngAfterContentInit() {
    this._handleHover()
  }

  /**
   * Handles touch start events on the trigger.
   * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
   */
  private _handleTouchStart = () => this._openedBy = 'touch'

  public toggle(): void {
    if (this._active) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  public openMenu(): void {
    if (this._active || !this.menu) { return }
    this._active = true

    this._overlayRef = this._overlay.create({
      hasBackdrop: !this._parentMenuComponent,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.getOverlayPosition(this._elementRef.nativeElement),
    })

    const tpl = this.menu.templateRef
    if (!tpl) {
      throw Error(`Menu template not found.`)
    }

    this._overlayRef.attach(new TemplatePortal(tpl, this._viewContainerRef))

    this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu())
    this._initMenu(this.menu)

    this._menuClosedSubscription = this.menu.closed.subscribe(v => {
      // console.log('closed', v)
      this.closeMenu()
    })

    // this._overlayRef.backdropClick().subscribe(v => {
    //   console.log('backdropClick', v)
    // })
  }

  /** The text direction of the containing app. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr'
  }

  /** Whether the menu triggers a sub-menu or a top-level one. */
  triggersSubmenu(): boolean {
    return !!(this._menuItemInstance && this._parentMenuComponent && this.menu)
  }

  public closeMenu(): void {
    if (!this._active) { return }
    let emitCloseEvent = false
    if (this.menuOpen()) {
      emitCloseEvent = true
    }

    if (this._overlayRef?.hasAttached()) {
      this._overlayRef?.detach()
    }

    this._resetMenu()

    this._elementRef.nativeElement.removeEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)

    this._menuClosedSubscription.unsubscribe()
    this._closingActionsSubscription.unsubscribe()

    if (emitCloseEvent) {
      this.menu?.closed.emit()
    }

    this._active = false
  }

  public menuOpen(): boolean {
    return (this._overlayRef && this._overlayRef.hasAttached()) ?? false
  }

  private getOverlayPosition(origin: HTMLElement): PositionStrategy {
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions(this.positions)
      .withFlexibleDimensions(false)
      .withPush(true)

    return positionStrategy
  }

  /**
   * Focuses the menu trigger.
   * @param origin Source of the menu trigger's focus.
   */
  focus(origin: FocusOrigin = 'program') {
    if (this._focusMonitor) {
      this._focusMonitor.focusVia(this._elementRef, origin)
    } else {
      this._elementRef.nativeElement.focus()
    }
  }

  /**
   * This method sets the menu state to open and focuses the first item if
   * the menu was opened via the keyboard.
   */
  private _initMenu(menu: MenuComponent): void {
    menu.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined
    menu.direction = this.dir
    // this._setMenuElevation(menu)
    menu.focusFirstItem(this._openedBy || 'program')
    this._setIsMenuOpen(true)
  }

  /**
   * This method resets the menu when it's closed, most importantly restoring
   * focus to the menu trigger if the menu was opened via the keyboard.
   */
  private _resetMenu(): void {
    this._setIsMenuOpen(false)

    // We should reset focus if the user is navigating using a keyboard or
    // if we have a top-level trigger which might cause focus to be lost
    // when clicking on the backdrop.
    if (this.restoreFocus) {
      if (!this._openedBy) {
        // Note that the focus style will show up both for `program` and
        // `keyboard` so we don't have to specify which one it is.
        this.focus()
      } else if (!this.triggersSubmenu()) {
        this.focus(this._openedBy)
      }
    }

    this._openedBy = null
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setIsMenuOpen(isOpen: boolean): void {
    if (isOpen !== this.menuOpen()) {
      // this._menuOpen = isOpen
      this.menuOpen() ? this.menuOpened.emit() : this.menuClosed.emit()

      if (this.triggersSubmenu()) {
        this._menuItemInstance?._setHighlighted(isOpen)
      }

      this._changeDetectorRef.markForCheck()
    }
  }

  /** Returns a stream that emits whenever an action that should close the menu occurs. */
  private _menuClosingActions() {
    const backdrop = this._overlayRef?.backdropClick() ?? of()
    const detachments = this._overlayRef?.detachments() ?? of()
    const parentClose = this._parentMenu ? this._parentMenu.closed : of()
    const hover = this._parentMenuComponent ? this._parentMenuComponent._hovered().pipe(
      filter(active => active !== this._menuItemInstance),
      filter(() => this.menuOpen())
    ) : of()

    return merge(backdrop, parentClose as Observable<MenuCloseReason>, hover, detachments)
  }

  /** Handles the cases where the user hovers over the trigger. */
  private _handleHover() {
    // Subscribe to changes in the hovered item in order to toggle the panel.
    if (!this.triggersSubmenu() || !this._parentMenuComponent) {
      return
    }

    this._hoverSubscription = this._parentMenuComponent
      ._hovered()
      // Since we might have multiple competing triggers for the same menu (e.g. a sub-menu
      // with different data and triggers), we have to delay it by a tick to ensure that
      // it won't be closed immediately after it is opened.
      .pipe(
        filter(active => active === this._menuItemInstance && !active.disabled),
        delay(0, asapScheduler),
      )
      .subscribe(() => {
        this._openedBy = 'mouse'

        // If the same menu is used between multiple triggers, it might still be animating
        // while the new trigger tries to re-open it. Wait for the animation to finish
        // before doing so. Also interrupt if the user moves to another item.
        if (this.menu instanceof MenuComponent && this.menu._isAnimating) {
          // We need the `delay(0)` here in order to avoid
          // 'changed after checked' errors in some cases. See #12194.
          this.menu._animationDone
            .pipe(take(1), delay(0, asapScheduler), takeUntil(this._parentMenuComponent!._hovered()))
            .subscribe(() => this.openMenu())
        } else {
          this.openMenu()
        }
      })
  }
}
