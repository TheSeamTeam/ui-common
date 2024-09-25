import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import { Directive, DoCheck, ElementRef, HostBinding, Input, OnChanges, Optional, Self, SimpleChanges } from '@angular/core'
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms'
import { Subject } from 'rxjs'

import { NgSelectComponent } from '@ng-select/ng-select'

import { InputBoolean } from '@theseam/ui-common/core'
import { toggleAttribute } from '@theseam/ui-common/utils'

// NOTE: Partially based on mat-input: https://github.com/angular/material2/blob/master/src/lib/input/input.ts

let nextUniqueId = 0

@Directive({
  // TODO: Consider removing restriction and instead adding a dev warning. A few
  // inputs in the app need to be changed for this first.
  selector: 'input[seamInput], textarea[seamInput], ng-select[seamInput], seam-checkbox[seamInput] [ngbRadioGroup], seam-tel-input[seamInput], quill-editor[seamInput], seam-google-maps[seamInput], seam-rich-text[seamInput]',
  exportAs: 'seamInput',
})
export class InputDirective implements DoCheck, OnChanges {
  static ngAcceptInputType_required: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_readonly: BooleanInput

  protected _uid = `lib-input-${nextUniqueId++}`

  // TODO: Remove this being added to all seamInput elements or break this
  // directive up. Some elements in our app already have worked around this
  // class being there, so some refactoring will be required before removal.
  @HostBinding('class.form-control') _isFormControl = true
  @HostBinding('class.form-control-sm') get _isFormControlSmall() {
    return this._isFormControl && this.seamInputSize === 'sm'
  }
  @HostBinding('class.is-invalid') get _isInvalid() {
    return this.ngControl && this.ngControl.invalid && (this.ngControl.dirty || this.ngControl.touched)
  }

  @HostBinding('attr.id') get _attrId() { return this._isNgSelect() ? undefined : this.id }
  @HostBinding('attr.placeholder') get _attrPlaceholder() { return this.placeholder }
  @HostBinding('attr.aria-describedby') ariaDescribedBy: string | undefined

  @Input() seamInputSize: 'sm' | 'normal' = 'normal'

  @Input()
  get id(): string | undefined | null { return this._id }
  set id(value: string | undefined | null) { this._id = value || this._uid }
  protected _id: string | undefined | null

  /** Input type of the element. */
  @Input()
  get type(): string | undefined | null { return this._type }
  set type(value: string | undefined | null) {
    this._type = value || 'text'
    // this._validateType()

    // When using Angular inputs, developers are no longer able to set the properties on the native
    // input element. To ensure that bindings for `type` work, we need to sync the setter
    // with the native property. Textarea elements don't support the type property or attribute.
    if ((!this._isTextarea() && !this._isNgSelect()) /* && getSupportedInputTypes().has(this._type) */) {
      (this._elementRef.nativeElement as HTMLInputElement).type = this._type
    }
  }
  protected _type: string | undefined | null = 'text'

  @Input() placeholder: string | undefined | null

  @Input() @InputBoolean() required = false

  @Input()
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled
    }
    return this._disabled
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value)

    // Browsers may not fire the blur event if the input is disabled too quickly.
    // Reset from here to ensure that the element doesn't become stuck.
    if (this.focused) {
      this.focused = false
      this.stateChanges.next()
    }
  }
  protected _disabled = false

  focused = false

  readonly stateChanges: Subject<void> = new Subject<void>()

  // @Input()
  // get value(): string { return this._inputValueAccessor.value; }
  // set value(value: string) {
  //   if (value !== this.value) {
  //     this._inputValueAccessor.value = value;
  //     this.stateChanges.next();
  //   }
  // }

  /** Whether the element is readonly. */
  @Input() @InputBoolean() readonly = false

  private readonly _requiredChange = new Subject<boolean>()
  private readonly _disabledChange = new Subject<boolean>()
  private readonly _readonlyChange = new Subject<boolean>()

  public readonly requiredChange = this._requiredChange.asObservable()
  public readonly disabledChange = this._disabledChange.asObservable()
  public readonly readonlyChange = this._readonlyChange.asObservable

  constructor(
    public _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() private _parentForm: NgForm,
    @Optional() private _parentFormGroup: FormGroupDirective,
    // 3rd party support
    @Optional() private _ngSelect: NgSelectComponent
  ) {
    // Force setter to be called in case id was not specified.
    // eslint-disable-next-line no-self-assign
    this.id = this.id

    if (!this._shouldHaveFormControlCssClass()) {
      this._isFormControl = false
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.required) {
      this._requiredChange.next(this.required)
    }
    if (changes.disabled) {
      this._disabledChange.next(this.disabled)
    }
    if (changes.readonly) {
      this._readonlyChange.next(this.readonly)
    }
  }

  ngDoCheck() {
    if (this._isNgSelect()) {
      this._ngSelect.labelForId = this.id
      this._ngSelect.setDisabledState(this.disabled)
    } else {
      toggleAttribute(this._elementRef.nativeElement, 'required', this.required)
      toggleAttribute(this._elementRef.nativeElement, 'disabled', this.disabled)
    }
  }

  /** Should only be textual inputs, but initially our app added to all form controls. */
  protected _shouldHaveFormControlCssClass() {
    return !this._isSeamCheckbox() &&
      !this._isRadioInput() &&
      !this._isNgbRadioGroup() &&
      !this._isTelInput() &&
      !this._isQuillEditor() &&
      !this._isRichTextEditor()
  }

  /** Determines if the component host is a textarea. */
  protected _isTextarea() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'textarea'
  }

  /** Determines if the component host is a ng-select. */
  protected _isNgSelect() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'ng-select'
  }

  /** Determines if the component host is a seam-checkbox. */
  protected _isSeamCheckbox() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'seam-checkbox'
  }

  /** Determines if the component host is a radio input. */
  protected _isRadioInput() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'input' &&
      this._elementRef.nativeElement.type.toLowerCase() === 'radio'
  }

  protected _isNgbRadioGroup() {
    return this._elementRef.nativeElement.getAttribute('ngbRadioGroup') !== null
  }

  protected _isTelInput() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'seam-tel-input'
  }

  protected _isQuillEditor() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'quill-editor'
  }

  protected _isRichTextEditor() {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'seam-rich-text'
  }

  /** Focuses the input. */
  focus(): void {
    this._elementRef.nativeElement.focus()
  }

  /** Unfocuses the input. */
  blur(): void {
    this._elementRef.nativeElement.blur()
  }

  setValue(value: any) {
    if (this.ngControl) {
      const control = this.ngControl.control
      if (control) {
        control.setValue(value)
      }
    }
  }

}
