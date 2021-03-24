import { FocusMonitor } from '@angular/cdk/a11y'
import { Component, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core'

import { ButtonComponent } from '../button/button.component'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[seamProgressCircleButton]',
  templateUrl: './progress-circle-button.component.html',
  styleUrls: ['./progress-circle-button.component.scss'],
  exportAs: 'seamProgressCircleButton',
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'disabled', 'theme', 'size' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[attr.type]': 'type',
    'class': 'btn',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null'
  },
})
export class ProgressCircleButtonComponent extends ButtonComponent implements OnDestroy {

  @Input() fillBackground = false
  @Input() showText = false
  @Input() hiddenOnEmpty = true

  @Input() percentage = 100

  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}
