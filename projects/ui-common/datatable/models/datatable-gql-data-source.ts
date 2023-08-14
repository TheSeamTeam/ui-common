import { CollectionViewer } from '@angular/cdk/collections'
import { combineLatest, Observable } from 'rxjs'

import { DatatableDataSource } from './datatable-data-source'

export class DatatableGqlDataSource<TRow> extends DatatableDataSource<TRow> {

  connect(collectionViewer: CollectionViewer): Observable<readonly TRow[]> {
    throw new Error('Method not implemented.')

    // return combineLatest([
    //   this.sorts$,
    //   this.filterStates$,
    //   this.page$
    // ]).pipe()
  }

  disconnect(collectionViewer: CollectionViewer): void {
    throw new Error('Method not implemented.')
  }

}
