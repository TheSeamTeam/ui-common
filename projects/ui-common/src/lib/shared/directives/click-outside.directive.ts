import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core'

@Directive({
  selector: '[seamClickOutside]'
})
export class ClickOutsideDirective {

  @Input()
  get seamClickOutsideActive(): boolean {
    return this._active
  }
  set seamClickOutsideActive(value: boolean) {
    if (this._active === value) { return }

    if (value) {
      // `setTimeout` is used to avoid the click event triggering when the value
      // changes if the value was changed with a click.
      setTimeout(() => { this._active = value })
    } else {
      this._active = value
    }
  }
  private _active = true

  @Output() seamClickOutside = new EventEmitter<MouseEvent>()

  // NOTE: This should probably be changed from a `HostListener` to allow the
  // subscription to be unsubscribed.
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this._active) {
      const targetElement = event.target as HTMLElement
      // Check if the click was outside the element
      if (targetElement && !this.elementRef.nativeElement.contains(targetElement)) {
        this.seamClickOutside.emit(event)
      }
    }
  }

  constructor(private elementRef: ElementRef) { }

}
