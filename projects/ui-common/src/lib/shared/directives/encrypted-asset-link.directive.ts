import { Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core'

import { TheSeamLoadingOverlayService } from '../../loading/index'
import { AssetReaderHelperService } from '../../services/index'

// TODO: Add a dev warning or handle both `seamEncryptedAssetLink` and `attr.href` being set on a single element.

@Directive({
  selector: '[seamEncryptedAssetLink]'
})
export class EncryptedAssetLinkDirective {

  @Input() seamEncryptedAssetLink: string
  @Input() seamShowLoadingOverlay = true
  @Input() seamDetectMimeFromContent = true
  @Input() seamDownloadAsset = false

  // TODO: Find out why I need this for buttons.
  @HostBinding('attr.href') get _attrHref() { return this.seamEncryptedAssetLink }

  @HostListener('click', [ '$event' ])
  _onClick(event) {
    let open$ = this._assetReaderHelper.openLink(
      this.seamEncryptedAssetLink,
      this.seamDetectMimeFromContent,
      this.seamDownloadAsset,
      this._isAnchor() && this._hasTarget() ? this._getTarget() : undefined
    )
    if (this.seamShowLoadingOverlay) {
      open$ = this._loading.while(open$)
    }
    open$.subscribe()
  }

  constructor(
    private _elementRef: ElementRef,
    private _assetReaderHelper: AssetReaderHelperService,
    private _loading: TheSeamLoadingOverlayService
  ) { }

  /** Determines if the component host is an anchor. */
  protected _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

  protected _hasTarget(): boolean {
    const elem = this._elementRef.nativeElement as HTMLAnchorElement
    return !(elem.target === undefined || elem.target === null)
  }

  protected _getTarget(): string {
    return (this._elementRef.nativeElement as HTMLAnchorElement).target
  }

}
