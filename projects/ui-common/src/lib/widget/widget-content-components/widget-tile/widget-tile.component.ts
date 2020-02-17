import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, ContentChild, ElementRef, HostBinding, Input, OnInit } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'

@Component({
  selector: 'seam-widget-tile, a[seam-widget-tile], button[seam-widget-tile]',
  templateUrl: './widget-tile.component.html',
  styleUrls: ['./widget-tile.component.scss']
})
export class WidgetTileComponent implements OnInit {

  private _type: string

  @HostBinding('attr.type')
  get _attrType() {
    return this._type || this._isButton() ? 'button' : undefined
  }

  @HostBinding('class.btn')
  get _btnCss() { return this._isButton() ? true : false }

  @HostBinding('class.disabled')
  get _DisabledCss() { return this.disabled }

  @Input()
  get type(): string { return this._type }

  @Input() icon: string | IconProp

  @Input()
  get disabled(): boolean { return this._disabled }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value) }
  private _disabled: boolean  = false

  @Input() grayscaleOnDisable = true

  @Input() iconClass: string

  @Input() notificationIcon: string | IconProp
  @Input() notificationIconClass: string

  @ContentChild(WidgetTileSecondaryIconDirective, { static: true }) secondaryIcon: WidgetTileSecondaryIconDirective

  constructor(
    public _elementRef: ElementRef<HTMLElement | HTMLAnchorElement | HTMLButtonElement>
  ) { }

  ngOnInit() { }

  /** Determines if the component host is a button. */
  private _isButton(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

}
