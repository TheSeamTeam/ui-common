import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class DatatableRefreshService {
  private readonly _refreshSubject = new Subject<void>()

  readonly refreshRequested$: Observable<void> =
    this._refreshSubject.asObservable()

  refresh(): void {
    this._refreshSubject.next()
  }
}
