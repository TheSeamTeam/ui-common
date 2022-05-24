import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

interface TemplateResizeMessagePayload {
  width: number
  height: number
}

enum TemplateMessageType {
  TplData = 'theseam_tpl_data',
  TplResize = 'theseam_tpl_resize',
}

interface TemplateMessage<TType, TPayload> {
  type: TType
  payload: TPayload
}

@Component({
  selector: 'seam-html-template-viewer',
  templateUrl: './html-template-viewer.component.html',
  styleUrls: ['./html-template-viewer.component.scss']
})
export class TheSeamHtmlTemplateViewerComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_scrollable: BooleanInput

  private readonly _templateMessageHandlers: { [key in TemplateMessageType]: (payload: any) => void }

  private _message: string | undefined | null
  private _dataVersion: number = 0
  private _scrollHandleObserver: MutationObserver | null = null

  @Input()
  get src(): string | null | undefined { return this._src }
  set src(val: string | null | undefined) {
    this._src = val
    this._updateSrc()
  }
  private _src: string | null | undefined

  @Input()
  set dataVersion(value: number | undefined | null) {
    const dv = value || 0
    const sendData = this._dataVersion !== dv
    this._dataVersion = dv
    if (sendData) {
      this.postMessage(this._message)
    }
  }

  @Input()
  set data(value: any) {
    this.postMessage((value !== null && value !== undefined) ? JSON.stringify(value) : value)
  }

  @Input() @InputBoolean()
  set scrollable(value: boolean) {
    this._scrollable = value
    if (this._scrollable) {
      this._initScrollHandleObserver()
    } else {
      this._destroyScrollHandleObserver()
    }
  }

  _scrollable: boolean = false

  @ViewChild('iframeElement', { static: true })
  set iframeElementRef(val: ElementRef<HTMLIFrameElement>) {
    this._iframeElementRef = val
    const iframeNativeElement = this._getIFrameNativeElement()
    if (iframeNativeElement) {
      this._updateSrc()
      iframeNativeElement.onload = () => this.postMessage(this._message)
    }
  }
  private _iframeElementRef!: ElementRef<HTMLIFrameElement>

  _scrollbarOptions = {
    callbacks: {
      onInitialized: () => this._initScrollHandleObserver(),
      // Only scrollbar handles from OverlayScrollbars are currently observed,
      // so we can just disable the observer for native scrollbars.
      onInitializationWithdrawn: () => this._destroyScrollHandleObserver(),
      onDestroyed: () => this._destroyScrollHandleObserver(),
    }
  }

  _mouseBlockActive: boolean = false
  _mouseBlockWidth: string = '100%'
  _mouseBlockHeight: string = '100%'

  constructor(
    private readonly _ngZone: NgZone,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _elementRef: ElementRef
  ) {
    this._templateMessageHandlers = {
      [TemplateMessageType.TplData]: () => { }, // Not listening for message from template
      [TemplateMessageType.TplResize]: this._onResizeMessageFromTemplate
    }
  }

  ngOnInit(): void {
    this._ngZone.runOutsideAngular(() => window.addEventListener('message', this._onMessageFromTemplate))
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this._onMessageFromTemplate)
    this._destroyScrollHandleObserver()
  }

  private _onMessageFromTemplate = (e: any) => {
    const type = e.data.type as TemplateMessageType
    if (this._templateMessageHandlers[type]) {
      this._ngZone.run(() => this._templateMessageHandlers[type](e.data.payload))
    }
  }

  private _onResizeMessageFromTemplate = (payload: TemplateResizeMessagePayload): void => {
    const iframeNativeElement = this._getIFrameNativeElement()
    if (iframeNativeElement) {
      iframeNativeElement.style.height = `${payload.height}px`
    }
  }

  private _updateSrc(): void {
    const iframeNativeElement = this._getIFrameNativeElement()
    if (iframeNativeElement) {
      iframeNativeElement.src = this._src || ''
    }
  }

  public postMessage(msg: string | undefined | null): void {
    this._message = msg

    let _msg = msg
    const contentWindow = this._getIFrameContentWindow()
    if (contentWindow && _msg) {
      if (this._dataVersion === 2) {
        const wrapper: TemplateMessage<TemplateMessageType, any> = { type: TemplateMessageType.TplData, payload: undefined }
        try { wrapper.payload = JSON.parse(_msg) } catch { wrapper.payload = _msg }
        _msg = JSON.stringify(wrapper)
      }

      contentWindow.postMessage(_msg, '*')
    }
  }

  public reload(): void {
    this._updateSrc()
  }

  _onResized(event: { width: number, height: number }) {
    // This ensures the iframe scales itself if it isn't listening to or misses
    // the resize event.
    this.reload()
  }

  private _getIFrameNativeElement(): HTMLIFrameElement | null {
    return (this._iframeElementRef?.nativeElement) || null
  }

  private _getIFrameContentWindow(): Window | null {
    return (this._iframeElementRef?.nativeElement?.contentWindow) || null
  }

  /**
   * Initializes a MutationObserver to detect the 'active' class added to a
   * scroll handle, because OverlayScrollbars does not seem to provide an event
   * for scrollbar handle activation/deactivation.
   *
   * TODO: Do we need this to work for native scrollbars also?
   */
  private _initScrollHandleObserver(): void {
    if (this._scrollHandleObserver !== null) {
      return
    }

    this._ngZone.runOutsideAngular(() => {
      const observer = new MutationObserver(() => {
        this._ngZone.run(() => {
          if (this._isScrollbarHandleActive()) {
            this._enableMouseBlock()
          } else {
            this._disableMouseBlock()
          }
        })
      })

      observer.observe(this._elementRef.nativeElement, {
        attributes: true,
        attributeFilter: [ 'class' ],
        childList: true,
        subtree: true,
        characterData: false,
      })

      this._scrollHandleObserver = observer
    })
  }

  private _destroyScrollHandleObserver(): void {
    if (this._scrollHandleObserver === null) {
      return
    }

    this._scrollHandleObserver.disconnect()
    this._scrollHandleObserver = null
  }

  /**
   * Enables a transparent div to cover the iframe.
   *
   * When the mouse is over an iframe the browser stops letting the parent
   * document receive mouse events. Anything actively tracking mouse movement or
   * button pressed will think the mouse has left the page. So the scrollbar
   * handle would deactivate, when the mouse hovers the iframe. This adds an
   * element to cover the iframe, which prevents mouse events getting sent to
   * the iframe.
   */
  private _enableMouseBlock(): void {
    this._mouseBlockActive = true

    const iframeElement = this._getIFrameNativeElement()
    if (iframeElement) {
      const rect = iframeElement.getBoundingClientRect()
      this._mouseBlockWidth = `${rect.width}px`
      this._mouseBlockHeight = `${rect.height}px`
    } else {
      this._mouseBlockWidth = '100%'
      this._mouseBlockHeight = '100%'
    }

    this._cdr.detectChanges()
  }

  private _disableMouseBlock(): void {
    this._mouseBlockActive = false
    this._cdr.detectChanges()
  }

  private _isScrollbarHandleActive(): boolean {
    return this._elementRef.nativeElement.querySelector('.os-scrollbar-handle.active') !== null
  }

}
