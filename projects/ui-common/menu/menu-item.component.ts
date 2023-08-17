import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { DOCUMENT } from '@angular/common'
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnDestroy, Optional } from '@angular/core'
import { Subject } from 'rxjs'

import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { CanDisableCtor, mixinDisabled } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import type { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'

class TheSeamMenuItemBase {}

const _seamMenuItemMixinBase: CanDisableCtor & typeof TheSeamMenuItemBase =
    mixinDisabled(TheSeamMenuItemBase)

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[seamMenuItem]',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  exportAs: 'seamMenuItem',
  inputs: [ 'disabled' ],
  host: {
    '[attr.role]': 'role',
    'class': 'seam-menu-item dropdown-item',
    '[class.seam-menu-item-highlighted]': '_highlighted',
    '[class.seam-menu-item-submenu-trigger]': '_triggersSubmenu',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemComponent extends _seamMenuItemMixinBase implements OnDestroy, AfterViewInit, FocusableOption {

  /** ARIA role for the menu item. */
  @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' | undefined | null = 'menuitem'

  @Input() icon: SeamIcon | string | undefined | null
  @Input() iconClass: string | undefined | null

  @Input() sublevelIcon: SeamIcon | string | undefined | null = faCaretRight
  @Input() subLevelIconClass: string | undefined | null

  @Input() badgeText: string | undefined | null
  @Input() badgeTheme: string | undefined | null = 'danger'

  /** Stream that emits when the menu item is hovered. */
  readonly _hovered = new Subject<MenuItemComponent>()

  /** Stream that emits when the menu item is focused. */
  readonly _focused = new Subject<MenuItemComponent>()

  /** Whether the menu item is highlighted. */
  _highlighted = false

  /** Whether the menu item acts as a trigger for a sub-menu. */
  _triggersSubmenu = false

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) public readonly _document: any,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    @Inject(THESEAM_MENU_PANEL) @Optional() private readonly _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>
  ) {
    super()

    // console.log(this._parentMenu)
    if (_parentMenu && _parentMenu.addItem) {
      _parentMenu.addItem(this)
    }
  }

  ngOnDestroy() {
    if (this._focusMonitor) {
      this._focusMonitor.stopMonitoring(this._elementRef)
    }

    if (this._parentMenu && this._parentMenu.removeItem) {
      this._parentMenu.removeItem(this)
    }

    this._hovered.complete()
    this._focused.complete()
  }

  ngAfterViewInit() {
    if (this._focusMonitor) {
      // Start monitoring the element, so it gets the appropriate focused classes. We want
      // to show the focus style for menu items only when the focus was not caused by a
      // mouse or touch interaction.
      this._focusMonitor.monitor(this._elementRef, false)
    }
  }

  /** Focuses the menu item. */
  focus(origin: FocusOrigin = 'program'): void {
    if (this._focusMonitor) {
      this._focusMonitor.focusVia(this._getHostElement(), origin)
    } else {
      this._getHostElement().focus()
    }
    this._focused.next(this)
  }

  /** Used to set the `tabindex`. */
  _getTabIndex(): string {
    return this.disabled ? '-1' : '0'
  }

  /** Returns the host DOM element. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement
  }

  /** Prevents the default element actions if it is disabled. */
  @HostListener('click', ['$event'])
  _checkDisabled(event: Event): void {
    if (this.disabled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  /** Emits to the hover stream. */
  @HostListener('mouseenter')
  _handleMouseEnter() {
    this._hovered.next(this)
  }

  /** Gets the label to be used when determining whether the option should be focused. */
  getLabel(): string {
    const element: HTMLElement = this._elementRef.nativeElement
    const textNodeType = this._document ? this._document.TEXT_NODE : 3
    let output = ''

    if (element.childNodes) {
      const length = element.childNodes.length

      // Go through all the top-level text nodes and extract their text.
      // We skip anything that's not a text node to prevent the text from
      // being thrown off by something like an icon.
      for (let i = 0; i < length; i++) {
        if (element.childNodes[i].nodeType === textNodeType) {
          output += element.childNodes[i].textContent
        }
      }
    }

    return output.trim()
  }

  _setHighlighted(isHighlighted: boolean) {
    this._highlighted = isHighlighted
    this._changeDetectorRef?.markForCheck()
  }

  _setTriggersSubmenu(triggersSubmenu: boolean) {
    this._triggersSubmenu = triggersSubmenu
    this._changeDetectorRef?.markForCheck()
  }

  _hasFocus(): boolean {
    return this._document && this._document.activeElement === this._getHostElement()
  }
}
