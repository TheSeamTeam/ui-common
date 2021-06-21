import { FocusMonitor, FocusOrigin, isFakeMousedownFromScreenReader } from '@angular/cdk/a11y'
import { DOWN_ARROW, ESCAPE, UP_ARROW } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay'
import { normalizePassiveListenerOptions } from '@angular/cdk/platform'
import { TemplatePortal } from '@angular/cdk/portal'
import { Directive, ElementRef, HostListener, Inject, Input, OnDestroy, Optional, ViewContainerRef } from '@angular/core'
import { merge, of, Subscription } from 'rxjs'

import { MenuItemComponent } from './menu-item.component'
import { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'
import { MenuComponent } from './menu.component'

/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({passive: true})

@Directive({
  selector: '[seamMenuToggle]',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'aria-haspopup': 'true',
    '[attr.aria-expanded]': 'menuOpen() || null'
  },
  exportAs: 'seamMenuToggle'
})
export class MenuToggleDirective implements OnDestroy {

  private _active = false
  private _overlayRef?: OverlayRef
  private _menuClosedSubscription = Subscription.EMPTY
  private _closingActionsSubscription = Subscription.EMPTY

  public restoreFocus = true

  // Tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  _openedBy: 'mouse' | 'touch' | null = null

  @Input() seamMenuToggle: MenuComponent | undefined | null

  @Input()
  set positions(val: ConnectionPositionPair[]) {
    this._positions = val
    if (this.menuOpen()) {
      this._overlayRef?.updatePositionStrategy(this.getOverlayPosition(this._elementRef.nativeElement))
    }
  }
  get positions() { return this._positions }
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

  @HostListener('mousedown', [ '$event' ])
  _onMouseDown(event: MouseEvent) {
    if (!isFakeMousedownFromScreenReader(event)) {
      // Since right or middle button clicks won't trigger the `click` event,
      // we shouldn't consider the menu as opened by mouse in those cases.
      this._openedBy = event.button === 0 ? 'mouse' : null

      // Since clicking on the trigger won't close the menu if it opens a sub-menu,
      // we should prevent focus from moving onto it via click to avoid the
      // highlight from lingering on the menu item.
      // if (this.triggersSubmenu()) {
      //   event.preventDefault();
      // }
    }
  }

  @HostListener('keydown', [ '$event' ])
  _onKeydown(event: any) {
    this._openedBy = null

    // tslint:disable-next-line:deprecation
    const keyCode = event.keyCode

    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
      if (this.menuOpen()) {
        this.seamMenuToggle?.focusFirstItem(this._openedBy || 'program')
      }
    }
  }

  @HostListener('click', [ '$event' ])
  _onClick(event: any) {
    this.toggle()
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

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay,
    private _focusMonitor: FocusMonitor,
    // @Inject(THESEAM_MENU_PANEL) @Optional() private _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>
  ) {
    this._elementRef.nativeElement.addEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)
  }

  ngOnDestroy() {
    this.closeMenu()

    this._elementRef.nativeElement.removeEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)

    this._menuClosedSubscription.unsubscribe()
    this._closingActionsSubscription.unsubscribe()
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
    if (this._active || !this.seamMenuToggle) { return }
    this._active = true

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'transparent',
      positionStrategy: this.getOverlayPosition(this._elementRef.nativeElement),
    })

    const tpl = this.seamMenuToggle.templateRef
    if (!tpl) {
      throw Error(`Menu template not found.`)
    }

    this._overlayRef.attach(new TemplatePortal(tpl, this._viewContainerRef))

    this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu())
    this._initMenu()

    this._menuClosedSubscription = this.seamMenuToggle.closed.subscribe(v => {
      // console.log('closed', v)
      this.closeMenu()
    })

    // this._overlayRef.backdropClick().subscribe(v => {
    //   console.log('backdropClick', v)
    // })
  }

  public closeMenu(): void {
    if (!this._active) { return }

    if (this._overlayRef?.hasAttached()) {
      this._overlayRef?.detach()
    }

    this._resetMenu()

    this._menuClosedSubscription.unsubscribe()
    this._closingActionsSubscription.unsubscribe()

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
  private _initMenu(): void {
    // this.seamMenuToggle.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined
    // this.seamMenuToggle.direction = this.dir
    // this._setMenuElevation()
    // this._setIsMenuOpen(true)
    // this.seamMenuToggle.focusFirstItem(this._openedBy || 'program')
  }

  /**
   * This method resets the menu when it's closed, most importantly restoring
   * focus to the menu trigger if the menu was opened via the keyboard.
   */
  private _resetMenu(): void {
    // this._setIsMenuOpen(false)

    // We should reset focus if the user is navigating using a keyboard or
    // if we have a top-level trigger which might cause focus to be lost
    // when clicking on the backdrop.
    if (this.restoreFocus) {
      if (!this._openedBy) {
        // Note that the focus style will show up both for `program` and
        // `keyboard` so we don't have to specify which one it is.
        this.focus()
      }
      // else if (!this.triggersSubmenu()) {
      //   this.focus(this._openedBy)
      // }
    }

    this._openedBy = null
  }

  /** Returns a stream that emits whenever an action that should close the menu occurs. */
  private _menuClosingActions() {
    const backdrop = this._overlayRef?.backdropClick() ?? of()
    const detachments = this._overlayRef?.detachments() ?? of()
    // const parentClose = this._parentMenu ? this._parentMenu.closed : of()
    const parentClose = of()
    // const hover = this._parentMenu ? this._parentMenu._hovered().pipe(
    //   filter(active => active !== this._menuItemInstance),
    //   filter(() => this._menuOpen)
    // ) : of()
    const hover = of()

    return merge(backdrop, parentClose, hover, detachments)
  }

}
