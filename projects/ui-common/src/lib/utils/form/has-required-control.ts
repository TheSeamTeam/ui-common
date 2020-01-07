import { AbstractControl } from '@angular/forms'

/**
 * Check if control has a required control.
 *
 * ----------------------------------------------------------------------------
 * NOTE: I am not sure about if this should be used or not.
 *
 * From my understanding this assumes that all the validators do not have some
 * unexpected side-effect from being called like this. It could be argued that
 * the validator is flawed and should be fixed if that is the case, but I am not
 * convinced that is correct yet.
 *
 * An example that I think is valid for this argument: A FormControl configured
 * to only check validators when a specific condition happens, because of a
 * reason that it has to do a long process. In that situation should this
 * function be smart enough to consider that or is it up to the validator to
 * consider this function possibly being used.
 *
 * This seems to assume the required validator will always be a synchronous
 * validator. That is a valid assumption if thinking about showing a required
 * state in the UI, but a FormControl does not neccessarily have to be used in
 * UI. So, I think it could be valid to have an async validator that uses the
 * name `required` for it error, but I do not have a good example, so I could be
 * wrong.
 * ----------------------------------------------------------------------------
 *
 * Source: https://gist.github.com/jsdevtom/5589af349a395b37e699b67417ef025b
 * @experimental
 * @ignore
 */
export function hasRequiredControl(abstractControl: AbstractControl): boolean {
  if (abstractControl.validator) {
    const validator = abstractControl.validator({}as AbstractControl)
    if (validator && validator.required) {
        return true
    }
  }
  if (abstractControl['controls']) {
      for (const controlName in abstractControl['controls']) {
          if (abstractControl['controls'][controlName]) {
              if (hasRequiredControl(abstractControl['controls'][controlName])) {
                  return true
              }
          }
      }
  }
  return false
}
