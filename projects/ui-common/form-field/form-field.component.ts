import {
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  QueryList
} from '@angular/core'
import { Observable, ReplaySubject, Subscription } from 'rxjs'
import { map, startWith, tap } from 'rxjs/operators'

import { IErrorRecord } from '@theseam/ui-common/form-field-error'

import { FormFieldErrorDirective } from './form-field-error.directive'
import { FormFieldLabelTplDirective } from './form-field-label-tpl.directive'
import { InputDirective } from './input.directive'

let nextLabelUniqueId = 0

/**
 * Should wrap all form controls.
 */
@Component({
  selector: 'seam-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class TheSeamFormFieldComponent implements OnInit, OnDestroy {

  /** @ignore */
  protected _labelUid = `lib-label-${nextLabelUniqueId++}`

  /** @ignore */
  public _errorPadding = '0px'

  /** @ignore */
  @HostBinding('style.display') get _displayStyle() { return this.inline ? 'inline-block' : 'block' }

  /**
   * Used to declare an inline element.
   *
   * NOTE: Not well tested or supported, so it may have some issues currently
   * and could change.
   */
  @Input() inline = false

  /** Add a text label for the form control. */
  @Input() label: string

  /**
   * The label can be on top or inline.
   *
   * > Only supports `ltr` direction, so inline will only place the label on the
   * > left.
   */
  @Input() labelPosition: 'top' | 'inline' = 'top'

  /**
   * CSS class to add to the label element.
   *
   * Accepts a single space separated string of classes, like the html class
   * attribute.
   */
  @Input() labelClass: string

  /** Max errors to display. */
  @Input() maxErrors = -1

  /**
   * A padding error is an always allocated space equivalent to a single line
   * error string.
   */
  @Input() numPaddingErrors = 1

  /**
   * `id` attribute to add to the label element. This should not be needed in
   * most situations, because a unique id will be generated if not provided.
   */
  @Input()
  get labelId(): string { return this._labelId }
  set labelId(value: string) { this._labelId = value || this._labelUid }
  /** @ignore */
  protected _labelId: string

  /** @ignore */
  @ContentChild(FormFieldLabelTplDirective, { static: true }) labelTpl: FormFieldLabelTplDirective

  /** @ignore */
  @ContentChild(InputDirective, { static: true }) contentInput: InputDirective

  /** @ignore */
  @ContentChildren(FormFieldErrorDirective)
  get fieldErrors() { return this._fieldErrors }
  set fieldErrors(value: QueryList<FormFieldErrorDirective[]>) {
    this._fieldErrors = value

    if (this._sub) { this._sub.unsubscribe() }
    if (this.fieldErrors) {
      this._sub = this.fieldErrors.changes
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
  /** @ignore */
  private _fieldErrors: QueryList<FormFieldErrorDirective[]>
  /** @ignore */
  private _sub: Subscription

  /** @ignore */
  private readonly _fieldErrorsSubject = new ReplaySubject<FormFieldErrorDirective[]>(1)
  /** @ignore */
  public readonly fieldErrors$: Observable<FormFieldErrorDirective[]> = this._fieldErrorsSubject.asObservable()

  /** @ignore */
  private readonly _fieldErrorsSubject2 = new ReplaySubject<IErrorRecord[]>(1)
  /** @ignore */
  public readonly fieldErrors2$: Observable<IErrorRecord[]> = this._fieldErrorsSubject2.asObservable()

  get isPasswordInput() {
    return this.contentInput && this.contentInput.type && this.contentInput.type === 'password'
  }
  get passwordInputElement() {
    return this.contentInput && this.contentInput._elementRef && this.contentInput._elementRef.nativeElement
  }

  /** @ignore */
  constructor(
    private readonly _elementRef: ElementRef
  ) { }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() { this._sub.unsubscribe() }

  /** @ignore */
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

  /** @ignore */
  public _labelElemResized(labelElem: HTMLLabelElement) {
    if (labelElem) {
      this._errorPadding = `${labelElem.getBoundingClientRect().width}px`
    } else {
      this._errorPadding = '0px'
    }
  }

  public getElement(): HTMLElement {
    return this._elementRef.nativeElement
  }

}
