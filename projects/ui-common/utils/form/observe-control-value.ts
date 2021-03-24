import { AbstractControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'

/**
 * Observe the value of a control.
 */
export function observeControlValue<T = any>(control: AbstractControl): Observable<T> {
  return of(control)
    .pipe(switchMap(_control => _control.valueChanges
      .pipe(startWith(_control.value))
    ))
}
