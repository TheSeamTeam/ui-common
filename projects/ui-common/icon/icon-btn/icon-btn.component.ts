import { BooleanInput } from '@angular/cdk/coercion'
import { Component, DoCheck, ElementRef, HostBinding, Input, Renderer2 } from '@angular/core'

import { SizeProp } from '@fortawesome/fontawesome-svg-core'

import { InputBoolean } from '@theseam/ui-common/core'
import type { ThemeTypes } from '@theseam/ui-common/models'

import type { SeamIcon } from '../icon'
import type { TheSeamIconType } from '../icon/icon.component'

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seamIconBtn]',
  template: `
    <seam-icon *ngIf="icon"
      [grayscaleOnDisable]="grayscaleOnDisable"
      [disabled]="disabled"
      [iconClass]="iconClass"
      [icon]="icon"
      [size]="size"
      [showDefaultOnError]="showDefaultOnError"
      [iconType]="iconType">
    </seam-icon>
    <ng-content select=".sr-only,seam-icon-notification"></ng-content>
  `,
  styles: [],
  host: {
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
})
export class IconBtnComponent implements DoCheck {
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_showDefaultOnError: BooleanInput

  /** Toggles whether the img/icon will attempt to be grayscale when disabled is true. */
  @Input() @InputBoolean() grayscaleOnDisable = true

  /** Toggles the img/icon to grayscale if `grayscaleOnDisable` is true. */
  @Input() @InputBoolean() disabled = false

  /**
   * Placed on the `.seam-icon--fa` and `seam-icon--img` elements.
   */
  @Input() iconClass: string | undefined | null

  /**
   * The icon to display.
   *
   * If the input icon is a string an `img` element will be used with icon as `src`.
   * If the input is not a string it will be assumed to be a font-awesome IconProp object.
   */
  @Input() icon: SeamIcon | undefined | null

  /**
   * NOTE: Only works for fa-icon for now.
   */
  @Input() size: SizeProp | undefined | null

  /**
   * Toggles whether an image that has thrown the `onerror` event should show
   * the `defaultIcon` instead.
   */
   @Input() @InputBoolean() showDefaultOnError = false

  /**
   * Shown if icon is not set or if showDefaultOnError is true and img has thrown an error.
   *
   * NOTE: Not supported for icon-btn yet.
   */
  // @Input() defaultIcon: SeamIcon

  @Input() iconType: TheSeamIconType | undefined | null = 'image-fill'

  @HostBinding('class.p-0') _cssPadding0 = true

  @HostBinding('class.btn') _btn = true
  @HostBinding('class.text-nowrap') _textNoWrap = true

  @HostBinding('class.btn-default') get _btnDefault() { return this.isBtnTheme('default') }
  @HostBinding('class.btn-primary') get _btnPrimary() { return this.isBtnTheme('primary') }
  @HostBinding('class.btn-secondary') get _btnSecondary() { return this.isBtnTheme('secondary') }
  @HostBinding('class.btn-success') get _btnSuccess() { return this.isBtnTheme('success') }
  @HostBinding('class.btn-danger') get _btnDanger() { return this.isBtnTheme('danger') }
  @HostBinding('class.btn-warning') get _btnWarning() { return this.isBtnTheme('warning') }
  @HostBinding('class.btn-info') get _btnInfo() { return this.isBtnTheme('info') }
  @HostBinding('class.btn-light') get _btnLight() { return this.isBtnTheme('light') }
  @HostBinding('class.btn-dark') get _btnDark() { return this.isBtnTheme('dark') }
  @HostBinding('class.btn-lightgray') get _btnLightGray() { return this.isBtnTheme('lightgray') }

  @HostBinding('class.btn-sm') get _btnSizeSm() { return this.btnSize === 'sm' }
  @HostBinding('class.btn-lg') get _btnSizeLg() { return this.btnSize === 'lg' }

  @Input() btnTheme: ThemeTypes | undefined | null = 'default'
  @Input() badgeTheme: ThemeTypes | undefined | null = 'light'
  @Input() badgeText: string | undefined | null = ''

  @Input() btnSize: 'sm' | 'lg' | undefined | null

  @Input()
  get type(): string | undefined | null { return this._type }
  set type(value: string | undefined | null) {
    this._type = value
  }
  private _type: string | undefined | null

  @Input()
  get role(): string | undefined | null { return this._role }
  set role(value: string | undefined | null) {
    this._role = value
  }
  private _role: string | undefined | null

  constructor(
    private _elementRef: ElementRef<HTMLButtonElement | HTMLAnchorElement>,
    private _renderer: Renderer2
  ) { }

  ngDoCheck() {
    if (this._isButton()) {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'type', this._type || 'button')
    } else if (this._isAnchor()) {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'role', this._role || 'button')
    }
  }

  public isBtnTheme(type: ThemeTypes): boolean {
    return this.btnTheme === type
  }

  protected _isButton() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

  protected _isAnchor() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

}
