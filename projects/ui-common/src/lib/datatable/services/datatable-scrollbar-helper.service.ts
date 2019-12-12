import { Injectable, NgZone } from '@angular/core'

import { OverlayScrollbarsService } from '../../scrollbar/index'

@Injectable()
export class TheSeamDatatableScrollbarHelperService {

  width = 0

  /**
   * Animates programmatic scrolling, such as switching pages.
   *
   * NOTE: Animating the scrolling works, but the datatable may need changes
   * before this is enabled, because it seems a little stuttery when it moves.
   */
  animatedScrolling = false
  animatedScrollingTime = 250

  constructor(
    private _ngZone: NgZone,
    private _scrollbars: OverlayScrollbarsService
  ) { }

  onInitScroller(scroller: any): void {
    this._scrollbars.initializeInstance(scroller.parentElement, {
      callbacks: {
        onScroll: (e) => {
          this._ngZone.run(() => {
            scroller.onScrolled(e)
          })
        }
      }
    })
  }

  onDestroyScroller(scroller: any): void {
    this._scrollbars.destroyInstance(scroller.parentElement)
  }

  setOffset(scroller: any, offsetY: number): void {
    console.log('setOffset', offsetY)
    // TODO: Move the NgZone decision to the service
    this._ngZone.runOutsideAngular(() => {
      if (this.animatedScrolling) {
        this._scrollbars.getInstance(scroller.parentElement)
          .scroll({ y: offsetY }, this.animatedScrollingTime)
      } else {
        this._scrollbars.getInstance(scroller.parentElement)
          .scroll({ y: offsetY })
      }
    })
  }
}
