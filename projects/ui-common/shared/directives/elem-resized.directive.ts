import { AfterViewInit, Directive, ElementRef, EventEmitter, inject, OnDestroy, Output } from '@angular/core'

import { ResizeSensor } from 'css-element-queries'

export interface TheSeamElementResizedEvent {
  element: HTMLElement
  size: { width: number, height: number }
}

@Directive({
  selector: '[seamElemResized]',
  exportAs: 'seamElemResized',
})
export class TheSeamElemResizedDirective implements OnDestroy, AfterViewInit {

  private readonly _elementRef = inject(ElementRef<HTMLElement>)

  @Output() seamElemResized = new EventEmitter<TheSeamElementResizedEvent>()

  sensor?: ResizeSensor

  ngAfterViewInit() {
    this.sensor = new ResizeSensor(this._elementRef.nativeElement, event => {
      this.seamElemResized.emit({ element: this._elementRef.nativeElement, size: event })
    })
  }

  ngOnDestroy() {
    this.sensor?.detach()
  }

}
