import { FocusMonitor } from '@angular/cdk/a11y'
import { BooleanInput, NumberInput } from '@angular/cdk/coercion'
import { Component, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core'

import { InputBoolean, InputNumber } from '@theseam/ui-common/core'

import { ButtonComponent } from '../button/button.component'

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seamProgressCircleButton]',
  templateUrl: './progress-circle-button.component.html',
  styleUrls: ['./progress-circle-button.component.scss'],
  exportAs: 'seamProgressCircleButton',
  inputs: [ 'disabled', 'theme', 'size' ],
  host: {
    '[attr.type]': 'type',
    'class': 'btn',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null'
  },
})
export class ProgressCircleButtonComponent extends ButtonComponent implements OnDestroy {
  static ngAcceptInputType_fillBackground: BooleanInput
  static ngAcceptInputType_showText: BooleanInput
  static ngAcceptInputType_hiddenOnEmpty: BooleanInput
  static ngAcceptInputType_percentage: NumberInput

  @Input() @InputBoolean() fillBackground = false
  @Input() @InputBoolean() showText = false
  @Input() @InputBoolean() hiddenOnEmpty = true

  @Input() @InputNumber(0) percentage = 100

  constructor(
    readonly _elementRef: ElementRef,
    readonly _focusMonitor: FocusMonitor,
    readonly _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}
