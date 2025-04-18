import { FocusMonitor } from '@angular/cdk/a11y'
import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import {
  CanDisableCtor,
  HasElementRef,
  HasRenderer2,
  HasTabIndexCtor,
  InputBoolean,
  mixinDisabled,
  mixinTabIndex,
} from '@theseam/ui-common/core'
import { TheSeamIconType } from '@theseam/ui-common/icon'

import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'

@Component({ template: '' })
// eslint-disable-next-line @angular-eslint/component-class-suffix
class TheSeamWidgetTileBase implements OnDestroy, HasRenderer2, HasElementRef {
  constructor(
    public _elementRef: ElementRef,
    public _focusMonitor: FocusMonitor,
    public _renderer: Renderer2,
  ) {
    this._focusMonitor.monitor(this._elementRef, true)
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef)
  }

  /** Focuses the button. */
  focus(): void {
    this._getHostElement().focus()
  }

  _getHostElement() {
    return this._elementRef.nativeElement
  }
}

const _TheSeamWidgetTileMixinBase: CanDisableCtor & HasTabIndexCtor &
    typeof TheSeamWidgetTileBase = mixinTabIndex(mixinDisabled(TheSeamWidgetTileBase))

// TODO: Should this component be split into separate components for button and anchor.
@Component({
  selector: 'seam-widget-tile, a[seam-widget-tile], button[seam-widget-tile]',
  templateUrl: './widget-tile.component.html',
  styleUrls: ['./widget-tile.component.scss'],
  inputs: [ 'disabled' ],
  exportAs: 'seamWidgetTile',
  encapsulation: ViewEncapsulation.None,
})
export class WidgetTileComponent extends _TheSeamWidgetTileMixinBase implements OnInit, OnDestroy {
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput

  private _clickUnListen: (() => void | undefined | null) | undefined | null

  private _type: string | undefined | null

  @HostBinding('attr.type')
  get _attrType() {
    return this._type || this._isButton() ? 'button' : undefined
  }

  @HostBinding('class.btn')
  get _btnCss() { return !!this._isButton() }

  @HostBinding('class.disabled')
  get _disabledCss() { return this.disabled }

  @HostBinding('attr.aria-disabled')
  get _ariaDisabled() { return this.disabled.toString() }

  @HostBinding('attr.disabled')
  get _attrDisabled() { return this.disabled || null }

  @HostBinding('attr.tabindex')
  get _attrTabIndex() { return this.disabled ? -1 : (this.tabIndex || 0) }

  @Input()
  get type(): string | undefined | null { return this._type }

  @Input() icon: string | IconProp | undefined | null

  @Input() @InputBoolean() grayscaleOnDisable = true

  @Input() iconClass: string | undefined | null

  @Input() iconType: TheSeamIconType | undefined | null = 'styled-square'

  @Input() notificationIcon: string | IconProp | undefined | null
  @Input() notificationIconClass: string | undefined | null

  @ContentChild(WidgetTileSecondaryIconDirective, { static: true }) secondaryIcon?: WidgetTileSecondaryIconDirective

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    _elementRef: ElementRef<HTMLElement | HTMLAnchorElement | HTMLButtonElement>,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2,
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnInit() {
    if (this._isAnchor()) {
      this._clickUnListen = this._renderer.listen(this._getHostElement(), 'click', this._haltDisabledEvents)
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy()
    if (this._clickUnListen) {
      this._clickUnListen()
    }
  }

  /** Determines if the component host is a button. */
  private _isButton(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

  /** Determines if the component host is an anchor. */
  private _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

  _haltDisabledEvents = (event: Event) => {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

}
