import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core'

import { faUserCircle } from '@fortawesome/free-regular-svg-icons'
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
    'attr.type': 'button',
    'class': 'btn border text-decoration-none py-0',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarMenuButtonComponent extends _TopBarMenuButtonMixinBase implements OnInit, OnDestroy {

  faAngleDown = faAngleDown
  profileIcon = faUserCircle

  @Input() displayName: string
  @Input() organizationName?: string | null
  @Input() originalDisplayName?: string | null
  @Input() organizationId?: string | null

  @Input() compact: boolean = false

  @HostBinding('class.top-bar-menu-button--compact') get _hasCompactClass() { return this.compact }
  @HostBinding('class.p-0') get _hasPadding0Class() { return this.compact }
  @HostBinding('class.rounded') get _hasRoundedClass() { return this.compact }
  @HostBinding('class.btn-link') get _hasBtnLinkClass() { return !this.compact }

  ngOnInit() { }

  ngOnDestroy() { }

}
