import { FocusMonitor } from '@angular/cdk/a11y'
import { Component, ElementRef, HostBinding, Input, OnDestroy, Renderer2 } from '@angular/core'

import type { ThemeTypes } from '@theseam/ui-common/models'
import { AnchorButtonComponent, ButtonComponent } from '../button/button.component'

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seamBadgeButton]',
  templateUrl: './badge-button.component.html',
  styleUrls: ['./badge-button.component.scss'],
  exportAs: 'seamBadgeButton',
  inputs: [ 'disabled', 'theme', 'size' ],
  host: {
    '[attr.type]': 'type',
    'class': 'btn',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null'
  },
})
export class BadgeButtonComponent extends ButtonComponent implements OnDestroy {

  @HostBinding('class.text-nowrap') _textNoWrap = true

  @Input() badgeTheme: ThemeTypes = 'light'
  @Input() badgeText = ''

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[seamBadgeButton]',
  templateUrl: './badge-button.component.html',
  styleUrls: ['./badge-button.component.scss'],
  exportAs: 'seamBadgeButton,seamBadgeButtonAnchor',
  inputs: [ 'disabled', 'theme', 'size' ],
  host: {
    'class': 'btn',
    '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
  },
})
export class AnchorBadgeButtonComponent extends AnchorButtonComponent implements OnDestroy {

  @HostBinding('class.text-nowrap') _textNoWrap = true

  @Input() badgeTheme: ThemeTypes = 'light'
  @Input() badgeText = ''

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}
