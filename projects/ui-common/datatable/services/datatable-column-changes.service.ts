import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class DatatableColumnChangesService {

  private columnInputChanges = new Subject<undefined>()

  get columnInputChanges$(): Observable<undefined> {
    return this.columnInputChanges.asObservable()
  }

  onInputChange(): void {
    this.columnInputChanges.next(undefined)
  }

}
