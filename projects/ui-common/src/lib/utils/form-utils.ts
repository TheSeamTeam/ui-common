import { AbstractControl } from '@angular/forms'
import { interval, merge, Observable, of } from 'rxjs'
import { distinctUntilChanged, filter, map, mapTo, pairwise, startWith, switchMap, take, throttleTime } from 'rxjs/operators'

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

/**
 * Observe the value of a control.
 */
export function observeControlValue<T = any>(control: AbstractControl): Observable<T> {
  return of(control)
    .pipe(switchMap(_control => _control.valueChanges
      .pipe(startWith(_control.value))
    ))
}

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

/**
 *
 */
export function getControlName(c: AbstractControl): string | null {
  if (!c.parent) { return null }
  const controls = c.parent.controls
  return Object.keys(controls).find(name => c === controls[name]) || null
}

/**
 *
 */
export function getControlPath(c: AbstractControl, path: string = ''): string | null {
  path = getControlName(c) + path

  if (c.parent && getControlName(c.parent)) {
    path = '.' + path
    return getControlPath(c.parent, path)
  } else {
    return path
  }

}

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
