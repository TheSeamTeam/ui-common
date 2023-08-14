import { Component, ElementRef, HostBinding, Input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'seam-widget-empty-label,a[seam-widget-empty-label],button[seam-widget-empty-label]',
  templateUrl: './widget-empty-label.component.html',
  styleUrls: ['./widget-empty-label.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WidgetEmptyLabelComponent {

  private _type: string | undefined | null

  @HostBinding('class.btn')
  get _btnCss() { return !!this._isButton() }

  @HostBinding('class.btn-link')
  get _btnLinkCss() { return !!this._isButton() }

  @HostBinding('attr.type')
  get _attrType() {
    return this._type || this._isButton() ? 'button' : undefined
  }

  @Input()
  get type(): string | undefined | null { return this._type }

  constructor(
    public _elementRef: ElementRef<HTMLElement | HTMLAnchorElement | HTMLButtonElement>
  ) { }

  /** Determines if the component host is a button. */
  private _isButton(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

  /** Determines if the component host is an anchor. */
  private _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

}
