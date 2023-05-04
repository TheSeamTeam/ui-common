import { AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core'

import { ResizeSensor } from 'css-element-queries'

export interface IElementResizedEvent {
  element: HTMLElement
  size: { width: number, height: number }
}

@Directive({
  selector: '[seamElemResized]'
})
export class ElemResizedDirective implements OnDestroy, AfterViewInit {

  @Output() seamElemResized = new EventEmitter<IElementResizedEvent>()

  sensor?: ResizeSensor

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    this.sensor = new ResizeSensor(this.elementRef.nativeElement, event => {
      this.seamElemResized.emit({ element: this.elementRef.nativeElement, size: event })
    })
  }

  ngOnDestroy() {
    this.sensor?.detach()
  }

}
