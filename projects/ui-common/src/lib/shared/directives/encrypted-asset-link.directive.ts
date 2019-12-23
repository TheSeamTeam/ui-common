import { Directive, ElementRef, HostBinding, HostListener, Input, isDevMode, Optional } from '@angular/core'
import { from, Observable, of, throwError } from 'rxjs'
import { catchError, map, mapTo, switchMap, tap } from 'rxjs/operators'

import FileSaver from 'file-saver'

import { TheSeamLoadingOverlayService } from '../../loading/index'
import { EncryptedAssetReader } from '../../shared/models/index'
import { fileDataFromBuffer, openBlob, readFileAsync } from '../../utils/index'

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
  @HostBinding('attr.href') get _atrrHref() { return this.seamEncryptedAssetLink }

  @HostListener('click', [ '$event' ])
  _onClick(event) {
    this.openLink(this.seamShowLoadingOverlay).subscribe()
  }

  constructor(
    private _elementRef: ElementRef,
    @Optional() private _assetReader: EncryptedAssetReader,
    private _loading: TheSeamLoadingOverlayService,
  ) {
    if (isDevMode() && !this._assetReader) {
      console.warn(`[EncryptedAssetLinkDirective] Unable to get encrypted files unless an EncryptedAssetReader is provided.`)
    }
  }

  public openLink(showLoadingOverlay: boolean = true): Observable<boolean> {
    if (!(this.seamEncryptedAssetLink === undefined || this.seamEncryptedAssetLink === null)) {
      if (!this._assetReader) {
        // Fallback
        const target = this._isAnchor() && this._hasTarget() ? this._getTarget() : undefined
        const win = window.open(this.seamEncryptedAssetLink, target)
        // TODO: Consider if always setting opener to null is to restrictive
        // if (win && target && target.toLowerCase() === '_blank') {
        //   win.opener = null
        // }
        return of(false)
      }

      const data$ = this._assetReader.getAssetBlobFromUrl(this.seamEncryptedAssetLink, this.seamDetectMimeFromContent)
        .pipe(
          switchMap(v => {
            const filename: string | undefined = v instanceof Blob ? undefined : v.filename
            const blob: Blob = v instanceof Blob ? v : v.blob
            return from(readFileAsync(blob))
              .pipe(
                switchMap(_buf => !!_buf
                  ? from(fileDataFromBuffer(_buf))
                  : throwError('Unable to read file.')
                ),
                map(data => ({ ...data, blob, filename }))
              )
          })
        )

      const open$ = data$
        .pipe(
          tap(data => {
            if (!data || !data.blob) { throw new Error('File unsuccessfully read.') }
            const target = this._isAnchor() && this._hasTarget() ? this._getTarget() : undefined
            const filename = data.filename ? data.filename : `Untitled${data.ext ? `.${data.ext}` : ''}`
            if (this.seamDownloadAsset) {
              FileSaver.saveAs(data.blob, filename)
            } else {
              openBlob(data.blob, target, filename)
            }
          }),
          catchError(err => {
            if (isDevMode()) { console.error('err', err) }
            return of(false)
          }),
          mapTo(true)
        )

      if (showLoadingOverlay) {
        return this._loading.while(open$)
      } else {
        return open$
      }
    }

    return of(false)
  }

  /** Determines if the component host is an anchor. */
  protected _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

  /** Determines if the component host is an button. */
  protected _isButton(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'button'
  }

  protected _hasTarget(): boolean {
    const elem = this._elementRef.nativeElement as HTMLAnchorElement
    return !(elem.target === undefined || elem.target === null)
  }

  protected _getTarget(): string {
    return (this._elementRef.nativeElement as HTMLAnchorElement).target
  }

}
