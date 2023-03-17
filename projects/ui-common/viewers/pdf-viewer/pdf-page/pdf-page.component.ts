import { BooleanInput } from '@angular/cdk/coercion'
import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, ViewChild } from '@angular/core'
import { from, Observable, Subject } from 'rxjs'
import { auditTime, switchMap, takeUntil } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'
import { waitOnConditionAsync } from '@theseam/ui-common/utils'

@Component({
  selector: 'seam-pdf-page',
  template: `
  <div #pdfContainer
    (seamElemResized)="onResized()">
    <canvas #pdfCanvas></canvas>
  </div>
  `,
  styles: [`
    :host { display: block; }
    canvas { display: block; }
  `]
})
export class TheSeamPdfPageComponent implements OnDestroy, AfterViewInit {
  static ngAcceptInputType_shadow: BooleanInput
  static ngAcceptInputType_responsive: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input()
  public get page() { return this._page }
  public set page(value) {
    this._page = value
    setTimeout(() => { this.render() })
  }
  private _page: any

  @Input() @InputBoolean() shadow: boolean = false

  @HostBinding('class.shadow') get _shadow() { return this.shadow }

  @ViewChild('pdfContainer', { static: true }) pdfContainer?: ElementRef<HTMLDivElement>
  @ViewChild('pdfCanvas', { static: true }) pdfCanvas?: ElementRef<HTMLCanvasElement>

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
  @Input() renderUpdateThreshold = 100

  public rendering = false

  private _renderRequestSubject = new Subject<void>()

  private _render$: Observable<void>

  constructor() {
    this._render$ = this._renderRequestSubject.pipe(
      takeUntil(this._ngUnsubscribe),
      auditTime(500),
      switchMap(_ => from(waitOnConditionAsync(() => this.rendering === false, 30 * 1000))),
      switchMap(_ => from(this._render()))
    )
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  ngAfterViewInit() {
    this._render$.subscribe()
    this.render()
  }

  public render() {
    this._renderRequestSubject.next()
  }

  private async _render() {
    if (!this.pdfContainer || !this.pdfCanvas) {
      return
    }

    try {
      const w = this.pdfContainer.nativeElement.clientWidth
      const desiredWidth = w
      const viewport = this.page.getViewport({ scale: 1 })
      const scale = desiredWidth / viewport.width
      const scaledViewport = this.page.getViewport({ scale })

      // Prepare canvas using PDF page dimensions
      const canvas: HTMLCanvasElement = this.pdfCanvas.nativeElement
      const context = canvas.getContext('2d')
      canvas.height = scaledViewport.height
      canvas.width = scaledViewport.width
      canvas.style.height = `${scaledViewport.height}px`
      canvas.style.width = `${scaledViewport.width}px`

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      }

      const renderTask = await this.page.render(renderContext).promise

      // TODO: Allow canceling instead of only waiting
      // await renderTask.cancel()
      this.rendering = false
      if (this.responsive) {
        canvas.style.width = '100%'
        canvas.style.height = '100%'
      }
    } catch (err) {
      // PDF loading error
      console.error(err)
    }
  }

  onResized() {
    if (!this.responsive || this.renderUpdateThreshold === -1) { return }

    if (!this.pdfContainer || !this.pdfCanvas) {
      return
    }

    const containerRect = this.pdfContainer.nativeElement.getBoundingClientRect()
    const pdfWidth = this.pdfCanvas.nativeElement.width
    const pdfHeight = this.pdfCanvas.nativeElement.height
    const wDiff = Math.abs(containerRect.width - pdfWidth)
    const hDiff = Math.abs(containerRect.height - pdfHeight)
    if (wDiff > this.renderUpdateThreshold || hDiff > this.renderUpdateThreshold) {
      this.render()
    }

  }

}
