import {
  Component,
  ContentChild,
  ContentChildren,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  QueryList
} from '@angular/core'
import { Observable, ReplaySubject, Subscription } from 'rxjs'
import { map, startWith, tap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { IErrorRecord } from '../form-field-error/form-field-error-list/form-field-error-list.component'

import { FormFieldErrorDirective } from './form-field-error.directive'
import { FormFieldLabelTplDirective } from './form-field-label-tpl.directive'
import { InputDirective } from './input.directive'

let nextLabelUniqueId = 0

@Component({
  selector: 'seam-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements OnInit, OnDestroy {

  protected _labelUid = `lib-label-${nextLabelUniqueId++}`

  public _errorPadding = '0px'

  @HostBinding('style.display') get _displayStyle() { return this.inline ? 'inline-block' : 'block' }

  @Input() inline = false

  @Input() label: string
  @Input() labelPosition: 'top' | 'inline' = 'top'
  @Input() labelClass: string

  @Input() formGroupClass: string

  @Input() maxErrors = -1
  @Input() numPaddingErrors = 1

  @Input()
  get labelId(): string { return this._labelId }
  set labelId(value: string) { this._labelId = value || this._labelUid }
  protected _labelId: string

  @ContentChild(FormFieldLabelTplDirective, { static: true }) labelTpl: FormFieldLabelTplDirective

  @ContentChild(InputDirective, { static: true }) contentInput: InputDirective

  @ContentChildren(FormFieldErrorDirective)
  get fieldErrors() { return this._fieldErrors }
  set fieldErrors(value: QueryList<FormFieldErrorDirective[]>) {
    this._fieldErrors = value

    if (this._sub) { this._sub.unsubscribe() }
    if (this.fieldErrors) {
      this._sub = this.fieldErrors.changes
        .pipe(untilDestroyed(this))
        .pipe(startWith(this.fieldErrors))
        .pipe(map(v => v.toArray() as FormFieldErrorDirective[]))
        .pipe(tap(v => {
          const records: IErrorRecord[] = []
          for (const item of v) {
            records.push({
              validatorName: item.validatorName,
              error: null,
              template: item.template,
              external: item.external
            })
          }
          this._fieldErrorsSubject2.next(records)
        }))
        .subscribe(v => this._fieldErrorsSubject.next(v))
    }
  }
  private _fieldErrors: QueryList<FormFieldErrorDirective[]>
  private _sub: Subscription

  private readonly _fieldErrorsSubject = new ReplaySubject<FormFieldErrorDirective[]>(1)
  public readonly fieldErrors$: Observable<FormFieldErrorDirective[]> = this._fieldErrorsSubject.asObservable()

  private readonly _fieldErrorsSubject2 = new ReplaySubject<IErrorRecord[]>(1)
  public readonly fieldErrors2$: Observable<IErrorRecord[]> = this._fieldErrorsSubject2.asObservable()

  get isPasswordInput() {
    return this.contentInput && this.contentInput.type && this.contentInput.type === 'password'
  }
  get passwordInputElement() {
    return this.contentInput && this.contentInput._elementRef && this.contentInput._elementRef.nativeElement
  }

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }

  public isValidatorMatch(validatorName: string, tplValidatorName: string, errors: any): boolean {
    const tplValidatorNames = tplValidatorName.split(' ')

    for (let i = 0; i < tplValidatorNames.length; i++) {
      const name = tplValidatorNames[i]
      if (name === validatorName && i === 0) {
        return true
      }
    }

    return false
  }

  public _labelElemResized(labelElem: HTMLLabelElement) {
    if (labelElem) {
      this._errorPadding = `${labelElem.getBoundingClientRect().width}px`
    } else {
      this._errorPadding = '0px'
    }
  }

}
