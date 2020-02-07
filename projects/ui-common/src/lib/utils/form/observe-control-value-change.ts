import { AbstractControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, pairwise, startWith } from 'rxjs/operators'

import { observeControlValue } from './observe-control-value'

/**
 * Observe the value of a control with the previous.
 */
export function observeControlValueChange(control: AbstractControl): Observable<{ previous: any, current: any }> {
  return observeControlValue(control)
    .pipe(
      startWith(undefined),
      pairwise(),
      map(v => ({ previous: v[0], current: v[1] }))
    )
}
