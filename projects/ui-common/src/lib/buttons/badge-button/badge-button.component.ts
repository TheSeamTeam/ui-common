import { FocusMonitor } from '@angular/cdk/a11y'
import { Component, ElementRef, HostBinding, Input, OnDestroy, Renderer2 } from '@angular/core'

import { ThemeTypes } from '../../models/index'
import { AnchorButtonComponent, ButtonComponent } from '../button/button.component'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[seamBadgeButton]',
  templateUrl: './badge-button.component.html',
  styleUrls: ['./badge-button.component.scss'],
  exportAs: 'seamBadgeButton',
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
export class BadgeButtonComponent extends ButtonComponent implements OnDestroy {

  @HostBinding('class.text-nowrap') _textNoWrap = true

  @Input() badgeTheme: ThemeTypes = 'light'
  @Input() badgeText = ''

  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'a[seamBadgeButton]',
  templateUrl: './badge-button.component.html',
  styleUrls: ['./badge-button.component.scss'],
  exportAs: 'seamBadgeButton,seamBadgeButtonAnchor',
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
})
export class AnchorBadgeButtonComponent extends AnchorButtonComponent implements OnDestroy {

  @HostBinding('class.text-nowrap') _textNoWrap = true

  @Input() badgeTheme: ThemeTypes = 'light'
  @Input() badgeText = ''

  constructor(
    _elementRef: ElementRef,
    _focusMonitor: FocusMonitor,
    _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

}
