import { FocusMonitor } from '@angular/cdk/a11y'
import { ChangeDetectionStrategy, Component, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core'

import {
  CanDisableCtor,
  CanSizeCtor,
  CanThemeCtor,
  mixinDisabled,
  mixinSize,
  mixinTheme
} from '../../core/common-behaviors'

@Component({ template: '' })
// tslint:disable-next-line: component-class-suffix
class TheSeamButtonBase implements OnDestroy {
  constructor(
    public _elementRef: ElementRef,
    public _focusMonitor: FocusMonitor,
    public _renderer: Renderer2
  ) {
    this._focusMonitor.monitor(this._elementRef, true)
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef)
  }

  /** Focuses the button. */
  focus(): void {
    this._getHostElement().focus()
  }

  _getHostElement() {
    return this._elementRef.nativeElement
  }
}

const _TheSeamButtonMixinBase: CanDisableCtor & CanThemeCtor & CanSizeCtor &
    typeof TheSeamButtonBase = mixinSize(mixinTheme(mixinDisabled(TheSeamButtonBase), 'btn'), 'btn')


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[seamButton]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  exportAs: 'seamButton',
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'disabled', 'theme', 'size' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[attr.type]': 'type',
    'class': 'btn',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent extends _TheSeamButtonMixinBase implements OnDestroy {

  /** ARIA type for the button. */
  @Input() type: 'button' | 'submit' | 'reset' = 'button'

  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'a[seamButton]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  exportAs: 'seamButton,seamButtonBaseAnchor',
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'disabled', 'theme', 'size' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'class': 'btn',
    '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnchorButtonComponent extends _TheSeamButtonMixinBase implements OnDestroy {

  /** Tabindex of the button. */
  @Input() tabIndex: number

  // TODO: Consider adding dev warning for `window.opener` exploit. Could maybe
  // add `rel` it if the href isn't on the current domain or not specified in an
  // injected list. This probably isn't needed and may be to strict for our
  // usage, so I am just adding this as a reminder to think about it.
  //
  // rel="noopener noreferrer"

  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

}
