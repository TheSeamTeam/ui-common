import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

@Component({
  selector: 'seam-widget-tile-footer-item,a[seam-widget-tile-footer-item],button[seam-widget-tile-footer-item]',
  templateUrl: './widget-tile-footer-item.component.html',
  styleUrls: ['./widget-tile-footer-item.component.scss'],
  host: {
    class: 'btn btn-link py-0 px-1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetTileFooterItemComponent {
  static ngAcceptInputType_disabled: BooleanInput

  private _type: string | undefined | null

  @HostBinding('attr.type')
  get _attrType() {
    return this._type || this._isButton() ? 'button' : undefined
  }

  @HostBinding('class.disabled')
  get _DisabledCss() { return this.disabled }

  @Input()
  get type(): string | undefined | null { return this._type }

  @Input() @InputBoolean() disabled = false

  constructor(
    public _elementRef: ElementRef<HTMLElement | HTMLAnchorElement | HTMLButtonElement>,
  ) { }

  /** Determines if the component host is a button. */
  private _isButton(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }
}
