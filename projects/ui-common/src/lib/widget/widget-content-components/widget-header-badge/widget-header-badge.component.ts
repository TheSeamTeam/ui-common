import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewEncapsulation } from '@angular/core'

import {
  CanThemeCtor,
  mixinTheme
} from '@theseam/ui-common/core'

class WidgetHeaderBadgeBase {

  constructor(
    public _elementRef: ElementRef
  ) { }

}

const _WidgetHeaderBadgeMixinBase:  CanThemeCtor &
    typeof WidgetHeaderBadgeBase = mixinTheme(WidgetHeaderBadgeBase, 'badge')

@Component({
  selector: 'seam-widget-header-badge',
  templateUrl: './widget-header-badge.component.html',
  styleUrls: ['./widget-header-badge.component.scss'],
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'theme' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'class': 'badge float-right'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetHeaderBadgeComponent extends _WidgetHeaderBadgeMixinBase implements OnInit {

  constructor(
    _elementRef: ElementRef
  ) { super(_elementRef) }

  ngOnInit() { }

}
