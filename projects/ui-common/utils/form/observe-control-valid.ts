import { AbstractControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, pairwise, startWith } from 'rxjs/operators'

import { observeControlStatus } from './observe-control-status'

/**
 * Observe the valid state of a control.
 *
 * By default `waitOnPending` is false and the control states map to:
 *  'VALID' => true
 *  'INVALID' => false
 *  'PENDING' => false
 *
 * If `waitOnPending` is true the valid result when 'PENDING' remains the same
 *  as it was before 'PENDING' until it is no longer 'PENDING'.
 */
export function observeControlValid(control: AbstractControl, waitOnPending: boolean = false): Observable<boolean> {
  if (waitOnPending) {
    return observeControlStatus(control)
      .pipe(distinctUntilChanged())
      .pipe(startWith(undefined))
      .pipe(pairwise())
      .pipe(map(v => ({ previous: v[0], current: v[1] })))
      .pipe(map(v => v.current === 'PENDING' ? v.previous : v.current))
      .pipe(map(status => status === 'VALID'))
  } else {
    return observeControlStatus(control)
      .pipe(distinctUntilChanged())
      .pipe(map(status => status === 'VALID'))
  }
}
