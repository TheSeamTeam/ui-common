import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  InjectFlags,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { defer, Observable, of, Subject } from 'rxjs'
import { map, switchMap, takeUntil } from 'rxjs/operators'

import { observeControlValid } from '../../utils/index'
import { TheSeamTelInputDirective } from '../tel-input.directive'

@Component({
  selector: 'seam-tel-input',
  templateUrl: './tel-input.component.html',
  styleUrls: ['./tel-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // tslint:disable-next-line: no-use-before-declare
    useExisting: forwardRef(() => TheSeamTelInputComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamTelInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** @ignore */
  private readonly _ngUnsubscribe = new Subject()

  /** @ignore */
  readonly _control = new FormControl()

  _hasInvalidCss$: Observable<boolean>

  @Input()
  get required(): boolean { return this._required }
  set required(value: boolean) { this._required = coerceBooleanProperty(value) }
  /** @ignore */
  private _required: boolean

  @Input()
  get disabled(): boolean { return this._disabled }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value)

    if (newValue !== this.disabled) {
      this._disabled = newValue
      this._changeDetectorRef.markForCheck()
    }
  }
  /** @ignore */
  private _disabled = false

  /** Name value will be applied to the input element if present */
  @Input() name: string | null = null

  /** The value attribute of the native input element */
  @Input() value: string

  /** Event emitted when the "tel" input value changes. */
  @Output() readonly change = new EventEmitter<string>()

  /**
   * The telInput directive
   * @ignore
   */
  @ViewChild(TheSeamTelInputDirective, { static: true }) _telInputDirective: TheSeamTelInputDirective

  /**
   * The native `<input type="tel">` element
   * @ignore
   */
  @ViewChild('input', { static: true }) _inputElementRef: ElementRef<HTMLInputElement>

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @ignore
   */
  _onTouched: () => any = () => {}

  /** @ignore */
  private _controlValueAccessorChangeFn: (value: any) => void = () => {}

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _injector: Injector
  ) {
    this._hasInvalidCss$ = defer(() => of((this._injector.get(NgControl, null, InjectFlags.Self)?.control) || undefined)).pipe(
      switchMap(control => {
        if (control) {
          return observeControlValid(control).pipe(
            map(() => control.invalid && (control.dirty || control.touched))
          )
        }
        return of(false)
      })
    )
  }

  /** @ignore */
  ngOnInit(): void {
    this._control.valueChanges.pipe(
      takeUntil(this._ngUnsubscribe)
    ).subscribe(v => {
      // console.log('%cv', 'color:violet', v, this._telInputDirective.value)
      const value = this._telInputDirective.getFullNumber()
      // console.log('~=~', value)
      this.value = value
      if (this._controlValueAccessorChangeFn) {
        this._controlValueAccessorChangeFn(value)
      }
    })
  }

  /** @ignore */
  ngOnDestroy(): void {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  writeValue(value: any) {
    // console.log('writeValue', value)
    // this._control.setValue(value)
    this.value = value
    // console.log('this._telInputDirective', this._telInputDirective)
    this._telInputDirective.value = value
    this._telInputDirective.updateValue()
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  registerOnTouched(fn: any) {
    this._onTouched = fn
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled
  }

}
