import { ESCAPE } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import { Directive, ElementRef, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableActionMenuToggle]',
  exportAs: 'seamDatatableActionMenuToggle'
})
export class DatatableActionMenuToggleDirective {

  @Input() seamDatatableActionMenuToggle: TemplateRef<HTMLElement>

  private _active = false
  private _overlayRef: OverlayRef
  private _actionDown = false

  @HostListener('document:keydown', [ '$event' ])
  _onKeydown(event: any) {
    if (event.keyCode === ESCAPE) {
      this.disable()
    }
  }

  @HostListener('click', [ '$event' ])
  _onClick(event: any) {
    this.toggle()
  }

  @HostListener('mousedown', [ '$event' ]) _mouseDown(event: any) { this.onInputDown(event) }
  @HostListener('pointerdown', [ '$event' ]) _pointerDown(event: any) { this.onInputDown(event) }

  @HostListener('mouseup', [ '$event' ]) _mouseUp(event: any) { this.onInputUp(event) }
  @HostListener('pointerup', [ '$event' ]) _pointerUp(event: any) { this.onInputUp(event) }

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay,
  ) { }

  public get active(): boolean { return this._active }

  public toggle() {
    if (this._active) {
      this.disable()
    } else {
      this.enable()
    }
  }

  public enable() {
    if (this.active) { return }

    this._overlayRef = this._overlay.create({
      hasBackdrop: false,
      positionStrategy: this.getOverlayPosition(this._elementRef.nativeElement),
    })

    this._overlayRef.attach(new TemplatePortal(this.seamDatatableActionMenuToggle, this._viewContainerRef))

    this._active = true
  }

  public disable() {
    if (!this.active) { return }

    if (this._overlayRef.hasAttached()) {
      this._overlayRef.detach()
    }

    this._active = false
  }

  private getOverlayPosition(origin: HTMLElement): PositionStrategy {
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions())
      .withFlexibleDimensions(false)
      .withPush(false)

    return positionStrategy
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
      },
    ]
  }

  onFocusChangeOverlay(event: any) {
    if (event === null) {
      if (!this._actionDown) {
        this.disable()
      }
    }
  }

  onInputDown(event: any) {
    this._actionDown = true
  }

  onInputUp(event: any) {
    this._actionDown = false
  }

}
