import { AfterViewInit, Component, ContentChildren, HostBinding, OnDestroy, QueryList } from '@angular/core'
import { Subscription } from 'rxjs'
import { filter, map, startWith, tap } from 'rxjs/operators'

import { TheSeamCardActionComponent } from './../card-action/card-action.component'

@Component({
  selector: 'seam-card-body',
  templateUrl: './card-body.component.html',
  styleUrls: ['./card-body.component.scss'],
})
export class TheSeamCardBodyComponent implements OnDestroy, AfterViewInit {

  @HostBinding('class.card-body') _cssClassCardBody = true
  @HostBinding('class.p-0') _cssClassP0 = true

  @ContentChildren(TheSeamCardActionComponent) TheSeamCardActionComponents?: QueryList<TheSeamCardActionComponent>

  private _changesSubscription: Subscription | undefined

  ngOnDestroy() {
    this._changesSubscription?.unsubscribe()
  }

  ngAfterViewInit() {
    this._changesSubscription = this.TheSeamCardActionComponents?.changes.pipe(
      startWith(this.TheSeamCardActionComponents),
      filter(v => !!v),
      map(v => v.toArray() as TheSeamCardActionComponent[]),
      filter(v => v && v.length > 0),
      tap(v => setTimeout(() => v[v.length - 1].isLastAction = true))
    ).subscribe()
  }

}
