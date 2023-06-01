import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, HostBinding, Input, TemplateRef, ViewEncapsulation } from '@angular/core'

import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import { CanDisableCtor, InputBoolean, mixinDisabled } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

class TopBarMenuButtonBase {}

const _TopBarMenuButtonMixinBase: CanDisableCtor & typeof TopBarMenuButtonBase =
  mixinDisabled(TopBarMenuButtonBase)

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seamTopBarMenuButton]',
  templateUrl: './top-bar-menu-button.component.html',
  styleUrls: ['./top-bar-menu-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'seamButton',
  inputs: [ 'disabled' ],
  host: {
    'attr.type': 'button',
    'class': 'btn border text-decoration-none py-0',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarMenuButtonComponent extends _TopBarMenuButtonMixinBase {
  static ngAcceptInputType_compact: BooleanInput

  faAngleDown = faAngleDown

  @Input() detailTpl: TemplateRef<object> | undefined | null

  @Input() @InputBoolean() compact = false

  /** Icon to display on mobile to activate profile dropdown. Defaults to faUserCircle. */
  @Input() profileIcon: SeamIcon | undefined | null

  @HostBinding('class.top-bar-menu-button--compact') get _hasCompactClass() { return this.compact }
  @HostBinding('class.p-0') get _hasPadding0Class() { return this.compact }
  @HostBinding('class.rounded') get _hasRoundedClass() { return this.compact }
  @HostBinding('class.btn-link') get _hasBtnLinkClass() { return !this.compact }

}
