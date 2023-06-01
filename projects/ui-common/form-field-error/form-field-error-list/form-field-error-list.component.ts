import { Component, ContentChildren, DoCheck, HostBinding, Input, OnDestroy, QueryList, TemplateRef } from '@angular/core'
import { AbstractControl, AbstractControlDirective, ValidationErrors } from '@angular/forms'
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators'

import { FormFieldErrorListItemTplDirective } from './form-field-error-list-item-tpl.directive'

export interface IErrorRecord {
  validatorName: string
  error: any,
  message?: string
  template?: TemplateRef<any>

  external?: boolean

  _errors?: ValidationErrors
}

/**
 * NOTE: This class has some issues with filtering duplicate validators. The
 * inputs will be cleaned up soon to fix the input confusion.
 *
 * TODO: Cleanup remaining code from before refactor.
 */
@Component({
  selector: 'seam-form-field-error-list',
  templateUrl: './form-field-error-list.component.html',
  styleUrls: ['./form-field-error-list.component.scss']
})
export class FormFieldErrorListComponent implements OnDestroy, DoCheck {

  @HostBinding('style.display') get _display() {
    return this.showErrors ? 'block' : 'none'
  }

  private static readonly defaultMessages: { [name: string]: ((params: any) => string) | (() => string) } = {
    // required: () => 'Required',
    // minlength: (params) => 'The min number of characters is ' + params.requiredLength,
    // maxlength: (params) => 'The max allowed number of characters is ' + params.requiredLength,
    // pattern: (params) => 'The required pattern is: ' + params.requiredPattern
  }

  private readonly _defaultMessages: { [name: string]: ((params: any) => string) | (() => string) } = {
    // required: () => 'Required',
    // minlength: (params) => 'The min number of characters is ' + params.requiredLength,
    // maxlength: (params) => 'The max allowed number of characters is ' + params.requiredLength,
    // pattern: (params) => 'The required pattern is: ' + params.requiredPattern
  }

  private _errors: any[] = []

  public _paddingErrors = []

  @Input()
  set errors(records: IErrorRecord[] | undefined | null) {
    // if (val instanceof Array) {
    //   this._errors = val
    // } else {
    //   const errs = []
    //   for (const k in val) {
    //     if (val[k]) {
    //       const err = val[k]
    //       const newErr = {
    //         validatorName: k,
    //         error: err,
    //         message: '',
    //         template: err.template,
    //         external: !!err.external
    //       }

    //       if (err.message) {
    //         const msgTmp = err.message
    //         if (typeof msgTmp === 'string') {
    //           newErr.message = msgTmp
    //         } else if (typeof msgTmp === 'function') {
    //           newErr.message = msgTmp(err)
    //         }
    //       } else if (FormFieldErrorListComponent.defaultMessages[k]) {
    //         const defaultMsg = FormFieldErrorListComponent.defaultMessages[k]
    //         if (typeof defaultMsg === 'string') {
    //           newErr.message = defaultMsg
    //         } else if (typeof defaultMsg === 'function') {
    //           newErr.message = defaultMsg(err)
    //         }
    //       }

    //       errs.push(newErr)
    //     }
    //   }
    //   this._errors = errs
    // }

    this._initErrorInput(records || [])
  }

  // get errors() {
  //   let errs = []

  //   if (this._errors) {
  //     if (!this.messages) {
  //       errs = this._errors
  //     } else {
  //       errs = this._errors.map(err => {
  //         if (this.messages && err.validatorName && this.messages[err.validatorName]) {
  //           return Object.assign({}, err, {
  //             message: this.messages[err.validatorName]
  //           })
  //         } else {
  //           return err
  //         }
  //       })
  //     }
  //   }

  //   if (this.control) {
  //     for (const key in this.control.errors) {
  //       if (this.control.errors[key]) {
  //         const err = this.control.errors[key]

  //         const newErr = {
  //           validatorName: key,
  //           error: err,
  //           message: '',
  //           external: false
  //         }

  //         if (FormFieldErrorListComponent.defaultMessages[key]) {
  //           const defaultMsg = FormFieldErrorListComponent.defaultMessages[key]
  //           if (typeof defaultMsg === 'string') {
  //             newErr.message = defaultMsg
  //           } else if (typeof defaultMsg === 'function') {
  //             newErr.message = defaultMsg(err)
  //           }
  //         }

  //         errs = [ ...errs, newErr ]
  //       }
  //     }
  //   }

  //   if (this.maxErrors >= 0) {
  //     errs = errs.slice(0, this.maxErrors)
  //   }

  //   const count = this.showControlErrors ? this.numPaddingErrors - errs.length : this.numPaddingErrors
  //   if (count > 0) {
  //     this._paddingErrors = []
  //     for (let i = 0; i < count; i++) {
  //       this._paddingErrors.push({ validatorName: '__padding__', error: {}, message: '', external: false })
  //     }
  //   } else {
  //     this._paddingErrors = []
  //   }

  //   return errs
  // }

  // @Input() messages: any = {}
  @Input() showValidatorName = false

  @Input() numPaddingErrors = 1

  // private errorTpl: TemplateRef<any>

  // private _listItemTpls: QueryList<FormFieldErrorListItemTplDirective>
  // private listItemTplsObj = {}

  @ContentChildren(FormFieldErrorListItemTplDirective)
  set _listItemTpls(val: QueryList<FormFieldErrorListItemTplDirective>) {
    this._initErrorTemplates(val)
  }

  @Input()
  set listItemTpls(val: QueryList<FormFieldErrorListItemTplDirective>) {
    this._initErrorTemplates(val)

    // for (const v of val.toArray()) {
    //   if (v.validatorName !== undefined) {
    //     this.listItemTplsObj[v.validatorName] = v
    //   }
    // }

    // const tmp = val.find(v => v.validatorName === undefined)
    // if (tmp) {
    //   this.errorTpl = tmp.template
    // }

    // this._listItemTpls = val
  }

  // get listItemTpls(): QueryList<FormFieldErrorListItemTplDirective> {
  //   return this._listItemTpls
  // }

  @Input() maxErrors = -1

  @Input()
  get control(): AbstractControlDirective | AbstractControl | undefined | null { return this._control }
  set control(value: AbstractControlDirective | AbstractControl | undefined | null) {
    this._control = value
    if (value) {
      this._initControlListeners(value)
    }
  }
  private _control: AbstractControlDirective | AbstractControl | undefined | null

  private _valueChangeSub = Subscription.EMPTY
  private _errorTplsChangeSub = Subscription.EMPTY

  private _controlErrors = new BehaviorSubject<IErrorRecord[]>([])
  private _errorTpls = new BehaviorSubject<IErrorRecord[]>([])
  private _errorInput = new BehaviorSubject<IErrorRecord[]>([])

  private _showControlErrorsSubject = new BehaviorSubject<boolean>(false)

  public displayRecords$: Observable<IErrorRecord[]>
  public showControlErrors$: Observable<boolean>

  private _showErrors = true

  @Input()
  set showErrors(val: boolean) {
    this._showErrors = val
  }

  get showErrors(): boolean {
    let show = this._showErrors

    if (show && this.control) {
      if (this.numPaddingErrors > 0) {
        show = true
      } else {
        show = !!(this.control.invalid && (this.control.dirty || this.control.touched))
      }
    }

    return show
  }

  get showControlErrors(): boolean {
    let show = false
    if (this.control && this.showErrors) {
      show = !!(this.control.invalid && (this.control.dirty || this.control.touched))
    }

    return show
  }

  public errorRecords$: Observable<IErrorRecord[]>

  constructor() {
    this.showControlErrors$ = this._showControlErrorsSubject.asObservable()
      .pipe(distinctUntilChanged())
      .pipe(shareReplay(1))

    this.errorRecords$ = combineLatest([this._controlErrors, this._errorTpls, this._errorInput])
      .pipe(map(([ctrlErrs, errTpls, errorInput]) => this._composeErrorInputs(ctrlErrs, errTpls, errorInput)))
      .pipe(shareReplay(1))

    this.displayRecords$ = this.errorRecords$
      .pipe(map(records => {
        let resultRecords: IErrorRecord[] = []

        if (!this.showErrors) {
          // TODO: Implement
        } else {
          let errs = [ ...records ]

          if (this.maxErrors >= 0) {
            errs = errs.slice(0, this.maxErrors)
          }

          const count = this.showControlErrors ? this.numPaddingErrors - errs.length : this.numPaddingErrors
          const paddingErrors: IErrorRecord[] = []
          if (count > 0) {
            for (let i = 0; i < count; i++) {
              paddingErrors.push({ validatorName: '__padding__', error: {}, message: '', external: false })
            }
          }

          if (this.showControlErrors) {
            resultRecords = [ ...errs, ...paddingErrors ]
          } else {
            resultRecords = [ ...paddingErrors ]
          }
        }

        return resultRecords
      }))
      .pipe(shareReplay(1))
  }

  ngOnDestroy() {
    this._valueChangeSub.unsubscribe()
    this._errorTplsChangeSub.unsubscribe()
  }

  ngDoCheck() {
    this._showControlErrorsSubject.next(this.showControlErrors)
  }

  private _initControlListeners(control: AbstractControlDirective | AbstractControl): void {
    // Unsubscribe from old control changes
    if (this._valueChangeSub && !this._valueChangeSub.closed) {
      this._valueChangeSub.unsubscribe()
    }

    if (control.valueChanges !== null) {
      this._valueChangeSub = combineLatest([this.showControlErrors$, control.valueChanges.pipe(startWith(undefined))])
        .pipe(startWith(undefined))
        .subscribe(_ => this._updateControlErrors(control.errors))
    } else {
      this._setControlErrors([])
    }
  }

  private _updateControlErrors(errors: ValidationErrors | null): void {
    const errs: IErrorRecord[] = []
    for (const validatorName in errors) {
      if (Object.prototype.hasOwnProperty.call(errors, validatorName)) {
        const error = errors[validatorName]
        const message = this._parseMessage(this._defaultMessages[validatorName], error)
        const external = false
        errs.push({ validatorName, error, message, external })
      }
    }
    this._setControlErrors(errs)
  }

  private _setControlErrors(errors: IErrorRecord[]) {
    this._controlErrors.next(errors)
  }

  private _parseMessage(message: any, error: any) {
    if (!message) { return }

    if (typeof message === 'string') {
      return message
    } else if (typeof message === 'function') {
      return message(error)
    }
  }

  private _initErrorTemplates(tplsQueryList: QueryList<FormFieldErrorListItemTplDirective>) {
    if (this._errorTplsChangeSub && !this._errorTplsChangeSub.closed) {
      this._errorTplsChangeSub.unsubscribe()
    }

    if (tplsQueryList) {
      this._errorTplsChangeSub = tplsQueryList.changes
        .pipe(startWith(undefined))
        .subscribe(_ => this._updateErrorTemplates(tplsQueryList.toArray()))
    } else {
      this._setErrorTemplates([])
    }
  }

  private _updateErrorTemplates(tplsList: FormFieldErrorListItemTplDirective[]): void {
    const errs: IErrorRecord[] = []
    for (const tpl of tplsList) {
      if (tpl.validatorName !== undefined && tpl.validatorName !== null) {
        errs.push({
          validatorName: tpl.validatorName,
          error: null,
          template: tpl.template,
          external: !!tpl.external
        })
      } else {
        // this.errorTpl = tpl.template
      }
    }
    this._setErrorTemplates(errs)
  }

  private _setErrorTemplates(errorTpls: IErrorRecord[]): void {
    this._errorTpls.next(errorTpls)
  }

  private _initErrorInput(errors: IErrorRecord[]): void {
    this._updateErrorInputs(errors)
  }

  private _updateErrorInputs(errors: IErrorRecord[]): void {
    this._setErrorInput(errors)
  }

  private _setErrorInput(errors: IErrorRecord[]): void {
    this._errorInput.next(errors)
  }

  private _composeErrorInputs(
    controlErrors: IErrorRecord[],
    errorTemplates: IErrorRecord[],
    errorInput: IErrorRecord[]
  ): IErrorRecord[] {
    const errs: IErrorRecord[] = []

    const errsMap: { [name: string]: IErrorRecord } = {}

    for (const err of controlErrors) {
      if (err.message || err.template) {
        errsMap[err.validatorName] = err
      }
    }

    for (const err of errorInput) {
      if (err.message || err.template) {
        errsMap[err.validatorName] = err
      }
    }

    for (const err of errorTemplates) {
      if (err.message || err.template) {
        errsMap[err.validatorName] = err
      }
    }

    for (const validatorName in errsMap) {
      if (Object.prototype.hasOwnProperty.call(errsMap, validatorName)) {
        errs.push(errsMap[validatorName])
      }
    }

    const control = this.control
    if (!control) {
      return []
    }

    return errs
      .filter(err => this._isErrorValidator(control.errors, err.validatorName))
      .filter(err => !err.external)
      .map(err => ({
        ...err,
        error: control.errors ? control.errors[err.validatorName] : null,
        _errors: control.errors
      } as IErrorRecord))
  }

  private _isErrorValidator(errors: ValidationErrors | null, validatorName: string): boolean {
    if (!errors) {
      return false
    }
    const arr = validatorName.split(' ').filter(v => v.trim().length > 0)
    for (const item of arr) {
      if (Object.prototype.hasOwnProperty.call(errors, item)) {
        return true
      }
    }
    return false
  }

}
