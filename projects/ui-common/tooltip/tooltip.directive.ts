import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
import { ESCAPE } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { ComponentRef, Directive, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, fromEvent, merge, of, Subject, timer } from 'rxjs'
import { switchMap, takeUntil, delay, filter } from 'rxjs/operators'

import { TooltipComponent, TooltipPlacement } from './tooltip.component'

export type TooltipTrigger = 'hover' | 'focus' | 'both'

@Directive({
  selector: '[seamTooltip]',
  host: {
    '[attr.aria-describedby]': 'tooltipOpen() ? _tooltipId : null'
  },
  exportAs: 'seamTooltip'
})
export class SeamTooltipDirective implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()
  private _tooltipId = `seam-tooltip-${Math.random().toString(36).substr(2, 9)}`

  @Input() seamTooltip: string | TemplateRef<any> | null = null

  @Input() tooltipClass?: string

  @Input() placement: TooltipPlacement = 'top'

  @Input() container?: string | HTMLElement

  @Input()
  get disableTooltip() { return this._disableTooltip.value }
  set disableTooltip(val: boolean) { this._disableTooltip.next(coerceBooleanProperty(val)) }
  private _disableTooltip = new BehaviorSubject<boolean>(false)

  @Input()
  get showDelay() { return this._showDelay.value }
  set showDelay(val: number) { this._showDelay.next(coerceNumberProperty(val, 500)) }
  private _showDelay = new BehaviorSubject<number>(500)

  @Input()
  get hideDelay() { return this._hideDelay.value }
  set hideDelay(val: number) { this._hideDelay.next(coerceNumberProperty(val, 0)) }
  private _hideDelay = new BehaviorSubject<number>(0)

  @Input() trigger: TooltipTrigger = 'both'

  private _active = false
  private _overlayRef: OverlayRef | null = null
  private _compRef: ComponentRef<TooltipComponent> | null = null
  private _showTimeoutId: any = null
  private _hideTimeoutId: any = null

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay,
    private _focusMonitor: FocusMonitor
  ) {}

  ngOnInit() {
    this._setupEventListeners()
  }

  ngOnDestroy() {
    this._clearTimeouts()
    this._closeTooltip()
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _setupEventListeners() {
    const element = this._elementRef.nativeElement

    // Mouse events for hover trigger
    if (this.trigger === 'hover' || this.trigger === 'both') {
      fromEvent(element, 'mouseenter')
        .pipe(
          filter(() => !this._disableTooltip.value && !!this.seamTooltip),
          takeUntil(this._ngUnsubscribe)
        )
        .subscribe(() => this._scheduleShow())

      fromEvent(element, 'mouseleave')
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(() => this._scheduleHide())
    }

    // Focus events for focus trigger
    if (this.trigger === 'focus' || this.trigger === 'both') {
      fromEvent(element, 'focus')
        .pipe(
          filter(() => !this._disableTooltip.value && !!this.seamTooltip),
          takeUntil(this._ngUnsubscribe)
        )
        .subscribe(() => this._scheduleShow())

      fromEvent(element, 'blur')
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(() => this._scheduleHide())
    }

    // Keyboard events
    fromEvent<KeyboardEvent>(element, 'keydown')
      .pipe(
        filter(event => event.keyCode === ESCAPE),
        takeUntil(this._ngUnsubscribe)
      )
      .subscribe(() => this._closeTooltip())
  }

  private _scheduleShow() {
    this._clearTimeouts()

    if (this._active) {
      return
    }

    this._showTimeoutId = setTimeout(() => {
      this._showTooltip()
    }, this.showDelay)
  }

  private _scheduleHide() {
    this._clearTimeouts()

    if (!this._active) {
      return
    }

    this._hideTimeoutId = setTimeout(() => {
      this._closeTooltip()
    }, this.hideDelay)
  }

  private _clearTimeouts() {
    if (this._showTimeoutId) {
      clearTimeout(this._showTimeoutId)
      this._showTimeoutId = null
    }
    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId)
      this._hideTimeoutId = null
    }
  }

  private _showTooltip(): void {
    if (this._active || !this.seamTooltip || this._disableTooltip.value) {
      return
    }

    this._active = true

    this._overlayRef = this._overlay.create({
      positionStrategy: this._getOverlayPosition(),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    })

    this._compRef = this._overlayRef.attach(new ComponentPortal(TooltipComponent, this._viewContainerRef))

    // Set component properties
    this._compRef.instance.content = this.seamTooltip
    this._compRef.instance.tooltipClass = this.tooltipClass
    this._compRef.instance.placement = this.placement
    this._compRef.changeDetectorRef.markForCheck()

    // Listen for tooltip exit animation
    this._compRef.instance._afterExit
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(() => {
        if (this._overlayRef?.hasAttached()) {
          this._overlayRef.detach()
        }
        this._resetTooltip()
      })
  }

  private _closeTooltip(): void {
    if (!this._active || !this._compRef) {
      return
    }

    // Trigger exit animation
    this._compRef.destroy()
  }

  private _resetTooltip(): void {
    this._active = false
    this._overlayRef = null
    this._compRef = null
  }

  public tooltipOpen(): boolean {
    return this._overlayRef?.hasAttached() ?? false
  }

  private _getOverlayPosition(): PositionStrategy {
    const positions = this._getPositions()

    return this._overlay.position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(8)
  }

  private _getPositions(): ConnectionPositionPair[] {
    switch (this.placement) {
      case 'top':
        return [
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }
        ]
      case 'top-start':
        return [
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
        ]
      case 'top-end':
        return [
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }
        ]
      case 'bottom':
        return [
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }
        ]
      case 'bottom-start':
        return [
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
        ]
      case 'bottom-end':
        return [
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }
        ]
      case 'left':
        return [
          { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
          { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' }
        ]
      case 'left-start':
        return [
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }
        ]
      case 'left-end':
        return [
          { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
          { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' }
        ]
      case 'right':
        return [
          { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
          { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' }
        ]
      case 'right-start':
        return [
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' }
        ]
      case 'right-end':
        return [
          { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' }
        ]
      case 'auto':
      default:
        return [
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
          { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
          { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' }
        ]
    }
  }
}
