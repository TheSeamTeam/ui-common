import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  Input,
} from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { AbstractControl, FormControl } from '@angular/forms'
import { BehaviorSubject, merge, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { SeamIcon, TheSeamIconModule } from '@theseam/ui-common/icon'

export interface TheSeamPasswordValidatorItem {
  validatorName: string
  message: string
  /**
   * Which control the validator lives on.
   * - 'field': checks password1 control (default for most validators)
   * - 'group': checks the FormGroup itself (for passwordMatch)
   */
  target?: 'field' | 'group'
}

export interface TheSeamPasswordValidatorRecord {
  _id: string
  message: string
  icon?: SeamIcon
  iconClass?: string
}

const DEFAULT_VALIDATORS: TheSeamPasswordValidatorItem[] = [
  { validatorName: 'passwordLength', message: 'Be at least 8 characters.' },
  {
    validatorName: 'passwordLowercase',
    message: 'At least one lowercase letter.',
  },
  {
    validatorName: 'passwordUppercase',
    message: 'At least one uppercase letter.',
  },
  { validatorName: 'passwordNumber', message: 'At least one number.' },
  {
    validatorName: 'passwordSpecialChar',
    message: 'At least one special character (!, @, #, etc.).',
  },
  {
    validatorName: 'passwordContent',
    message: 'Cannot contain "password".',
  },
  {
    validatorName: 'passwordMatch',
    message: 'Both password fields must match.',
    target: 'group',
  },
]

@Component({
  selector: 'seam-password-validators-list',
  templateUrl: './password-validators-list.component.html',
  styleUrls: ['./password-validators-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe, TheSeamIconModule],
})
export class TheSeamPasswordValidatorsListComponent implements DoCheck {
  private readonly _successIcon = { icon: faCheck, iconClass: 'text-success' }
  private readonly _errorIcon = { icon: faTimes, iconClass: 'text-danger' }

  @Input() fieldOneName = 'password1'
  @Input() fieldTwoName = 'password2'

  /**
   * Override the default validator list. Each item specifies a validatorName,
   * display message, and optionally whether the error is on the field or group.
   */
  @Input() validators: TheSeamPasswordValidatorItem[] = DEFAULT_VALIDATORS

  @Input()
  get control(): AbstractControl | undefined {
    return this._controlSubject.value
  }
  set control(value: AbstractControl | undefined) {
    this._controlSubject.next(value)
  }

  readonly _controlSubject = new BehaviorSubject<AbstractControl | undefined>(
    undefined,
  )
  readonly _touched = new BehaviorSubject<boolean>(false)
  readonly _records$: Observable<TheSeamPasswordValidatorRecord[]> =
    this._createRecordsObservable()

  ngDoCheck() {
    const fieldOne = this._getField(this.fieldOneName)
    const fieldTwo = this._getField(this.fieldTwoName)
    if (!fieldOne || !fieldTwo) {
      return
    }
    const touched = fieldOne.touched || fieldTwo.touched
    if (this._touched.value !== touched) {
      this._touched.next(touched)
    }
  }

  private _getField(name: string): FormControl | undefined {
    return this.control?.get(name) as FormControl | undefined
  }

  private _createRecordsObservable(): Observable<
    TheSeamPasswordValidatorRecord[]
  > {
    return this._controlSubject.pipe(
      switchMap((control) => {
        if (!control) {
          return of([])
        }
        return merge(control.statusChanges, this._touched).pipe(
          startWith(control.status),
          map(() => this._buildRecords(control)),
        )
      }),
    )
  }

  private _buildRecords(
    group: AbstractControl,
  ): TheSeamPasswordValidatorRecord[] {
    const fieldOne = this._getField(this.fieldOneName)
    const fieldTwo = this._getField(this.fieldTwoName)

    return this.validators.map((item) => {
      const record: TheSeamPasswordValidatorRecord = {
        _id: item.validatorName,
        message: item.message,
      }

      if (!fieldOne || !fieldTwo) {
        return record
      }

      const isGroupValidator = item.target === 'group'

      if (isGroupValidator) {
        // Group validators only show status when both fields are dirty
        if (!fieldOne.dirty || !fieldTwo.dirty) {
          return record
        }
        const hasError = group.hasError(item.validatorName)
        Object.assign(record, hasError ? this._errorIcon : this._successIcon)
      } else {
        // Field validators show status when password1 is dirty
        if (!fieldOne.dirty) {
          return record
        }
        const hasError = fieldOne.hasError(item.validatorName)
        Object.assign(record, hasError ? this._errorIcon : this._successIcon)
      }

      return record
    })
  }

  _trackBy(_index: number, item: TheSeamPasswordValidatorRecord) {
    return item._id
  }
}
