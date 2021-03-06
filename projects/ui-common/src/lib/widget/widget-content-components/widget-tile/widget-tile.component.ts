import { FocusMonitor } from '@angular/cdk/a11y'
import { Component, ContentChild, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'

import {
  CanDisableCtor,
  HasElementRef,
  HasRenderer2,
  HasTabIndexCtor,
  mixinDisabled,
  mixinTabIndex,
} from '@lib/ui-common/core'

@Component({ template: '' })
// tslint:disable-next-line: component-class-suffix
class TheSeamWidgetTileBase implements OnDestroy, HasRenderer2, HasElementRef {
  constructor(
    public _elementRef: ElementRef,
    public _focusMonitor: FocusMonitor,
    public _renderer: Renderer2
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
  encapsulation: ViewEncapsulation.None
})
export class WidgetTileComponent extends _TheSeamWidgetTileMixinBase implements OnInit, OnDestroy {

  private _clickUnListen: () => void | undefined | null

  private _type: string

  @HostBinding('attr.type')
  get _attrType() {
    return this._type || this._isButton() ? 'button' : undefined
  }

  @HostBinding('class.btn')
  get _btnCss() { return this._isButton() ? true : false }

  @HostBinding('class.disabled')
  get _disabledCss() { return this.disabled }

  @HostBinding('attr.aria-disabled')
  get _ariaDisabled() { return this.disabled.toString() }

  @HostBinding('attr.disabled')
  get _attrDisabled() { return this.disabled || null }

  @HostBinding('attr.tabindex')
  get _attrTabIndex() { return this.disabled ? -1 : (this.tabIndex || 0) }

  @Input()
  get type(): string { return this._type }

  @Input() icon: string | IconProp

  @Input() grayscaleOnDisable = true

  @Input() iconClass: string

  @Input() notificationIcon: string | IconProp
  @Input() notificationIconClass: string

  @ContentChild(WidgetTileSecondaryIconDirective, { static: true }) secondaryIcon: WidgetTileSecondaryIconDirective

  constructor(
    _elementRef: ElementRef<HTMLElement | HTMLAnchorElement | HTMLButtonElement>,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
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
