import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core'

@Component({
  selector: 'seam-widget-tile-footer-item,a[seam-widget-tile-footer-item],button[seam-widget-tile-footer-item]',
  templateUrl: './widget-tile-footer-item.component.html',
  styleUrls: ['./widget-tile-footer-item.component.scss'],
  host: {
    class: 'btn btn-link py-0 px-1'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetTileFooterItemComponent implements OnInit {

  private _type: string

  @HostBinding('attr.type')
  get _attrType() {
    return this._type || this._isButton() ? 'button' : undefined
  }

  @HostBinding('class.disabled')
  get _DisabledCss() { return this.disabled }

  @Input()
  get type(): string { return this._type }

  @Input() disabled = false

  constructor(
    public _elementRef: ElementRef<HTMLElement | HTMLAnchorElement | HTMLButtonElement>
  ) { }

  ngOnInit() { }

  /** Determines if the component host is a button. */
  private _isButton(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }
}
