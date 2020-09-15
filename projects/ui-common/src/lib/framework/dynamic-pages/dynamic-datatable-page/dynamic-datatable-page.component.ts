import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'seam-dynamic-datatable-page',
  templateUrl: './dynamic-datatable-page.component.html',
  styleUrls: ['./dynamic-datatable-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDatatablePageComponent implements OnInit, OnDestroy {

  private _tableDefSubscription = Subscription.EMPTY

  tableDef$: Observable<any>

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.tableDef$ = this._route.data.pipe(map(v => v['tableDef'] || undefined))
  }

  ngOnInit() {
    // console.log(this._route)
    // console.log(this._router)
    this.tableDef$.subscribe(v => console.log('tableDef$', v))
  }

  ngOnDestroy() { this._tableDefSubscription.unsubscribe() }

}
