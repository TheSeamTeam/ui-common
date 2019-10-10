import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core'

import OverlayScrollbars from 'overlayscrollbars'

import { OverlayScrollbarsService } from './overlay-scrollbars.service'

import { IOverlayScrollbarsConfig } from './overlay-scrollbars-config-model'

@Directive({
  selector: '[seamOverlayScrollbar]',
  exportAs: 'seamOverlayScrollbar'
})
export class OverlayScrollbarDirective implements OnInit, AfterViewInit, OnDestroy {

  private _disabled = false

  @Input()
  set seamOverlayScrollbar(value: IOverlayScrollbarsConfig) { this.options = value }

  @Input()
  get overlayScrollbarEnabled(): boolean {
    return this._scrollbars.isInstanceEnabled(this._ref.nativeElement)
  }
  set overlayScrollbarEnabled(value: boolean) {
    this._disabled = !coerceBooleanProperty(value)
    if (!this._disabled) {
      this._scrollbars.initializeInstance(this._ref.nativeElement)
    } else {
      this._scrollbars.destroyInstance(this._ref.nativeElement)
    }
  }

  set options(value: IOverlayScrollbarsConfig) {
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

  ngOnInit() { }

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
