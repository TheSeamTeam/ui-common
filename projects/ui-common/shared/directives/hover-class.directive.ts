import { Directive, ElementRef, HostListener, Input } from '@angular/core'

declare type _PointerEvent = PointerEvent | PointerEvent

/**
 * Don't use this directive unless there is a reason not to use css `:hover`,
 * because the accuracy of detecting the hover is not as good. If an element is
 * moved while the mouse is idle the hover class will remain until the mouse
 * enters and leaves again.
 *
 * I have tried multiple ways of detecting the mouse no longer hovering, but all
 * have introduced a slight performance issue that just builds for each element
 * containing this directive.
 */
@Directive({
  selector: '[seamHoverClass]'
})
export class HoverClassDirective {

  private _hovered = false
  private _classes: string[] = []

  @HostListener('mouseover', ['$event']) onMouseOver($event: MouseEvent) {
    this._setHovered(true)
  }

  @HostListener('mouseout', ['$event']) onMouseOut($event: MouseEvent) {
    this._setHovered(false)
  }

  @HostListener('pointerover', ['$event']) onPointerOver($event: _PointerEvent) {
    this._setHovered(true)
  }

  @HostListener('pointerout', ['$event']) onPointerOut($event: _PointerEvent) {
    this._setHovered(false)
  }

  @Input()
  set seamHoverClass(classList: string) {
    const newClasses = classList.split(' ').filter(c => c.length > 0)
    for (const c of this._classes) {
      if (newClasses.indexOf(c) !== 0) {
        this._removeClass(c)
      }
    }
    this._classes = newClasses
    this._update()
  }

  constructor(
    private readonly _element: ElementRef
  ) { }

  private _update(): void {
    for (const c of this._classes) {
      this._hovered ? this._addClass(c) : this._removeClass(c)
    }
  }

  private _setHovered(hovered: boolean) {
    const doUpdate = this._hovered !== hovered
    this._hovered = hovered
    if (doUpdate) {
      this._update()
    }
  }

  private _addClass(c: string): void {
    this._element.nativeElement.classList.add(c)
  }

  public _removeClass(c: string): void {
    this._element.nativeElement.classList.remove(c)
  }

}
