import { FocusMonitor } from '@angular/cdk/a11y'
import { Component, ElementRef, HostBinding, Input, OnDestroy, Renderer2 } from '@angular/core'

import type { ThemeTypes } from '@theseam/ui-common/models'

import { TheSeamAnchorButtonComponent, TheSeamButtonComponent } from '../button/button.component'

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seamBadgeButton]',
  templateUrl: './badge-button.component.html',
  styleUrls: ['./badge-button.component.scss'],
  exportAs: 'seamBadgeButton',
  inputs: ['disabled', 'theme', 'size'],
  host: {
    '[attr.type]': 'type',
    'class': 'btn',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  standalone: false,
})
export class TheSeamBadgeButtonComponent extends TheSeamButtonComponent implements OnDestroy {

  @HostBinding('class.text-nowrap') _textNoWrap = true

  @Input() badgeTheme: ThemeTypes = 'light'
  @Input() badgeText = ''

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    readonly _elementRef: ElementRef,
    readonly _focusMonitor: FocusMonitor,
    readonly _renderer: Renderer2,
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[seamBadgeButton]',
  templateUrl: './badge-button.component.html',
  styleUrls: ['./badge-button.component.scss'],
  exportAs: 'seamBadgeButton,seamBadgeButtonAnchor',
  inputs: ['disabled', 'theme', 'size'],
  host: {
    'class': 'btn',
    '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
  },
  standalone: false,
})
export class TheSeamAnchorBadgeButtonComponent extends TheSeamAnchorButtonComponent implements OnDestroy {

  @HostBinding('class.text-nowrap') _textNoWrap = true

  @Input() badgeTheme: ThemeTypes = 'light'
  @Input() badgeText = ''

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    readonly _elementRef: ElementRef,
    readonly _focusMonitor: FocusMonitor,
    readonly _renderer: Renderer2,
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}
