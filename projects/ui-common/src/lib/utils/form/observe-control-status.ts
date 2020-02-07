import { AbstractControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'

import { waitOnNonPendingStatus } from './wait-on-non-pending-status'

/**
 * Observe the status of a control using a work around for status not changing
 * after pending.
 */
export function observeControlStatus(control: AbstractControl): Observable<string> {
  return of(control)
    .pipe(switchMap(_control => _control.statusChanges
      .pipe(startWith(_control.status))
      .pipe(switchMap(status => status === 'PENDING'
        ? waitOnNonPendingStatus(control)
          .pipe(startWith(status))
        : of(status)
      ))
    ))
}
