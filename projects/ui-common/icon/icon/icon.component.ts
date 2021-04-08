import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, HostBinding, Input } from '@angular/core'

import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'

import { InputBoolean } from '@theseam/ui-common/core'

import { SeamIcon } from '../icon'

//
// TODO: Ensure all inputs correctly update the state whenever changed, not just
// on initial load.
//

// Browsers that do not support css grayscale filter.
const needToFix = /(MSIE 10)|(Trident.*rv:11\.0)|( Edge\/[\d\.]+$)/.test(navigator.userAgent)

export type TheSeamIconType = 'borderless-styled-square' | 'styled-square' | 'image-fill' | undefined

@Component({
  selector: 'seam-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_showDefaultOnError: BooleanInput

  needToFix = needToFix

  /** Toggles whether the img/icon will attempt to be grayscale when disabled is true. */
  @Input() @InputBoolean() grayscaleOnDisable: boolean = true

  /** Toggles the img/icon to grayscale if `grayscaleOnDisable` is true. */
  @Input() @InputBoolean() disabled: boolean = false

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
  @Input()
  get icon(): SeamIcon | undefined | null { return this._iconUrl || this._iconObj }
  set icon(value: SeamIcon | undefined | null) {
    if (typeof value === 'string') {
      this._iconUrl = value
      this._iconObj = undefined
    } else {
      this._iconUrl = undefined
      this._iconObj = value
    }

    this._iconUrlBeforeError = undefined
    this._iconObjBeforeError = undefined

    if (!this._iconUrl && !this._iconObj) {
      this._iconUrl = this._defaultIconUrl
      this._iconObj = this._defaultIconObj
    }
  }

  public _iconUrl: string | undefined | null
  public _iconObj: IconProp | undefined | null

  private _iconUrlBeforeError: string | undefined | null
  private _iconObjBeforeError: IconProp | undefined | null

  /**
   * NOTE: Only works for fa-icon for now.
   */
  @Input() size: SizeProp | undefined | null

  /**
   * Toggles whether an image that has thrown the `onerror` event should show
   * the `defaultIcon` instead.
   */
  @Input()
  get showDefaultOnError(): boolean { return this._showDefaultOnError }
  set showDefaultOnError(value: boolean) {
    this._showDefaultOnError = coerceBooleanProperty(value)
    if (this._hasError) {
      if (this._iconUrlBeforeError || this._iconObjBeforeError) {
        this._iconUrl = this._iconUrlBeforeError
        this._iconObj = this._iconObjBeforeError
        this._iconUrlBeforeError = undefined
        this._iconObjBeforeError = undefined
      } else if (this._showDefaultOnError) {
        this._iconUrl = this._defaultIconUrl
        this._iconObj = this._defaultIconObj
      }
    }
  }
  private _showDefaultOnError = false

  /**
   * Shown if icon is not set or if showDefaultOnError is true and img has thrown an error.
   */
  @Input()
  get defaultIcon(): SeamIcon | undefined | null { return this._defaultIconUrl || this._defaultIconObj }
  set defaultIcon(value: SeamIcon | undefined | null) {
    if (typeof value === 'string') {
      this._defaultIconUrl = value
      this._defaultIconObj = undefined
    } else {
      this._defaultIconUrl = undefined
      this._defaultIconObj = value
    }

    if (!this._defaultIconUrl && !this._defaultIconObj) {
      this._iconUrl = this._iconUrlBeforeError
      this._iconObj = this._iconObjBeforeError
    }

    if (!this._iconUrl && !this._iconObj) {
      this._iconUrl = this._defaultIconUrl
      this._iconObj = this._defaultIconObj
    }
  }

  public _defaultIconUrl: string | undefined | null
  public _defaultIconObj: IconProp | undefined | null

  @Input() iconType: TheSeamIconType

  @HostBinding('attr.icon-type')
  get _iconTypeAttr() { return this.iconType }

  private _hasError = false

  public _imgError(event: ErrorEvent): void {
    this._hasError = true
    if (this._showDefaultOnError && (this._defaultIconUrl || this._defaultIconObj)) {
      this._iconUrlBeforeError = this._iconUrl
      this._iconObjBeforeError = this._iconObj
      this._iconUrl = this._defaultIconUrl
      this._iconObj = this._defaultIconObj
    }
  }

  @HostBinding('class.disabled')
  get _cssDisabled() { return this.disabled || null }

  @HostBinding('class.no-grayscale')
  get _cssNoGreyscale() { return !this.grayscaleOnDisable }

}
