import { BooleanInput, coerceArray, coerceNumberProperty } from '@angular/cdk/coercion'
import { Component, Input } from '@angular/core'
import { BehaviorSubject, from, Observable, of, ReplaySubject } from 'rxjs'
import { map, shareReplay, switchMap, tap } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'
import { wrapIntoObservable } from '@theseam/ui-common/utils'

import { PdfRendererService } from './pdf-renderer.service'

@Component({
  selector: 'seam-pdf-viewer',
  template: `
  <ng-container *ngFor="let page of pages$ | async">
    <seam-pdf-page
      class="mb-2"
      [page]="page | async"
      [responsive]="responsive"
      [shadow]="shadow"
      [renderUpdateThreshold]="renderUpdateThreshold">
    </seam-pdf-page>
  </ng-container>
  `,
  styles: [`:host { display: block; }`]
})
export class TheSeamPdfViewerComponent {
  static ngAcceptInputType_shadow: BooleanInput
  static ngAcceptInputType_responsive: BooleanInput

  @Input()
  get pdfUrl(): string | undefined | null { return this._pdfUrl }
  set pdfUrl(value: string | undefined | null) {
    this._pdfUrl = value
    this._documentSubject.next(value)
  }
  private _pdfUrl: string | undefined | null

  @Input() @InputBoolean() shadow = false

  /**
   * Canvas will responsively scale and rerender if scaled more than
   * `renderUpdateThreshold` pixels.
   */
  @Input() @InputBoolean() responsive = false

  /**
   * The canvas will be rerendered if the canvas size changes by this many
   * pixels from the last render.
   *
   * To make the canvas responsive using only the initial size for its render
   * set the threshold to `-1`. You can still trigger a rerender by calling the
   * `render()` method.
   *
   * NOTE: Only used when `responsive` is `true`.
   */
  @Input()
  set renderUpdateThreshold(value: number) { this._renderUpdateThreshold = coerceNumberProperty(value) }
  get renderUpdateThreshold(): number { return this._renderUpdateThreshold }
  private _renderUpdateThreshold: number = 100

  /**
   * Range of pages to render.
   *
   * Example(page 1 to page 3):
   *  [pageRange]="[1,3]"
   */
  @Input()
  get pageRange(): number[] { return this._pageRange }
  set pageRange(value: number[]) {
    this._pageRange = value

    if (!this._pageRange) {
      this._pageNumbersSubject.next(undefined)
    }

    try {
      const range = coerceArray(this._pageRange)
      if (range.length !== 2) {
        throw new Error('[pdf-viewer] Invalid Page Range. Range array must have two numbers only.')
      }
      if (range[0] > range[1]) {
        throw new Error('[pdf-viewer] Invalid Page Range. Start of the range must be less than or equal to the end.')
      }

      const nums: number[] = []
      for (let i = range[0]; i <= range[1]; i++) {
        nums.push(i)
      }
      this._pageNumbersSubject.next(nums)
    } catch (err) {
      // TODO: Decide how to conveniently display these errors.
      console.error(err)
      this._pageNumbersSubject.next([])
    }
  }
  private _pageRange: number[] = []

  /**
   * Render a specific page.
   */
  @Input()
  get pageNumber(): number { return this._pageNumber }
  set pageNumber(value: number) {
    this._pageNumber = coerceNumberProperty(value, -1)
    this._pageNumbersSubject.next(this._pageNumber === -1 ? undefined : [ this._pageNumber ])
  }
  private _pageNumber = -1

  /**
   * Specific page numbers to render.
   */
  @Input()
  get pageNumbers(): number[] { return this._pageNumbers }
  set pageNumbers(value: number[]) {
    this._pageNumbers = value
    if (Array.isArray(this._pageNumbers)) {
      this._pageNumbersSubject.next(this._pageNumbers)
    } else {
      this._pageNumbersSubject.next(undefined)
    }
  }
  private _pageNumbers: number[] = []

  private _documentSubject = new ReplaySubject<any>(1)
  public document$: Observable<any>
  public pages$: Observable<any[]>

  /**
   * Undefined means all a pages
   */
  private _pageNumbersSubject = new BehaviorSubject<number[] | undefined>(undefined)

  constructor(
    private readonly _pdfRenderer: PdfRendererService
  ) {
    this.document$ = this._documentSubject.asObservable().pipe(
      switchMap(url => {
        if (!url) {
          return of()
        }
        return this._pdfRenderer.getDocument(url)
      })
    )

    const pageNumbers$ = this._pageNumbersSubject.asObservable()

    this.pages$ = this.document$.pipe(
      switchMap(doc => pageNumbers$.pipe(
        map(pageNumbers => {
          const pages: any[] = []
          for (let i = 0; i < doc.numPages; i++) {
            if (!pageNumbers || pageNumbers.indexOf(i + 1) !== -1) {
              pages.push(from(doc.getPage(i + 1)))
            }
          }
          return pages
        })
      ))
    )
  }

}
