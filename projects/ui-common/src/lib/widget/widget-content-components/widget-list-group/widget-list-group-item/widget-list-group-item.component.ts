import { FocusMonitor } from '@angular/cdk/a11y'
import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core'

import {
  CanBeActive,
  CanBeActiveCtor,
  CanDisable,
  CanDisableCtor,
  CanTheme,
  CanThemeCtor,
  HasElementRef,
  mixinActive,
  mixinDisabled,
  mixinTheme
} from '../../../../core/common-behaviors/index'
import { SeamIcon } from '../../../../icon/index'

import { WidgetListGroupItemIconTplDirective } from './widget-list-group-item-icon-tpl.directive'

const WIDGET_LIST_GROUP_ITEM_INPUTS = [ 'disabled', 'theme', 'active', 'icon', 'iconClass', 'label' ]

class WidgetListGroupItemBase {

  @ContentChild(WidgetListGroupItemIconTplDirective, { static: true }) iconTpl?: WidgetListGroupItemIconTplDirective

  icon?: SeamIcon
  iconClass?: string

  label?: string

  constructor(
    public _elementRef: ElementRef,
    public _renderer: Renderer2
  ) { }

  /** Focuses the element. */
  focus(): void {
    this._getHostElement().focus()
  }

  _getHostElement() {
    return this._elementRef.nativeElement
  }
}

class WidgetListGroupItemActionableBase extends WidgetListGroupItemBase implements OnDestroy {
  constructor(
    public _elementRef: ElementRef,
    public _focusMonitor: FocusMonitor,
    public _renderer: Renderer2
  ) {
    super(_elementRef, _renderer)
    this._focusMonitor.monitor(this._elementRef, true)
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef)
  }
}


const _WidgetListGroupItemBase: CanDisableCtor & CanThemeCtor & CanBeActiveCtor &
  typeof WidgetListGroupItemBase = mixinActive(mixinTheme(mixinDisabled(WidgetListGroupItemBase), 'list-group-item'))

const _WidgetListGroupItemActionableBase: CanDisableCtor & CanThemeCtor & CanBeActiveCtor &
  typeof WidgetListGroupItemActionableBase = mixinActive(mixinTheme(mixinDisabled(WidgetListGroupItemActionableBase), 'list-group-item'))

@Component({
  selector: 'seam-widget-list-group-item',
  templateUrl: './widget-list-group-item.component.html',
  styleUrls: ['./widget-list-group-item.component.scss'],
  exportAs: 'seamWidgetListGroupItem',
  inputs: WIDGET_LIST_GROUP_ITEM_INPUTS,
  host: {
    'class': 'list-group-item',
    '[class.active]': 'active',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetListGroupItemComponent extends _WidgetListGroupItemBase
  implements OnInit, HasElementRef, CanTheme, CanDisable, CanBeActive {

  constructor(
    public _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    public _renderer: Renderer2
  ) {
    super(_elementRef, _renderer)
  }

  ngOnInit() { }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[seam-widget-list-group-item],button[seamWidgetListGroupItem]',
  templateUrl: './widget-list-group-item.component.html',
  styleUrls: ['./widget-list-group-item.component.scss'],
  exportAs: 'seamWidgetListGroupItem',
  inputs: WIDGET_LIST_GROUP_ITEM_INPUTS,
  host: {
    '[attr.type]': 'type',
    'class': 'list-group-item list-group-item-action',
    '[class.active]': 'active',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetListGroupItemButtonComponent extends _WidgetListGroupItemActionableBase
  implements OnInit, HasElementRef, CanTheme, CanDisable, CanBeActive, OnDestroy {

  /** ARIA type for the button. */
  @Input() type: 'button' | 'submit' | 'reset' = 'button'

  constructor(
    public _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    public _focusMonitor: FocusMonitor,
    public _renderer: Renderer2
  ) {
    super(_elementRef, _focusMonitor, _renderer)
  }

  ngOnInit() { }

  ngOnDestroy() { super.ngOnDestroy() }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'a[seam-widget-list-group-item],a[seamWidgetListGroupItem]',
  templateUrl: './widget-list-group-item.component.html',
  styleUrls: ['./widget-list-group-item.component.scss'],
  exportAs: 'seamWidgetListGroupItem',
  inputs: WIDGET_LIST_GROUP_ITEM_INPUTS,
  host: {
    'class': 'list-group-item list-group-item-action',
    '[class.active]': 'active',
    '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_haltDisabledEvents($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetListGroupItemAnchorComponent extends _WidgetListGroupItemActionableBase
  implements OnInit, HasElementRef, CanTheme, CanDisable, CanBeActive, OnDestroy {

  /** Tabindex of the button. */
  @Input() tabIndex: number

  constructor(
    public _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    public _focusMonitor: FocusMonitor,
    public _renderer: Renderer2
  ) {
    super(_elementRef, _focusMonitor, _renderer)
  }

  ngOnInit() { }

  ngOnDestroy() { super.ngOnDestroy() }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

}
