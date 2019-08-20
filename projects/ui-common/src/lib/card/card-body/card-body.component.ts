import { AfterViewInit, Component, ContentChildren, HostBinding, OnDestroy, OnInit, QueryList } from '@angular/core'
import { untilDestroyed } from 'ngx-take-until-destroy'
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

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }

  ngAfterViewInit() {
    this.cardActionComponents.changes
      .pipe(
        untilDestroyed(this),
        startWith(this.cardActionComponents),
        filter(v => !!v),
        map(v => v.toArray() as CardActionComponent[]),
        filter(v => v && v.length > 0),
        tap(v => setTimeout(_ => v[v.length - 1].isLastAction = true))
      )
      .subscribe()
  }

}
