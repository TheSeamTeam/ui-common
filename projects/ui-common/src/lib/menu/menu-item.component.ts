import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { Subject } from 'rxjs'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { CanDisableCtor, mixinDisabled } from '@theseam/ui-common/core'
import type { ITheSeamMenuPanel } from './menu-panel'
import { THESEAM_MENU_PANEL } from './menu-panel-token'

class TheSeamMenuItemBase {}

const _seamMenuItemMixinBase: CanDisableCtor & typeof TheSeamMenuItemBase =
    mixinDisabled(TheSeamMenuItemBase)

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[seamMenuItem]',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  exportAs: 'seamMenuItem',
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'disabled' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[attr.role]': 'role',
    'class': 'dropdown-item',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemComponent extends _seamMenuItemMixinBase implements OnInit, OnDestroy, FocusableOption {

  /** ARIA role for the menu item. */
  @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem'

  @Input() icon: IconProp | string
  @Input() iconClass: string

  @Input() badgeText: string
  @Input() badgeTheme: string = 'danger'

  /** Stream that emits when the menu item is hovered. */
  readonly _hovered: Subject<MenuItemComponent> = new Subject<MenuItemComponent>()

  /** Whether the menu item is highlighted. */
  _highlighted = false

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) public document: any,
    private _focusMonitor: FocusMonitor,
    @Inject(THESEAM_MENU_PANEL) @Optional() private _parentMenu?: ITheSeamMenuPanel<MenuItemComponent>
  ) {
    super()

    if (_focusMonitor) {
      // Start monitoring the element so it gets the appropriate focused classes. We want
      // to show the focus style for menu items only when the focus was not caused by a
      // mouse or touch interaction.
      _focusMonitor.monitor(this._elementRef, false)
    }

    // console.log(this._parentMenu)
    if (_parentMenu && _parentMenu.addItem) {
      _parentMenu.addItem(this)
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this._focusMonitor) {
      this._focusMonitor.stopMonitoring(this._elementRef)
    }

    if (this._parentMenu && this._parentMenu.removeItem) {
      this._parentMenu.removeItem(this)
    }

    this._hovered.complete()
  }

  /** Focuses the menu item. */
  focus(origin: FocusOrigin = 'program'): void {
    if (this._focusMonitor) {
      this._focusMonitor.focusVia(this._getHostElement(), origin)
    } else {
      this._getHostElement().focus()
    }
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
    const textNodeType = this.document ? this.document.TEXT_NODE : 3
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

}
