import { AnimationEvent, transition, trigger, style, animate } from '@angular/animations'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { Subject } from 'rxjs'

export type TheSeamTooltipPlacement =
  | 'top' | 'top-left' | 'top-right'
  | 'bottom' | 'bottom-left' | 'bottom-right'
  | 'left' | 'left-top' | 'left-bottom'
  | 'right' | 'right-top' | 'right-bottom'
  | 'auto'

@Component({
    selector: 'seam-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('150ms ease-out', style({ opacity: 0.9 })),
            ]),
            transition(':leave', [
                style({ opacity: 0.9 }),
                animate('150ms ease-in', style({ opacity: 0 })),
            ]),
        ]),
    ],
    host: {
        class: 'tooltip show',
        '[id]': 'tooltipId',
        '[@fadeInOut]': '',
        '(@fadeInOut.start)': '_onAnimationStart($event)',
        '(@fadeInOut.done)': '_onAnimationDone($event)',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TheSeamTooltipComponent implements OnDestroy {

  @Input() content: string | TemplateRef<any> | null = null
  @Input() tooltipClass?: string
  @Input() context?: any
  @Input() placement: TheSeamTooltipPlacement = 'top'
  @Input() actualPlacement?: TheSeamTooltipPlacement // The actual placement determined by CDK Overlay
  @Input() tooltipId?: string
  @Input() triggerElement?: HTMLElement

  /** A subject emitting after the tooltip enters the view. */
  readonly _afterEnter: Subject<void> = new Subject()

  /** A subject emitting after the tooltip exits the view. */
  readonly _afterExit: Subject<void> = new Subject()

  @HostBinding('class')
  get hostClasses(): string {
    const baseClass = 'tooltip show'
    const placementClass = this._getPlacementClass()
    this._setArrowPosition()
    return `${baseClass} ${placementClass}`
  }

  @ViewChild('inner', { static: true }) innerElement!: ElementRef
  @ViewChild('arrow', { static: true }) arrowElement!: ElementRef

  ngOnDestroy() {
    this._afterEnter.complete()
    this._afterExit.complete()
  }

  get isStringContent(): boolean {
    return typeof this.content === 'string'
  }

  get isTemplateContent(): boolean {
    return this.content instanceof TemplateRef
  }

  get templateContent(): TemplateRef<any> | null {
    return this.isTemplateContent ? this.content as TemplateRef<any> : null
  }

  private _getPlacementClass(): string {
    // Use actualPlacement if available, otherwise fall back to initial placement
    const effectivePlacement = this.actualPlacement || this.placement

    switch (effectivePlacement) {
      case 'top':
      case 'top-left':
      case 'top-right':
        return 'bs-tooltip-top'
      case 'bottom':
      case 'bottom-left':
      case 'bottom-right':
        return 'bs-tooltip-bottom'
      case 'left':
      case 'left-top':
      case 'left-bottom':
        return 'bs-tooltip-left'
      case 'right':
      case 'right-top':
      case 'right-bottom':
        return 'bs-tooltip-right'
      case 'auto':
        return 'bs-tooltip-auto'
      default:
        return 'bs-tooltip-top'
    }
  }

  private _setArrowPosition() {
    if (!this.innerElement || !this.arrowElement || !this.triggerElement) {
      return
    }

    // Use actualPlacement if available, otherwise fall back to initial placement
    const effectivePlacement = this.actualPlacement || this.placement
    const paddingOffset = 8 // Default padding offset for arrow positioning
    const minDimension = 50 // Minimum tooltip width/height to use trigger-aligned positioning

    const triggerRect = this.triggerElement.getBoundingClientRect()
    const tooltipRect: DOMRect = this.innerElement.nativeElement.getBoundingClientRect()
    const arrowRect: DOMRect = this.arrowElement.nativeElement.getBoundingClientRect()

    // Default arrow offset (8px padding + half arrow size)
    const defaultArrowOffset = paddingOffset + (effectivePlacement.startsWith('top') || effectivePlacement.startsWith('bottom') ? arrowRect.width / 2 : arrowRect.height / 2)

    if (effectivePlacement.startsWith('top') || effectivePlacement.startsWith('bottom')) {
      // Check if tooltip is too narrow for trigger-aligned positioning
      if (tooltipRect.width < minDimension) {
        const arrowLeft = (tooltipRect.width - arrowRect.width) / 2
        this.arrowElement.nativeElement.style.left = `${arrowLeft}px`
        return
      }

      // Horizontal arrow positioning for top-* and bottom-* placements
      const triggerCenter = triggerRect.left + triggerRect.width / 2
      const adjustedArrowLeft = triggerCenter - tooltipRect.left - arrowRect.width / 2
      const arrowCenter = tooltipRect.left + adjustedArrowLeft + arrowRect.width / 2

      // If arrow's center is outside trigger's horizontal bounds, use default
      if (arrowCenter < triggerRect.left || arrowCenter > triggerRect.right) {
        this.arrowElement.nativeElement.style.left = `${defaultArrowOffset}px`
        return
      }

      // Ensure arrow's left is within rounded corner bounds
      const maxArrowLeft = (tooltipRect.width - arrowRect.width) - defaultArrowOffset
      const arrowLeft = Math.min(maxArrowLeft, Math.max(defaultArrowOffset, adjustedArrowLeft))

      this.arrowElement.nativeElement.style.left = `${arrowLeft}px`
    } else if (effectivePlacement.startsWith('left') || effectivePlacement.startsWith('right')) {
      // Check if tooltip is too short for trigger-aligned positioning
      if (tooltipRect.height < minDimension) {
        const arrowTop = (tooltipRect.height - arrowRect.height) / 2
        this.arrowElement.nativeElement.style.top = `${arrowTop}px`
        return
      }

      // Vertical arrow positioning for left-* and right-* placements
      const triggerCenter = triggerRect.top + triggerRect.height / 2
      const adjustedArrowTop = triggerCenter - tooltipRect.top - arrowRect.height / 2
      const arrowCenter = tooltipRect.top + adjustedArrowTop + arrowRect.height / 2

      // If arrow's center is outside trigger's vertical bounds, use default
      if (arrowCenter < triggerRect.top || arrowCenter > triggerRect.bottom) {
        this.arrowElement.nativeElement.style.top = `${defaultArrowOffset}px`
        return
      }

      // Ensure arrow's top is within rounded corner bounds
      const maxArrowTop = (tooltipRect.height - arrowRect.height) - defaultArrowOffset
      const arrowTop = Math.min(maxArrowTop, Math.max(defaultArrowOffset, adjustedArrowTop))

      this.arrowElement.nativeElement.style.top = `${arrowTop}px`
    }
  }

  /** Emit lifecycle events based on animation `start` callback. */
  _onAnimationStart(event: AnimationEvent) {
    // Animation start handling if needed
  }

  /** Emit lifecycle events based on animation `done` callback. */
  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'void') {
      this._afterExit.next()
      this._afterExit.complete()
    } else {
      this._afterEnter.next()
      this._afterEnter.complete()
    }
  }
}
