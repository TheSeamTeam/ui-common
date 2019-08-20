import { animate, query, style, transition, trigger } from '@angular/animations'
import { Component, ContentChild, Input, OnInit } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { LibIcon } from '../../icon/icon'

import { WidgetIconTplDirective } from '../directives/widget-icon-tpl.directive'
import { WidgetTitleTplDirective } from '../directives/widget-title-tpl.directive'

@Component({
  selector: 'seam-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  animations: [
    trigger('loadingAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('500ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class WidgetComponent implements OnInit {

  @Input() titleText: string

  @Input()
  get icon(): LibIcon | undefined { return this._iconUrl || this._iconObj }
  set icon(value: LibIcon | undefined) {
    if (typeof value === 'string') {
      this._iconUrl = value
      this._iconObj = undefined
    } else {
      this._iconUrl = undefined
      this._iconObj = value
    }
  }

  public _iconUrl: string | undefined
  public _iconObj: IconProp | undefined

  @Input() iconClass: string

  @Input() loading = false

  @ContentChild(WidgetIconTplDirective, { static: true }) iconTpl: WidgetIconTplDirective
  @ContentChild(WidgetTitleTplDirective, { static: true }) titleTpl: WidgetTitleTplDirective

  constructor() { }

  ngOnInit() {
  }

}
