import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core'

import { faUserCircle } from '@fortawesome/free-regular-svg-icons'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import { CanDisableCtor, InputBoolean, mixinDisabled } from '@theseam/ui-common/core'

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
  static ngAcceptInputType_compact: BooleanInput

  faAngleDown = faAngleDown
  profileIcon = faUserCircle

  @Input() detailTpl: TemplateRef<{}> | undefined | null

  @Input() @InputBoolean() compact: boolean = false

  @HostBinding('class.top-bar-menu-button--compact') get _hasCompactClass() { return this.compact }
  @HostBinding('class.p-0') get _hasPadding0Class() { return this.compact }
  @HostBinding('class.rounded') get _hasRoundedClass() { return this.compact }
  @HostBinding('class.btn-link') get _hasBtnLinkClass() { return !this.compact }

  ngOnInit() { }

  ngOnDestroy() { }

}