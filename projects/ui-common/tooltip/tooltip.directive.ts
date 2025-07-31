import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
import { ESCAPE } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { ComponentRef, Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, fromEvent, Subject } from 'rxjs'
import { takeUntil, filter } from 'rxjs/operators'

import { TheSeamTooltipComponent, TheSeamTooltipPlacement } from './tooltip.component'

export type TheSeamTooltipTrigger = 'hover' | 'focus' | 'both'
export type TheSeamTooltipPlacementInput = TheSeamTooltipPlacement | TheSeamTooltipPlacement[] | string

@Directive({
  selector: '[seamTooltip]',
  host: {
    '[attr.aria-describedby]': 'tooltipOpen() ? _tooltipId : null',
  },
  exportAs: 'seamTooltip',
})
export class TheSeamTooltipDirective implements OnInit, OnChanges, OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()
  private readonly _tooltipId = `seam-tooltip-${Math.random().toString(36).slice(2, 11)}`

  @Input() seamTooltip: string | TemplateRef<any> | null = null

  @Input() tooltipClass?: string

  @Input() placement?: TheSeamTooltipPlacementInput | null = 'top'

  @Input() container?: string | HTMLElement

  @Input()
  get disableTooltip() { return this._disableTooltip.value }
  set disableTooltip(val: boolean) { this._disableTooltip.next(coerceBooleanProperty(val)) }
  private readonly _disableTooltip = new BehaviorSubject<boolean>(false)

  @Input()
  get showDelay() { return this._showDelay.value }
  set showDelay(val: number) { this._showDelay.next(coerceNumberProperty(val, 500)) }
  private readonly _showDelay = new BehaviorSubject<number>(500)

  @Input()
  get hideDelay() { return this._hideDelay.value }
  set hideDelay(val: number) { this._hideDelay.next(coerceNumberProperty(val, 0)) }
  private readonly _hideDelay = new BehaviorSubject<number>(0)

  @Input() trigger: TheSeamTooltipTrigger = 'both'

  private _active = false
  private _overlayRef: OverlayRef | null = null
  private _compRef: ComponentRef<TheSeamTooltipComponent> | null = null
  private _showTimeoutId: any = null
  private _hideTimeoutId: any = null
  private _eventListenersSubject = new Subject<void>()

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _overlay: Overlay
  ) { }

  ngOnInit() {
    this._setupEventListeners()
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-setup event listeners if trigger changes
    if (changes['trigger'] && !changes['trigger'].firstChange) {
      // Re-setup event listeners with new trigger
      this._setupEventListeners()
    }
  }

  ngOnDestroy() {
    this._clearTimeouts()
    this._closeTooltip()
    this._eventListenersSubject.next()
    this._eventListenersSubject.complete()
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _setupEventListeners() {
    // Clean up existing event listeners
    this._eventListenersSubject.next()
    this._eventListenersSubject.complete()
    this._eventListenersSubject = new Subject<void>()

    const element = this._elementRef.nativeElement

    // Mouse events for hover trigger
    if (this.trigger === 'hover' || this.trigger === 'both') {
      fromEvent(element, 'mouseenter').pipe(
        filter(() => !this._disableTooltip.value && !!this.seamTooltip),
        takeUntil(this._eventListenersSubject),
      ).subscribe(() => this._scheduleShow())

      fromEvent(element, 'mouseleave').pipe(
        takeUntil(this._eventListenersSubject),
      ).subscribe(() => this._scheduleHide())
    }

    // Focus events for focus trigger
    if (this.trigger === 'focus' || this.trigger === 'both') {
      fromEvent(element, 'focus').pipe(
        filter(() => !this._disableTooltip.value && !!this.seamTooltip),
        takeUntil(this._eventListenersSubject),
      ).subscribe(() => this._scheduleShow())

      fromEvent(element, 'blur').pipe(
        takeUntil(this._eventListenersSubject),
      ).subscribe(() => this._scheduleHide())
    }

    // Keyboard events
    fromEvent<KeyboardEvent>(element, 'keydown').pipe(
      filter(event => event.keyCode === ESCAPE),
      takeUntil(this._eventListenersSubject),
    ).subscribe(() => this._closeTooltip())
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

    const positionStrategy = this._getOverlayPosition()
    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    })

    this._compRef = this._overlayRef.attach(new ComponentPortal(TheSeamTooltipComponent, this._viewContainerRef))

    // Set component properties
    const parsedPlacements = this._parsePlacementInput(this.placement)
    this._compRef.instance.content = this.seamTooltip
    this._compRef.instance.tooltipClass = this.tooltipClass
    this._compRef.instance.placement = parsedPlacements[0] || 'top' // Use first placement for initial display
    this._compRef.instance.tooltipId = this._tooltipId
    this._compRef.instance.triggerElement = this._elementRef.nativeElement
    this._compRef.changeDetectorRef.markForCheck()

    // Listen for position changes to update placement class
    positionStrategy.positionChanges.pipe(
      takeUntil(this._ngUnsubscribe),
    ).subscribe(positionChange => {
      if (this._compRef && positionChange.connectionPair) {
        const actualPlacement = this._getPlacementFromConnectionPair(positionChange.connectionPair)
        this._compRef.instance.actualPlacement = actualPlacement
        this._compRef.changeDetectorRef.markForCheck()
      }
    })

    // Listen for tooltip exit animation
    this._compRef.instance._afterExit.pipe(
      takeUntil(this._ngUnsubscribe),
    ).subscribe(() => {
      // Only detach if still attached (defensive check since _closeTooltip may have already detached)
      if (this._overlayRef?.hasAttached()) {
        this._overlayRef.detach()
      }
      // Ensure cleanup happens even if _closeTooltip didn't run
      if (this._active || this._overlayRef || this._compRef) {
        this._resetTooltip()
      }
    })
  }

  private _closeTooltip(): void {
    if (!this._active || !this._compRef) {
      return
    }

    // Mark as inactive immediately to prevent new tooltips from being blocked
    this._active = false

    // Immediately clean up for tests (when using NoopAnimationsModule)
    // In real usage, this will be handled by the animation callback
    this._resetTooltip()
  }

  private _resetTooltip(): void {
    this._active = false

    // Dispose of overlay if it exists and hasn't been disposed already
    if (this._overlayRef) {
      if (this._overlayRef.hasAttached()) {
        this._overlayRef.detach()
      }
      this._overlayRef.dispose()
      this._overlayRef = null
    }

    this._compRef = null
  }

  public tooltipOpen(): boolean {
    return this._active && this._compRef !== null
  }

  private _parsePlacementInput(placement?: TheSeamTooltipPlacementInput | null): TheSeamTooltipPlacement[] {
    if (placement === undefined || placement === null) {
      return ['top'] // Default placement
    }

    if (typeof placement === 'string') {
      if (placement === 'auto') {
        return ['auto']
      }
      // Parse space-delimited string
      const placements = placement.split(/\s+/).filter(p => p.trim())
      return placements.filter(p => this._isValidPlacement(p)) as TheSeamTooltipPlacement[]
    }

    if (Array.isArray(placement)) {
      return placement.filter(p => this._isValidPlacement(p))
    }

    return [placement]
  }

  private _isValidPlacement(placement: string): placement is TheSeamTooltipPlacement {
    const validPlacements: TheSeamTooltipPlacement[] = [
      'top', 'top-left', 'top-right',
      'bottom', 'bottom-left', 'bottom-right',
      'left', 'left-top', 'left-bottom',
      'right', 'right-top', 'right-bottom',
      'auto'
    ]
    return validPlacements.includes(placement as TheSeamTooltipPlacement)
  }

  private _getOverlayPosition(): FlexibleConnectedPositionStrategy {
    const positions = this._getPositions()

    return this._overlay.position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true)
  }

  private _getPositions(): ConnectionPositionPair[] {
    const parsedPlacements = this._parsePlacementInput(this.placement)

    // If 'auto' is specified or no valid placements, return all positions
    if (parsedPlacements.includes('auto') || parsedPlacements.length === 0) {
      return [
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
      ]
    }

    // Return positions for specified placements only
    const positions: ConnectionPositionPair[] = []

    for (const placement of parsedPlacements) {
      const placementPositions = this._getPositionForPlacement(placement)
      positions.push(...placementPositions)
    }

    return positions
  }

  private _getPositionForPlacement(placement: TheSeamTooltipPlacement): ConnectionPositionPair[] {
    switch (placement) {
      case 'top':
        return [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }]
      case 'top-left':
        return [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }]
      case 'top-right':
        return [{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }]
      case 'bottom':
        return [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }]
      case 'bottom-left':
        return [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]
      case 'bottom-right':
        return [{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }]
      case 'left':
        return [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' }]
      case 'left-top':
        return [{ originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' }]
      case 'left-bottom':
        return [{ originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' }]
      case 'right':
        return [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' }]
      case 'right-top':
        return [{ originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }]
      case 'right-bottom':
        return [{ originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' }]
      case 'auto':
      default:
        return [
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
          { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
          { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
        ]
    }
  }

  private _getPlacementFromConnectionPair(connectionPair: ConnectionPositionPair): TheSeamTooltipPlacement {
    const { originX, originY, overlayX, overlayY } = connectionPair

    // Top placements (overlay below origin)
    if (originY === 'top' && overlayY === 'bottom') {
      if (originX === 'start' && overlayX === 'start') return 'top-left'
      if (originX === 'end' && overlayX === 'end') return 'top-right'
      if (originX === 'center' && overlayX === 'center') return 'top'
    }

    // Bottom placements (overlay above origin)
    if (originY === 'bottom' && overlayY === 'top') {
      if (originX === 'start' && overlayX === 'start') return 'bottom-left'
      if (originX === 'end' && overlayX === 'end') return 'bottom-right'
      if (originX === 'center' && overlayX === 'center') return 'bottom'
    }

    // Left placements (overlay to the right of origin)
    if (originX === 'start' && overlayX === 'end') {
      if (originY === 'top' && overlayY === 'top') return 'left-top'
      if (originY === 'bottom' && overlayY === 'bottom') return 'left-bottom'
      if (originY === 'center' && overlayY === 'center') return 'left'
    }

    // Right placements (overlay to the left of origin)
    if (originX === 'end' && overlayX === 'start') {
      if (originY === 'top' && overlayY === 'top') return 'right-top'
      if (originY === 'bottom' && overlayY === 'bottom') return 'right-bottom'
      if (originY === 'center' && overlayY === 'center') return 'right'
    }

    // Default fallback
    return 'top'
  }
}
