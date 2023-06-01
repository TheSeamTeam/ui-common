import { Directive, ElementRef, HostListener, Input } from '@angular/core'

declare type _PointerEvent = PointerEvent | PointerEvent

export interface IHoverClassToggleRecord {
  default: string
  hover: string
}

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
  selector: '[seamHoverClassToggle]'
})
export class HoverClassToggleDirective {

  private _hovered = false
  private _defaultClasses: string[] = []
  private _hoverClasses: string[] = []

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
  set seamHoverClassToggle(value: IHoverClassToggleRecord) {
    if (value) {
      if (value.default) {
        this._defaultClasses = value.default.split(' ').filter(c => c.length > 0)
      }
      if (value.hover) {
        this._hoverClasses = value.hover.split(' ').filter(c => c.length > 0)
      }
    }

    this._hoverClasses = this._hoverClasses.filter(v => !this._defaultClasses.find(_v => _v === v))

    this._update()
  }

  constructor(
    private readonly _element: ElementRef
  ) { }

  private _update(): void {
    for (const c of this._defaultClasses) {
      this._hovered ? this._removeClass(c) : this._addClass(c)
    }
    for (const c of this._hoverClasses) {
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
