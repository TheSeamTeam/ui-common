import { FormControl } from '@angular/forms'
import { isObservable, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * Validates that an email already exists.
 */
export function emailExistsValidator(
  emailExists: (email: string) => Promise<boolean> | Observable<boolean> | boolean
) {
  return (control: FormControl) => {
    const validationResult = (exists: boolean) => {
      return exists === false ? null : { 'emailExists': {} }
    }

    const fnRes = emailExists(control.value)
    if (isObservable(fnRes)) {
      return fnRes.pipe(map(validationResult))
    }
    return Promise.resolve(fnRes).then(validationResult)
  }
}
