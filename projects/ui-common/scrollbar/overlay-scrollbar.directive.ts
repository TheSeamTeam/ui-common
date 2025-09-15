import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy } from '@angular/core'

import OverlayScrollbars from 'overlayscrollbars'

import { TheSeamOverlayScrollbarsService } from './overlay-scrollbars.service'

import type { TheSeamOverlayScrollbarsConfig } from './overlay-scrollbars-config-model'

@Directive({
  selector: '[seamOverlayScrollbar]',
  exportAs: 'seamOverlayScrollbar',
})
export class TheSeamOverlayScrollbarDirective implements AfterViewInit, OnDestroy {
  static ngAcceptInputType_seamOverlayScrollbar: TheSeamOverlayScrollbarsConfig | undefined | null | ''

  private readonly _ref = inject(ElementRef)
  private readonly _scrollbars = inject(TheSeamOverlayScrollbarsService)

  private _disabled = false

  @Input()
  set seamOverlayScrollbar(value: TheSeamOverlayScrollbarsConfig | undefined | null) { this.options = value }

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

  set options(value: TheSeamOverlayScrollbarsConfig | undefined | null) {
    this._options = value || {}
    this._scrollbars.setOptions(this._ref.nativeElement, this._options)
  }
  get options() {
    if (this._scrollbars.isInstanceEnabled(this._ref.nativeElement)) {
      return this._scrollbars.getOptions(this._ref.nativeElement)
    }
    return this._options
  }
  private _options: TheSeamOverlayScrollbarsConfig = {}

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
