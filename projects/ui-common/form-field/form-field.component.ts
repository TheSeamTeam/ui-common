import { BooleanInput } from '@angular/cdk/coercion'
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
import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subscription } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'
import { IErrorRecord } from '@theseam/ui-common/form-field-error'

import { FormFieldErrorDirective } from './form-field-error.directive'
import { FormFieldHelpTextDirective } from './form-field-help-text.directive'
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
  static ngAcceptInputType_inline: BooleanInput

  private readonly _helpTextStrSubject = new BehaviorSubject<string | undefined>(undefined)
  private readonly _helpTextTplSubject = new BehaviorSubject<FormFieldHelpTextDirective | undefined>(undefined)
  private readonly _contentInputSubject = new BehaviorSubject<InputDirective | undefined>(undefined)

  /** @ignore */
  protected _labelUid = `seam-label-${nextLabelUniqueId++}`

  /** @ignore */
  protected _helpTextUid = `seam-help-text-${nextLabelUniqueId++}`

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
  @Input() @InputBoolean() inline: boolean = false

  /** Add a text label for the form control. */
  @Input() label: string | undefined | null

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
  @Input() labelClass: string | undefined | null

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
  get labelId(): string | undefined | null { return this._labelId }
  set labelId(value: string | undefined | null) { this._labelId = value || this._labelUid }
  /** @ignore */
  protected _labelId: string | undefined | null

  /**
   * Help text added below the control.
   */
  @Input()
  get helpText(): string | undefined | null { return this._helpTextStrSubject.value }
  set helpText(value: string | undefined | null) {
    this._helpTextStrSubject.next(value || undefined)
  }

  /**
   * `id` attribute to add to the label element. This should not be needed in
   * most situations, because a unique id will be generated if not provided.
   */
  @Input()
  get helpTextId(): string | undefined | null { return this._helpTextId }
  set helpTextId(value: string | undefined | null) { this._helpTextId = value || this._helpTextUid }
  /** @ignore */
  protected _helpTextId: string | undefined | null

  /** @ignore */
  @ContentChild(FormFieldHelpTextDirective, { static: true })
  get helpTextTpl(): FormFieldLabelTplDirective | undefined { return this._helpTextTplSubject.value }
  set helpTextTpl(value: FormFieldLabelTplDirective | undefined) {
    this._helpTextTplSubject.next(value || undefined)
  }

  /** @ignore */
  @ContentChild(FormFieldLabelTplDirective, { static: true }) labelTpl?: FormFieldLabelTplDirective

  /** @ignore */
  @ContentChild(InputDirective, { static: true })
  get contentInput(): InputDirective | undefined { return this._contentInputSubject.value }
  set contentInput(value: InputDirective | undefined) { this._contentInputSubject.next(value || undefined) }


  /** @ignore */
  @ContentChildren(FormFieldErrorDirective)
  get fieldErrors() { return this._fieldErrors }
  set fieldErrors(value: QueryList<FormFieldErrorDirective[]> | undefined | null) {
    this._fieldErrors = value

    if (this._sub) { this._sub.unsubscribe() }
    if (this.fieldErrors) {
      this._sub = this.fieldErrors.changes
        .pipe(startWith(this.fieldErrors))
        .pipe(map(v => v.toArray() as FormFieldErrorDirective[]))
        .pipe(tap(v => {
          const records: IErrorRecord[] = []
          for (const item of v) {
            if (item.validatorName) {
              records.push({
                validatorName: item.validatorName,
                error: null,
                template: item.template,
                external: item.external
              })
            }
          }
          this._fieldErrorsSubject2.next(records)
        }))
        .subscribe(v => this._fieldErrorsSubject.next(v))
    }
  }
  /** @ignore */
  private _fieldErrors: QueryList<FormFieldErrorDirective[]> | undefined | null
  /** @ignore */
  private _sub?: Subscription

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

  get hasHelpText() { return !!this._helpTextStrSubject.value || !!this._helpTextTplSubject.value }
  // get hasHelpText() { return !!this.helpText || !!this._helpTextTpl }

  private _helpTextSub = Subscription.EMPTY

  /** @ignore */
  constructor(
    private readonly _elementRef: ElementRef
  ) { }

  /** @ignore */
  ngOnInit() {
    this._helpTextSub = this._contentInputSubject.pipe(
      filter(contentInput => !!contentInput),
      switchMap(contentInput => combineLatest([
        this._helpTextStrSubject,
        this._helpTextTplSubject
      ]).pipe(
        map(() => this.hasHelpText),
        distinctUntilChanged(),
        tap(() => {
          if (!!contentInput) {
            contentInput.ariaDescribedBy = this._helpTextId || undefined
          }
        })
      ))
    ).subscribe()
  }

  /** @ignore */
  ngOnDestroy() {
    this._sub?.unsubscribe()
    this._helpTextSub?.unsubscribe()
  }

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
