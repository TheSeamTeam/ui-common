import { animate, animation, keyframes, style, transition, trigger, useAnimation } from '@angular/animations'
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core'

import { faCircle } from '@fortawesome/free-solid-svg-icons'

import { SeamIcon } from '../icon'

export const pulseAnimation = animation([
  style({ transform: 'scale(1)' }),
  animate(
    '{{ timings }}',
    keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale({{ scale }})', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ])
  )
])

@Component({
  selector: 'seam-icon-notification',
  template: `
    <seam-icon *ngIf="icon && !hidden" [@counterChange]="count"
      [grayscaleOnDisable]="grayscaleOnDisable"
      [disabled]="disabled"
      [iconClass]="iconClass"
      [icon]="icon"
      [size]="size"
      [showDefaultOnError]="showDefaultOnError"
      [iconType]="iconType">
    </seam-icon>
    <ng-content select=".sr-only"></ng-content>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
    }

    seam-icon {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 25% !important;
      height: 25% !important;
      min-width: 15px;
      min-height: 15px;
    }
  `],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  animations: [
    trigger('counterChange', [
      transition(
        ':increment',
        useAnimation(pulseAnimation, {
          params: {
            timings: '400ms ease-in-out',
            scale: 1.2
          }
        })
      )
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconNotificationComponent implements OnInit {

  @Input() count: number | undefined

  @Input() hidden = false

  /** Toggles whether the img/icon will attempt to be grayscale when disabled is true. */
  @Input() grayscaleOnDisable = true

  /** Toggles the img/icon to grayscale if `grayscaleOnDisable` is true. */
  @Input() disabled = false

  /**
   * Placed on the `.seam-icon--fa` and `seam-icon--img` elements.
   */
  @Input() iconClass: string

  /**
   * The icon to display.
   *
   * If the input icon is a string an `img` element will be used with icon as `src`.
   * If the input is not a string it will be assumed to be a font-awesome IconProp object.
   */
  @Input() icon: SeamIcon | undefined = faCircle

  /**
   * Toggles whether an image that has thrown the `onerror` event should show
   * the `defaultIcon` instead.
   */
  @Input() showDefaultOnError = false

  /**
   * Shown if icon is not set or if showDefaultOnError is true and img has thrown an error.
   *
   * NOTE: Not supported for icon-notification yet.
   */
  // @Input() defaultIcon: SeamIcon

  /**
   * NOTE: Only works for fa-icon for now.
   */
  @Input() size: string

  @Input() iconType: '' | 'borderless-styled-square' | 'styled-square' | 'image-fill' = 'image-fill'

  constructor(
    private _elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit() {
    if (this._elementRef && this._elementRef.nativeElement && this._elementRef.nativeElement.parentElement) {
      this._elementRef.nativeElement.parentElement.style.position = 'relative'
    }
  }

  // ngDoCheck() {}

}
