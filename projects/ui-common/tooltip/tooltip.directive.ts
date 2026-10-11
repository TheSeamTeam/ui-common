import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion'
import { ESCAPE } from '@angular/cdk/keycodes'
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core'
import { BehaviorSubject, fromEvent, Subject } from 'rxjs'
import { takeUntil, filter } from 'rxjs/operators'

import {
  TheSeamTooltipComponent,
  TheSeamTooltipPlacement,
} from './tooltip.component'

export type TheSeamTooltipTrigger = 'hover' | 'focus' | 'both'
export type TheSeamTooltipPlacementInput =
  | TheSeamTooltipPlacement
  | TheSeamTooltipPlacement[]
  | string

/**
 * A custom tooltip directive that replaces \`ngbTooltip\` with zero dependencies.
 * Supports both string and template content with full Bootstrap 4.6 compatibility.
 *
 * ## Features
 * - **String & Template Content**: Support for both simple text and complex HTML content
 * - **Multiple Triggers**: Hover, focus, or both
 * - **Flexible Positioning**: 12 placement options with auto-fallback
 * - **Configurable Timing**: Customizable show/hide delays
 * - **Bootstrap Compatible**: Uses Bootstrap 4.6 classes for seamless integration
 * - **Accessibility**: Full ARIA support and keyboard navigation
 * - **Performance**: Lazy creation and proper cleanup
 *
 * ## Placement
 * `placement` accepts a single placement, a space-delimited string, or an
 * array. Placements are tried in the order given, and the first one that fits
 * in the viewport is used.
 * - `"right"`: only one position, so the tooltip never moves to another side.
 *   If it does not fit, it is pushed back into the viewport instead.
 * - `"auto"`: tries top, bottom, right, then left.
 * - `"right auto"`: tries right first, then falls back to the `auto` order.
 *
 * ## Fullscreen
 * Tooltips render in the CDK overlay container, which is attached to
 * `document.body`, so they are not visible while another element is
 * fullscreen. To support fullscreen, the app can provide
 * `{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }`
 * (both from `@angular/cdk/overlay`).
 *
 * ## Migration from ngbTooltip
 * ```typescript
 * // Before
 * <button ngbTooltip="Help text" placement="top" tooltipClass="custom">
 *
 * // After
 * <button seamTooltip="Help text" placement="top" tooltipClass="custom">
 * ```
 */
@Directive({
  selector: '[seamTooltip]',
  host: {
    // Used by `TheSeamTooltipHarness`, because `[seamTooltip]` is not in the
    // DOM when the input is bound.
    class: 'seam-tooltip-trigger',
  },
  exportAs: 'seamTooltip',
})
export class TheSeamTooltipDirective implements OnInit, OnChanges, OnDestroy {
  private readonly _elementRef = inject(ElementRef<HTMLElement>)
  private readonly _viewContainerRef = inject(ViewContainerRef)
  private readonly _overlay = inject(Overlay)

  private readonly _ngUnsubscribe = new Subject<void>()
  private readonly _tooltipId = `seam-tooltip-${Math.random().toString(36).slice(2, 11)}`

  @Input() seamTooltip: string | TemplateRef<any> | null = null

  @Input() tooltipClass?: string

  @Input() placement?: TheSeamTooltipPlacementInput | null = 'top'

  /**
   * @deprecated Has no effect. Tooltips always render in the CDK overlay
   * container. See the "Fullscreen" section of the directive docs if the
   * tooltip needs to show inside a fullscreen element.
   */
  @Input() container?: string | HTMLElement

  @Input()
  get disableTooltip() {
    return this._disableTooltip.value
  }
  set disableTooltip(val: boolean) {
    const disabled = coerceBooleanProperty(val)
    this._disableTooltip.next(disabled)
    if (disabled) {
      this._clearTimeouts()
      this._closeTooltip()
    }
  }
  private readonly _disableTooltip = new BehaviorSubject<boolean>(false)

  @Input()
  get showDelay() {
    return this._showDelay.value
  }
  set showDelay(val: number) {
    this._showDelay.next(coerceNumberProperty(val, 500))
  }
  private readonly _showDelay = new BehaviorSubject<number>(500)

  @Input()
  get hideDelay() {
    return this._hideDelay.value
  }
  set hideDelay(val: number) {
    this._hideDelay.next(coerceNumberProperty(val, 0))
  }
  private readonly _hideDelay = new BehaviorSubject<number>(0)

  @Input() trigger: TheSeamTooltipTrigger = 'both'

  private _active = false
  private _overlayRef: OverlayRef | null = null
  private _positionStrategy: FlexibleConnectedPositionStrategy | null = null
  private _compRef: ComponentRef<TheSeamTooltipComponent> | null = null
  private _isRepositioning = false
  private _showTimeoutId: any = null
  private _hideTimeoutId: any = null
  private _eventListenersSubject = new Subject<void>()
  private _documentKeydownSubject = new Subject<void>()

  ngOnInit() {
    this._setupEventListeners()
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-setup event listeners if trigger changes
    if (changes['trigger'] && !changes['trigger'].firstChange) {
      // Clear any pending timeouts
      this._clearTimeouts()
      // Close any existing tooltip first
      this._closeTooltip()
      // Re-setup event listeners with new trigger
      this._setupEventListeners()
    }

    if (
      this._active &&
      (changes['seamTooltip'] ||
        changes['tooltipClass'] ||
        changes['placement'])
    ) {
      if (this.seamTooltip) {
        this._updateOpenTooltip()
      } else {
        this._clearTimeouts()
        this._closeTooltip()
      }
    }
  }

  ngOnDestroy() {
    this._clearTimeouts()
    this._closeTooltip()
    this._eventListenersSubject.next()
    this._eventListenersSubject.complete()
    this._documentKeydownSubject.next()
    this._documentKeydownSubject.complete()
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
      fromEvent(element, 'mouseenter')
        .pipe(
          filter(() => !this._disableTooltip.value && !!this.seamTooltip),
          takeUntil(this._eventListenersSubject),
        )
        .subscribe(() => this._scheduleShow())

      fromEvent(element, 'mouseleave')
        .pipe(takeUntil(this._eventListenersSubject))
        .subscribe(() => this._scheduleHide())
    }

    // Focus events for focus trigger
    if (this.trigger === 'focus' || this.trigger === 'both') {
      fromEvent(element, 'focus')
        .pipe(
          filter(() => !this._disableTooltip.value && !!this.seamTooltip),
          takeUntil(this._eventListenersSubject),
        )
        .subscribe(() => this._scheduleShow())

      fromEvent(element, 'blur')
        .pipe(takeUntil(this._eventListenersSubject))
        .subscribe(() => this._scheduleHide())
    }
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

    const positions = this._getPositions()
    const positionStrategy = this._getOverlayPosition(positions)
    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    })
    this._positionStrategy = positionStrategy

    this._compRef = this._overlayRef.attach(
      new ComponentPortal(TheSeamTooltipComponent, this._viewContainerRef),
    )

    // Set component properties
    this._compRef.instance.content = this.seamTooltip
    this._compRef.instance.tooltipClass = this.tooltipClass
    // Use the first position for initial display, until the overlay reports
    // the position it actually used.
    this._compRef.instance.placement = this._getPlacementFromConnectionPair(
      positions[0],
    )
    this._compRef.instance.tooltipId = this._tooltipId
    this._compRef.instance.triggerElement = this._elementRef.nativeElement
    this._compRef.changeDetectorRef.markForCheck()

    this._addAriaDescribedBy()

    // Listen for position changes to update placement class
    positionStrategy.positionChanges
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((positionChange) => {
        if (this._compRef && positionChange.connectionPair) {
          this._onPositionChange(positionChange.connectionPair)
        }
      })

    // Listen for tooltip exit animation
    this._compRef.instance._afterExit
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(() => {
        // Only detach if still attached (defensive check since _closeTooltip may have already detached)
        if (this._overlayRef?.hasAttached()) {
          this._overlayRef.detach()
        }
        // Ensure cleanup happens even if _closeTooltip didn't run
        if (this._active || this._overlayRef || this._compRef) {
          this._resetTooltip()
        }
      })

    // Set up document-level Escape key listener
    this._setupDocumentKeydownListener()
  }

  /**
   * Positions are emitted outside of the NgZone, so the tooltip is updated
   * synchronously instead of waiting for the next change detection.
   */
  private _onPositionChange(connectionPair: ConnectionPositionPair): void {
    if (!this._compRef) {
      return
    }

    const instance = this._compRef.instance
    const previousPlacement = instance.actualPlacement ?? instance.placement
    const actualPlacement = this._getPlacementFromConnectionPair(connectionPair)
    instance.actualPlacement = actualPlacement
    this._compRef.changeDetectorRef.detectChanges()

    // The placement class changes the tooltip's padding, which changes its
    // size, so the position was calculated for the previous size.
    if (
      !this._isRepositioning &&
      this._placementSide(previousPlacement) !==
        this._placementSide(actualPlacement)
    ) {
      this._isRepositioning = true
      try {
        this._overlayRef?.updatePosition()
        this._compRef?.changeDetectorRef.detectChanges()
      } finally {
        this._isRepositioning = false
      }
    }
  }

  private _placementSide(placement: TheSeamTooltipPlacement): string {
    return placement.split('-')[0]
  }

  private _updateOpenTooltip(): void {
    if (!this._compRef || !this._overlayRef || !this._positionStrategy) {
      return
    }

    this._compRef.instance.content = this.seamTooltip
    this._compRef.instance.tooltipClass = this.tooltipClass
    this._positionStrategy.withPositions(this._getPositions())
    // Render the new content before measuring, since it can change the size.
    this._compRef.changeDetectorRef.detectChanges()
    this._overlayRef.updatePosition()
    this._compRef?.changeDetectorRef.detectChanges()
  }

  /**
   * Adds the tooltip's id to `aria-describedby`, keeping any ids that are
   * already there.
   */
  private _addAriaDescribedBy(): void {
    const ids = this._getAriaDescribedByIds()
    if (!ids.includes(this._tooltipId)) {
      ids.push(this._tooltipId)
    }
    this._elementRef.nativeElement.setAttribute(
      'aria-describedby',
      ids.join(' '),
    )
  }

  private _removeAriaDescribedBy(): void {
    const element = this._elementRef.nativeElement
    const ids = this._getAriaDescribedByIds().filter(
      (id) => id !== this._tooltipId,
    )
    if (ids.length > 0) {
      element.setAttribute('aria-describedby', ids.join(' '))
    } else {
      element.removeAttribute('aria-describedby')
    }
  }

  private _getAriaDescribedByIds(): string[] {
    const value =
      this._elementRef.nativeElement.getAttribute('aria-describedby')
    return value ? value.split(/\s+/).filter((id: string) => !!id) : []
  }

  private _setupDocumentKeydownListener(): void {
    // Clean up any existing document listener
    this._documentKeydownSubject.next()
    this._documentKeydownSubject.complete()
    this._documentKeydownSubject = new Subject<void>()

    // Set up document-level Escape key listener
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event) => {
          // Check both keyCode and key for better compatibility
          return (
            (event.keyCode === ESCAPE || event.key === 'Escape') && this._active
          )
        }),
        takeUntil(this._documentKeydownSubject),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe(() => this._closeTooltip())
  }

  private _closeTooltip(): void {
    if (!this._active || !this._compRef) {
      return
    }

    // Mark as inactive immediately to prevent new tooltips from being blocked
    this._active = false

    // Clean up document listener
    this._documentKeydownSubject.next()

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

    this._positionStrategy = null
    this._compRef = null
    this._removeAriaDescribedBy()
  }

  public tooltipOpen(): boolean {
    return this._active && this._compRef !== null
  }

  private _parsePlacementInput(
    placement?: TheSeamTooltipPlacementInput | null,
  ): TheSeamTooltipPlacement[] {
    if (placement === undefined || placement === null) {
      return ['top'] // Default placement
    }

    if (typeof placement === 'string') {
      if (placement === 'auto') {
        return ['auto']
      }
      // Parse space-delimited string
      const placements = placement.split(/\s+/).filter((p) => p.trim())
      return placements.filter((p) =>
        this._isValidPlacement(p),
      ) as TheSeamTooltipPlacement[]
    }

    if (Array.isArray(placement)) {
      return placement.filter((p) => this._isValidPlacement(p))
    }

    return [placement]
  }

  private _isValidPlacement(
    placement: string,
  ): placement is TheSeamTooltipPlacement {
    const validPlacements: TheSeamTooltipPlacement[] = [
      'top',
      'top-left',
      'top-right',
      'bottom',
      'bottom-left',
      'bottom-right',
      'left',
      'left-top',
      'left-bottom',
      'right',
      'right-top',
      'right-bottom',
      'auto',
    ]
    return validPlacements.includes(placement as TheSeamTooltipPlacement)
  }

  private _getOverlayPosition(
    positions: ConnectionPositionPair[],
  ): FlexibleConnectedPositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true)
  }

  private _getPositions(): ConnectionPositionPair[] {
    const parsedPlacements = this._parsePlacementInput(this.placement)

    // Specified placements are tried first, in the order given.
    const positions: ConnectionPositionPair[] = []
    for (const placement of parsedPlacements) {
      if (placement !== 'auto') {
        positions.push(...this._getPositionForPlacement(placement))
      }
    }

    // 'auto', or no valid placements, falls back to the remaining auto positions.
    if (parsedPlacements.includes('auto') || positions.length === 0) {
      for (const autoPosition of this._getPositionForPlacement('auto')) {
        if (!positions.some((p) => this._isSamePosition(p, autoPosition))) {
          positions.push(autoPosition)
        }
      }
    }

    return positions
  }

  private _isSamePosition(
    a: ConnectionPositionPair,
    b: ConnectionPositionPair,
  ): boolean {
    return (
      a.originX === b.originX &&
      a.originY === b.originY &&
      a.overlayX === b.overlayX &&
      a.overlayY === b.overlayY
    )
  }

  private _getPositionForPlacement(
    placement: TheSeamTooltipPlacement,
  ): ConnectionPositionPair[] {
    switch (placement) {
      case 'top':
        return [
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
          },
        ]
      case 'top-left':
        return [
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
        ]
      case 'top-right':
        return [
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]
      case 'bottom':
        return [
          {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
          },
        ]
      case 'bottom-left':
        return [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
        ]
      case 'bottom-right':
        return [
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
        ]
      case 'left':
        return [
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
          },
        ]
      case 'left-top':
        return [
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
        ]
      case 'left-bottom':
        return [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]
      case 'right':
        return [
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
          },
        ]
      case 'right-top':
        return [
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
        ]
      case 'right-bottom':
        return [
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom',
          },
        ]
      case 'auto':
      default:
        return [
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
          },
          {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
          },
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
          },
        ]
    }
  }

  private _getPlacementFromConnectionPair(
    connectionPair: ConnectionPositionPair,
  ): TheSeamTooltipPlacement {
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
