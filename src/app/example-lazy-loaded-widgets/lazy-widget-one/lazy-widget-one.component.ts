import { Component } from '@angular/core'
import { of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { faBell, faWrench } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-lazy-widget-one',
  templateUrl: './lazy-widget-one.component.html',
  styleUrls: ['./lazy-widget-one.component.scss'],
  standalone: false,
})
export class LazyWidgetOneComponent {
  faWrench = faWrench
  faBell = faBell

  items = ['one', 'two', 'three', 'four']

  initialized$ = of(true).pipe(delay(5000))

  getDate() {
    return Date.now()
  }
}
