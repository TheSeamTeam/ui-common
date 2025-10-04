import { inject, Injectable } from '@angular/core'
import { from, Observable } from 'rxjs'
import { shareReplay, switchMap, tap } from 'rxjs/operators'

import { wrapIntoObservable } from '@theseam/ui-common/utils'

import { THESEAM_PDF_VIEWER_CONFIG_PROVIDER } from './pdf-viewer-config'

@Injectable({ providedIn: 'root' })
export class TheSeamPdfRendererService {
  private readonly _config = inject(THESEAM_PDF_VIEWER_CONFIG_PROVIDER, { optional: true })

  private readonly _pdfjs$: Observable<any>

  constructor() {
    const pdfjsImport = wrapIntoObservable(import('pdfjs-dist'))
    this._pdfjs$ = pdfjsImport.pipe(
      tap((pdfJs: any) => {
        if (!pdfJs.GlobalWorkerOptions.workerSrc) {
          pdfJs.GlobalWorkerOptions.workerSrc = this._config?.pdfJsWorkerSrc || `assets/vendor/pdfjs-dist/pdf.worker.min.mjs`
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  public getDocument(url: string): Observable<any> {
    return from(fetch(url)).pipe(
      switchMap(v => this._pdfjs$.pipe(
        switchMap(pdfjs => pdfjs.getDocument(v).promise),
      )),
    )
  }
}
