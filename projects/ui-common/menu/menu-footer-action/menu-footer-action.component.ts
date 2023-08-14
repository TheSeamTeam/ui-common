import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core'

// TODO: Split up the button and anchor classes.

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seamMenuFooterAction],a[seamMenuFooterAction]',
  templateUrl: './menu-footer-action.component.html',
  styleUrls: ['./menu-footer-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuFooterActionComponent {

  @HostBinding('attr.type') get _attrType() { return this.type }

  /** ARIA type for the button. */
  @Input()
  get type() { return this._isButton() ? this._type || 'button' : undefined }
  set type(value: 'button' | 'submit' | 'reset' | undefined | null) {
    this._type = value
  }
  private _type: 'button' | 'submit' | 'reset' | undefined | null

  @HostBinding('class.btn') get _classBtn() { return this._isButton() }
  @HostBinding('class.btn-link') get _classBtnLink() { return this._isButton() }

  @HostBinding('style.padding.px') get _stylePadding() { return this._isButton() && 0 }
  @HostBinding('style.border.px') get _styleBorder() { return this._isButton() && 0 }
  @HostBinding('style.display.px') get _styleDisplay() { return this._isButton() && 'inline' }

  constructor(
    private _elementRef: ElementRef
  ) { }

  /** Determines if the component host is a button. */
  protected _isButton() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

  /** Determines if the component host is an anchor. */
  protected _isAnchor() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

}
