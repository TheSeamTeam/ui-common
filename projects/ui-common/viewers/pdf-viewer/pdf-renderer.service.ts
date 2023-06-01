import { Injectable } from '@angular/core'
import { from, Observable } from 'rxjs'
import { shareReplay, switchMap, tap } from 'rxjs/operators'

import { wrapIntoObservable } from '@theseam/ui-common/utils'

@Injectable({
  providedIn: 'root'
})
export class PdfRendererService {

  private readonly _pdfjs$: Observable<any>

  constructor() {
    const pdfjsImport = wrapIntoObservable(import('pdfjs-dist/legacy/build/pdf'))
    this._pdfjs$ = pdfjsImport.pipe(
      tap((pdfJs: any) => {
        if (!pdfJs.GlobalWorkerOptions.workerSrc) {
          // tslint:disable-next-line:max-line-length
          pdfJs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfJs as any).version}/pdf.worker.min.js`
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  public getDocument(url: string): Observable<any> {
    return from(fetch(url)).pipe(
      switchMap(v => this._pdfjs$.pipe(
        switchMap(pdfjs => pdfjs.getDocument(v).promise)
      ))
    )
  }
}
