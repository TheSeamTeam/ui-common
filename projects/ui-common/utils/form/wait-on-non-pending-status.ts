import { AbstractControl } from '@angular/forms'
import { interval, merge, Observable } from 'rxjs'
import { filter, map, mapTo, startWith, take } from 'rxjs/operators'

/**
 * Wait on the status of a form control to not be `'PENDING'`.
 *
 * NOTE: This function is mainly just a work around for an issue where
 *  `statusChanges` sometimes emits `'Pending'` without emitting another state
 *  when complete. Seems to happen with async validators if the value changes
 *  before completing, even if the validator completes(subscription `complete`
 *  if observable).
 */
export function waitOnNonPendingStatus(control: AbstractControl): Observable<string> {
  return merge(
      control.statusChanges,
      interval(30).pipe(mapTo(control), map(c => c.status))
    )
    .pipe(startWith(control.status))
    .pipe(filter(v => v !== 'PENDING'))
    .pipe(take(1))
}
