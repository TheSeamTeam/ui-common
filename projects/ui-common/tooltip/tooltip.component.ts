import { AnimationEvent, transition, trigger, style, animate } from '@angular/animations'
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  TemplateRef,
} from '@angular/core'
import { Subject } from 'rxjs'

export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
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
})
export class TooltipComponent implements OnDestroy {

  @Input() content: string | TemplateRef<any> | null = null
  @Input() tooltipClass?: string
  @Input() context?: any
  @Input() placement: TooltipPlacement = 'top'
  @Input() tooltipId?: string

  /** A subject emitting after the tooltip enters the view. */
  readonly _afterEnter: Subject<void> = new Subject()

  /** A subject emitting after the tooltip exits the view. */
  readonly _afterExit: Subject<void> = new Subject()

  @HostBinding('class')
  get hostClasses(): string {
    const baseClass = 'tooltip show'
    const placementClass = this.getPlacementClass()
    return `${baseClass} ${placementClass}`
  }

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

  private getPlacementClass(): string {
    switch (this.placement) {
      case 'top':
      case 'top-start':
      case 'top-end':
        return 'bs-tooltip-top'
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        return 'bs-tooltip-bottom'
      case 'left':
      case 'left-start':
      case 'left-end':
        return 'bs-tooltip-left'
      case 'right':
      case 'right-start':
      case 'right-end':
        return 'bs-tooltip-right'
      case 'auto':
        return 'bs-tooltip-auto'
      default:
        return 'bs-tooltip-top'
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
