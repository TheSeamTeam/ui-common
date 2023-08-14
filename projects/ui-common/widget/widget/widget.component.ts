import { animate, style, transition, trigger } from '@angular/animations'
import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, Input, ViewEncapsulation } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown, faCog } from '@fortawesome/free-solid-svg-icons'
import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import { WidgetIconTplDirective } from '../directives/widget-icon-tpl.directive'
import { WidgetTitleTplDirective } from '../directives/widget-title-tpl.directive'

/**
 * Widget
 *
 * Widgets are designed with the intention of being on a dashboard. Other uses
 * may be supported as the need arises.
 *
 * The only HTML/CSS use should be a widget content component, unless there is a
 * case requiring more advanced design. This is so that we can manage a common
 * style for our widgets. If a case requiring non widget content components is
 * used then the situation should be considered for becoming a widget component.
 */
@Component({
  selector: 'seam-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('loadingAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('250ms ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class WidgetComponent {

  static ngAcceptInputType_hasHeader: BooleanInput
  static ngAcceptInputType_loading: BooleanInput
  static ngAcceptInputType_hasConfig: BooleanInput
  static ngAcceptInputType_canCollapse: BooleanInput

  /** @ignore */
  configIcon = faCog
  /** @ignore */
  collapseIcon = faAngleDown

  @Input() @InputBoolean() collapsed = false

  /**
   * Toggles the top header bar of a widget. This should be true for most
   * widgets.
   */
  @Input() @InputBoolean() hasHeader = true

  /**
   * Title displayed in the top header.
   *
   * If a more advanced title is needed you can use `seamWidgetTitleTpl`
   * template directive, but text is recommended, because allowing custom styles
   * can lead to inconsitency quickly as different developers keep making
   * tweaks.
   */
  @Input() titleText: string | undefined | null

  /**
   * Icon displayed in the top header.
   *
   * If a more advanced icon is needed you can use `seamWidgetIconTpl` template
   * directive, but a `SeamIcon` input is recommended, because allowing custom
   * icons that do not follow the tested types can lead to inconsitency quickly
   * as different developers keep making tweaks.
   */
  @Input()
  get icon(): SeamIcon | undefined { return this._iconUrl || this._iconObj }
  set icon(value: SeamIcon | undefined) {
    if (typeof value === 'string') {
      this._iconUrl = value
      this._iconObj = undefined
    } else {
      this._iconUrl = undefined
      this._iconObj = value
    }
  }

  /** @ignore */
  public _iconUrl: string | undefined
  /** @ignore */
  public _iconObj: IconProp | undefined

  /** Add a css class to the header icon. */
  @Input() iconClass: string | undefined | null

  /** Shows widget loading instead of content. */
  @Input() @InputBoolean() loading = false

  /** @ignore */
  // NOTE: Config is still being worked on.
  @Input() @InputBoolean() hasConfig = false
  /** @ignore */
  // NOTE: Collapse is still being worked on.
  @Input() @InputBoolean() canCollapse = false

  @ContentChild(WidgetIconTplDirective, { static: true }) iconTpl?: WidgetIconTplDirective
  @ContentChild(WidgetTitleTplDirective, { static: true }) titleTpl?: WidgetTitleTplDirective

  /**
   * Toggles a widget's collapsed state.
   *
   * NOTE: Collapse is still being worked on.
   * @depracated
   * @ignore
   */
  collapse() {
    this.collapsed = !this.collapsed
  }

}
