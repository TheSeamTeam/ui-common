import { AbstractControl, AsyncValidatorFn } from '@angular/forms'
import { firstValueFrom, isObservable, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type TheSeamUserExistsFn = (
  userName: string,
) => Promise<boolean> | Observable<boolean> | boolean

/**
 * Validates that a username already exists.
 *
 * Mirrors the `emailExistsValidator` pattern from `@theseam/ui-common/validators`.
 */
export function usernameExistsValidator(
  userExists: TheSeamUserExistsFn,
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const validationResult = (exists: boolean) => {
      return exists === false ? null : { usernameExists: {} }
    }

    const fnRes = userExists(control.value)
    if (isObservable(fnRes)) {
      return firstValueFrom(fnRes.pipe(map(validationResult)))
    }
    return Promise.resolve(fnRes).then(validationResult)
  }
}
