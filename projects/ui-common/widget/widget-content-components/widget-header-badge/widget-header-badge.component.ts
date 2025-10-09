import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, Renderer2, ViewEncapsulation } from '@angular/core'

import {
  CanThemeCtor,
  mixinTheme,
} from '@theseam/ui-common/core'

class WidgetHeaderBadgeBase {

  constructor(
    public _elementRef: ElementRef,
  ) { }

}

const _WidgetHeaderBadgeMixinBase: CanThemeCtor &
    typeof WidgetHeaderBadgeBase = mixinTheme(WidgetHeaderBadgeBase, 'badge')

@Component({
  selector: 'seam-widget-header-badge',
  templateUrl: './widget-header-badge.component.html',
  styleUrls: ['./widget-header-badge.component.scss'],
  inputs: ['theme'],
  host: {
    'class': 'badge float-right',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WidgetHeaderBadgeComponent extends _WidgetHeaderBadgeMixinBase {

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    _elementRef: ElementRef,
  ) { super(_elementRef) }

}
