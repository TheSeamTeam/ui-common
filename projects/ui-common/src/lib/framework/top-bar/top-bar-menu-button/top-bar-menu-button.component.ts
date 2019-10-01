import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'

import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import { CanDisableCtor, mixinDisabled } from '../../../core/common-behaviors/index'

class TopBarMenuButtonBase {}

const _TopBarMenuButtonMixinBase: CanDisableCtor & typeof TopBarMenuButtonBase =
  mixinDisabled(TopBarMenuButtonBase)

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[seamTopBarMenuButton]',
  templateUrl: './top-bar-menu-button.component.html',
  styleUrls: ['./top-bar-menu-button.component.scss'],
  exportAs: 'seamButton',
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'disabled' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[attr.type]': 'button',
    'class': 'btn btn-link border text-decoration-none',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarMenuButtonComponent extends _TopBarMenuButtonMixinBase implements OnInit, OnDestroy {

  faAngleDown = faAngleDown

  @Input() displayName: string
  @Input() organizationName?: string | null

  ngOnInit() { }

  ngOnDestroy() { }

}
