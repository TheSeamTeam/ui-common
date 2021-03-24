import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Directive, DoCheck, ElementRef, HostBinding, Input, Optional, Self } from '@angular/core'
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms'
import { Subject } from 'rxjs'

import { NgSelectComponent } from '@ng-select/ng-select'

import { toggleAttribute } from '@theseam/ui-common/utils'

// NOTE: Partially based on mat-input: https://github.com/angular/material2/blob/master/src/lib/input/input.ts

let nextUniqueId = 0

@Directive({
  // TODO: Consider removing restriction and instead adding a dev warning. A few
  // inputs in the app need to be changed for this first.
  selector: 'input[seamInput], textarea[seamInput], ng-select[seamInput], seam-checkbox[seamInput] [ngbRadioGroup], seam-tel-input[seamInput], quill-editor[seamInput]',
  exportAs: 'seamInput',
})
export class InputDirective implements DoCheck {

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

  @Input() seamInputSize: 'sm' | 'normal' = 'normal'

  @Input()
  get id(): string { return this._id }
  set id(value: string) { this._id = value || this._uid }
  protected _id: string

  /** Input type of the element. */
  @Input()
  get type(): string { return this._type }
  set type(value: string) {
    this._type = value || 'text'
    // this._validateType()

    // When using Angular inputs, developers are no longer able to set the properties on the native
    // input element. To ensure that bindings for `type` work, we need to sync the setter
    // with the native property. Textarea elements don't support the type property or attribute.
    if ((!this._isTextarea() && !this._isNgSelect()) /* && getSupportedInputTypes().has(this._type) */) {
      (this._elementRef.nativeElement as HTMLInputElement).type = this._type
    }
  }
  protected _type = 'text'

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input() placeholder: string

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get required(): boolean { return this._required }
  set required(value: boolean) { this._required = coerceBooleanProperty(value) }
  protected _required = false

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
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
  @Input()
  get readonly(): boolean { return this._readonly }
  set readonly(value: boolean) { this._readonly = coerceBooleanProperty(value) }
  private _readonly = false

  constructor(
    public _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() private _parentForm: NgForm,
    @Optional() private _parentFormGroup: FormGroupDirective,
    // 3rd party support
    @Optional() private _ngSelect: NgSelectComponent
  ) {
    // Force setter to be called in case id was not specified.
    this.id = this.id

    if (!this._shouldHaveFormControlCssClass()) {
      this._isFormControl = false
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
    return !this._isSeamCheckbox()
      && !this._isRadioInput()
      && !this._isNgbRadioGroup()
      && !this._isTelInput()
      && !this._isQuillEditor()
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

  /** Make sure the input is a supported type. */
  // protected _validateType() {
  //   if (MAT_INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
  //     throw getMatInputUnsupportedTypeError(this._type)
  //   }
  // }

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
