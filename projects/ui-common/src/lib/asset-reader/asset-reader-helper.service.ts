import { Injectable, isDevMode, Optional } from '@angular/core'
import { from, Observable, of, throwError } from 'rxjs'
import { catchError, map, mapTo, switchMap, tap } from 'rxjs/operators'

import FileSaver from 'file-saver'

import { fileDataFromBuffer, openBlob, readFileAsync } from '@lib/ui-common/utils'

import { EncryptedAssetReader } from './encrypted-asset-reader'

@Injectable({
  providedIn: 'root'
})
export class AssetReaderHelperService {

  constructor(
    @Optional() private _assetReader?: EncryptedAssetReader
  ) {
    if (isDevMode() && !this._assetReader) {
      console.warn(`[EncryptedAssetLinkDirective] Unable to get encrypted files unless an EncryptedAssetReader is provided.`)
    }
  }

  public openLink(
    url: string,
    detectMimeFromContent: boolean = true,
    download: boolean = true,
    target?: string
  ): Observable<boolean> {
    if (!(url === undefined || url === null)) {
      if (!this._assetReader) {
        // Fallback
        const win = window.open(url, target)
        // TODO: Consider if always setting opener to null is to restrictive
        // if (win && target && target.toLowerCase() === '_blank') {
        //   win.opener = null
        // }
        return of(false)
      }

      const data$ = this._assetReader.getAssetBlobFromUrl(url, detectMimeFromContent)
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
            const filename = data.filename ? data.filename : `Untitled${data.ext ? `.${data.ext}` : ''}`
            if (download) {
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

      return open$
    }

    return of(false)
  }

}
