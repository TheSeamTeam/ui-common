import { Component, HostBinding, Input, OnInit } from '@angular/core'

import type { ThemeTypes } from '@lib/ui-common/models'

@Component({
  selector: 'seam-card-action',
  templateUrl: './card-action.component.html',
  styleUrls: ['./card-action.component.scss']
})
export class CardActionComponent implements OnInit {

  @HostBinding('class.border-left') _cssClassBorderLeft = true

  @Input() theme: ThemeTypes = 'lightgray'

  @Input() title: string

  @Input() isLastAction = false

  constructor() { }

  ngOnInit() {
  }

}
