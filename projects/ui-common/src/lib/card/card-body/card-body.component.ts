import { AfterViewInit, Component, ContentChildren, HostBinding, OnDestroy, OnInit, QueryList } from '@angular/core'
import { Subscription } from 'rxjs'
import { filter, map, startWith, tap } from 'rxjs/operators'

import { CardActionComponent } from './../card-action/card-action.component'

@Component({
  selector: 'seam-card-body',
  templateUrl: './card-body.component.html',
  styleUrls: ['./card-body.component.scss']
})
export class CardBodyComponent implements OnInit, OnDestroy, AfterViewInit {

  @HostBinding('class.card-body') _cssClassCardBody = true
  @HostBinding('class.p-0') _cssClassP0 = true

  @ContentChildren(CardActionComponent) cardActionComponents: QueryList<CardActionComponent>

  private _changesSubscription = Subscription.EMPTY

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() {
    this._changesSubscription.unsubscribe()
  }

  ngAfterViewInit() {
    this._changesSubscription = this.cardActionComponents.changes
      .pipe(
        startWith(this.cardActionComponents),
        filter(v => !!v),
        map(v => v.toArray() as CardActionComponent[]),
        filter(v => v && v.length > 0),
        tap(v => setTimeout(_ => v[v.length - 1].isLastAction = true))
      )
      .subscribe()
  }

}
