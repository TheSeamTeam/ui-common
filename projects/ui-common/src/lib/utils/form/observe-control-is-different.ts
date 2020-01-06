import { AbstractControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { observeControlValue } from './observe-control-value'

/**
 * Observe the changed state of the input value from the time this function is
 * called.
 *
 * When this function is called the value is stored. Each time the control's
 * value changes the value is compared with the initial value. Currenly the
 * values are compared as stringified objects using `JSON.stringify`.
 *
 * TODO: Allow the value compare implementation to be optionally changed.
 */
export function observeControlIsDifferent(control: AbstractControl): Observable<boolean> {
  const _initial = JSON.stringify(control.value)
  return observeControlValue(control)
    .pipe(
      map(value => JSON.stringify(value) !== _initial),
      distinctUntilChanged(),
    )
}
