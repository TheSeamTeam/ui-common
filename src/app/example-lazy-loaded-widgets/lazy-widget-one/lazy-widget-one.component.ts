import { Component, OnInit } from '@angular/core'
import { of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { faBell, faWrench } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-lazy-widget-one',
  templateUrl: './lazy-widget-one.component.html',
  styleUrls: ['./lazy-widget-one.component.scss']
})
export class LazyWidgetOneComponent implements OnInit {

  faWrench = faWrench
  faBell = faBell

  items = [
    'one',
    'two',
    'three',
    'four'
  ]

  initialized$ = of(true).pipe(delay(5000))

  constructor() { }

  ngOnInit() {
  }

  getDate() {
    return Date.now()
  }

}
