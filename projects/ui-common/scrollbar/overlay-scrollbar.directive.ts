import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core'

import OverlayScrollbars from 'overlayscrollbars'

import { OverlayScrollbarsService } from './overlay-scrollbars.service'

import type { IOverlayScrollbarsConfig } from './overlay-scrollbars-config-model'

@Directive({
  selector: '[seamOverlayScrollbar]',
  exportAs: 'seamOverlayScrollbar'
})
export class OverlayScrollbarDirective implements AfterViewInit, OnDestroy {
  static ngAcceptInputType_seamOverlayScrollbar: IOverlayScrollbarsConfig | undefined | null | ''

  private _disabled = false

  @Input()
  set seamOverlayScrollbar(value: IOverlayScrollbarsConfig | undefined | null) { this.options = value }

  @Input()
  get overlayScrollbarEnabled(): boolean {
    return this._scrollbars.isInstanceEnabled(this._ref.nativeElement)
  }
  set overlayScrollbarEnabled(value: boolean) {
    this._disabled = !coerceBooleanProperty(value)
    if (!this._disabled) {
      this._scrollbars.initializeInstance(this._ref.nativeElement, this._options)
    } else {
      this._scrollbars.destroyInstance(this._ref.nativeElement)
    }
  }

  set options(value: IOverlayScrollbarsConfig | undefined | null) {
    this._options = value || {}
    this._scrollbars.setOptions(this._ref.nativeElement, this._options)
  }
  get options() {
    if (this._scrollbars.isInstanceEnabled(this._ref.nativeElement)) {
      return this._scrollbars.getOptions(this._ref.nativeElement)
    }
    return this._options
  }
  private _options: IOverlayScrollbarsConfig = {}

  constructor(
    private _ref: ElementRef,
    private _scrollbars: OverlayScrollbarsService
  ) { }

  ngAfterViewInit() {
    if (!this._disabled) {
      this._scrollbars.initializeInstance(this._ref.nativeElement, this._options)
    }
  }

  ngOnDestroy() {
    this._scrollbars.destroyInstance(this._ref.nativeElement)
  }

  get instance(): OverlayScrollbars {
    return this._scrollbars.getInstance(this._ref.nativeElement)
  }

}
