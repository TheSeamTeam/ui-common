import { animate, state, style, transition, trigger } from '@angular/animations'
import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, Inject, Input, isDevMode, OnDestroy, Optional, ViewEncapsulation } from '@angular/core'
import { Subject, takeUntil, tap } from 'rxjs'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown, faCog } from '@fortawesome/free-solid-svg-icons'
import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'
import { hasProperty } from '@theseam/ui-common/utils'

import { WidgetIconTplDirective } from '../directives/widget-icon-tpl.directive'
import { WidgetTitleTplDirective } from '../directives/widget-title-tpl.directive'
import { WidgetPreferencesService } from '../preferences/widget-preferences.service'
import { THESEAM_WIDGET_DATA, THESEAM_WIDGET_DEFAULTS } from '../widget-token'
import { TheSeamWidgetData, TheSeamWidgetDefaults } from '../widget.models'

const EXPANDED_STATE = 'expanded'
const COLLAPSED_STATE = 'collapsed'

const EXPAND_TRANSITION = `${EXPANDED_STATE} <=> ${COLLAPSED_STATE}`

const loadingAnimation = trigger('loadingAnim', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('250ms ease-in-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('250ms ease-in-out', style({ opacity: 0 })),
  ]),
])

/**
 * I was having an issue getting the content to not be removed from the DOM,
 * before the animation was complete. This animation is a hack to keep the
 * content in the DOM until the animation is complete.
 */
const keepContentAnimation = trigger('keepContentAnim', [
  transition(':leave', [
    style({ opacity: 1 }),
    animate('0ms', style({ opacity: 0 })),
  ]),
])

const collapseAnimation = trigger('collapseAnim', [
  state(EXPANDED_STATE, style({ height: '*' })),
  state(COLLAPSED_STATE, style({ height: '0' })),
  transition(EXPAND_TRANSITION, animate('0.3s ease-in-out')),
])

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
  providers: [
    WidgetPreferencesService,
  ],
  encapsulation: ViewEncapsulation.None,
  animations: [
    loadingAnimation,
    collapseAnimation,
    keepContentAnimation,
  ],
})
export class WidgetComponent implements OnDestroy {

  static ngAcceptInputType_hasHeader: BooleanInput
  static ngAcceptInputType_loading: BooleanInput
  static ngAcceptInputType_hasConfig: BooleanInput
  static ngAcceptInputType_canCollapse: BooleanInput

  readonly configIcon = faCog
  readonly collapseIcon = faAngleDown

  private readonly _ngUnsubscribe = new Subject<void>()

  private _preferencesKey?: string

  /**
   * Toggles the collapsed state of a widget.
   */
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

  _iconUrl: string | undefined
  _iconObj: IconProp | undefined

  /** Add a css class to the header icon. */
  @Input() iconClass: string | undefined | null

  /** Shows widget loading instead of content. */
  @Input() @InputBoolean() loading = false

  /** @ignore */
  // NOTE: Config is still being worked on.
  @Input() @InputBoolean() hasConfig = false

  /**
   * Toggles the ability to collapse a widget. An icon will be displayed in the
   * header to toggle the collapsed state.
   */
  @Input() @InputBoolean() canCollapse = false

  @ContentChild(WidgetIconTplDirective, { static: true }) iconTpl?: WidgetIconTplDirective
  @ContentChild(WidgetTitleTplDirective, { static: true }) titleTpl?: WidgetTitleTplDirective

  constructor(
    private readonly _widgetPreferences: WidgetPreferencesService,
    @Optional() @Inject(THESEAM_WIDGET_DEFAULTS) private readonly _defaults?: TheSeamWidgetDefaults,
    @Optional() @Inject(THESEAM_WIDGET_DATA) private readonly _data?: TheSeamWidgetData,
  ) {
    if (this._defaults) {
      if (hasProperty(this._defaults, 'canCollapse')) {
        this.canCollapse = this._defaults.canCollapse
      }
      if (hasProperty(this._defaults, 'collapsed')) {
        this.collapsed = this._defaults.collapsed
      }
    }

    if (this._data && this._data.widgetId) {
      this._preferencesKey = `widget:${this._data.widgetId}`
      this._widgetPreferences.preferences(this._preferencesKey).pipe(
        tap(prefs => {
          if (hasProperty(prefs, 'collapsed')) {
            this.collapsed = prefs.collapsed
          }
        }),
        takeUntil(this._ngUnsubscribe)
      ).subscribe()
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  /**
   * Toggles a widget's collapsed state.
   */
  public collapse() {
    if (!this.canCollapse) {
      if (isDevMode()) {
        console.warn('WidgetComponent: collapse() called when canCollapse is false.')
      }
      return
    }

    this.collapsed = !this.collapsed

    // Only update the preference, if collapse method is called, because it is
    // assumed that the user is collapsing the widget. If the collapsed state is
    // changed by other means, such using the widget's `collapsed` input, then
    // the preference should not be updated, because that is assumed to be an
    // app controlled change that should not be persisted.
    if (this._preferencesKey) {
      this._widgetPreferences.patchPreferences(this._preferencesKey, { collapsed: this.collapsed })
    }
  }

  get collapseState(): string { return this.collapsed ? COLLAPSED_STATE : EXPANDED_STATE }

}
