import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  InjectFlags,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'
import { ControlValueAccessor, UntypedFormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { defer, fromEvent, merge, Observable, of, Subject } from 'rxjs'
import { auditTime, map, switchMap, takeUntil } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'
import { InputDirective } from '@theseam/ui-common/form-field'

import { TheSeamTelInputDirective } from '../tel-input.directive'

// TODO: Fix focus
// TODO: Fix disabled

@Component({
  selector: 'seam-tel-input',
  templateUrl: './tel-input.component.html',
  styleUrls: ['./tel-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TheSeamTelInputComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamTelInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  static ngAcceptInputType_required: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput

  /** @ignore */
  private readonly _ngUnsubscribe = new Subject<void>()

  /** @ignore */
  readonly _control = new UntypedFormControl()

  private _focusOrigin: FocusOrigin = null

  _hasInvalidCss$: Observable<boolean>

  @Input() @InputBoolean() required = false

  @Input()
  get disabled(): boolean { return this._disabled }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value)

    if (this._control.disabled !== newValue) {
      if (newValue) {
        this._control.disable()
      } else {
        this._control.enable()
      }
    }

    if (newValue !== this.disabled) {
      this._disabled = newValue
      this._changeDetectorRef.markForCheck()
    }
  }
  /** @ignore */
  private _disabled = false

  /**
   * Set the tab index to `-1` to allow the root element of the
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
  @Input()
  set tabIndex(value: number) { this._tabIndex = coerceNumberProperty(value) }
  get tabIndex(): number { return this._tabIndex }
  private _tabIndex = -1

  @HostBinding('attr.disabled')
  get _attrDisabled() { return this.disabled || null }

  @HostBinding('attr.tabindex')
  get _attrTabIndex() { return this.disabled ? -1 : (this.tabIndex || 0) }

  /** Name value will be applied to the input element if present */
  @Input() name: string | undefined | null = null

  /** The value attribute of the native input element */
  @Input() value: string | undefined | null

  /** Event emitted when the "tel" input value changes. */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly change = new EventEmitter<string>()

  /**
   * The telInput directive
   * @ignore
   */
  @ViewChild(TheSeamTelInputDirective, { static: true }) _telInputDirective?: TheSeamTelInputDirective

  /**
   * The telInput directive
   * @ignore
   */
  @ViewChild(InputDirective, { static: true }) _inputDirective?: InputDirective

  /**
   * The native `<input type="tel">` element
   * @ignore
   */
  @ViewChild('input', { static: true }) _inputElementRef?: ElementRef<HTMLInputElement>

  @HostListener('focus', [ '$event' ])
  _onFocus() {
    this._telInputDirective?.focus()
  }

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @ignore
   */
  _onTouched: () => any = () => {}

  /** @ignore */
  private _controlValueAccessorChangeFn: (value: any) => void = () => {}

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _injector: Injector,
    private readonly _elementRef: ElementRef,
    private readonly _focusMonitor: FocusMonitor
  ) {
    const telInputBlurEvent$ = this._telInputDirective
      ? fromEvent(this._telInputDirective.getHostElement(), 'blur')
      : of<Event>()

    this._hasInvalidCss$ = defer(() => of((this._injector.get(NgControl, null, InjectFlags.Self)?.control) || undefined)).pipe(
      switchMap(control => {
        if (control) {
          return merge(
            control.valueChanges,
            control.statusChanges,
            telInputBlurEvent$
          ).pipe(
            auditTime(0),
            map(() => {
              const inputControl = this._inputDirective?.ngControl
              return control.invalid && (inputControl?.dirty as boolean || inputControl?.touched as boolean)
            })
          )
        }
        return of(false)
      })
    )
  }

  /** @ignore */
  ngOnInit(): void {
    this._focusMonitor.monitor(this._elementRef, true).pipe(
      takeUntil(this._ngUnsubscribe)
    ).subscribe(origin => this._focusOrigin = origin)

    this._control.valueChanges.pipe(
      takeUntil(this._ngUnsubscribe)
    ).subscribe(v => {
      const value = this._telInputDirective?.getFullNumber()
      this.value = value
      if (this._controlValueAccessorChangeFn) {
        this._controlValueAccessorChangeFn(value)
      }
    })
  }

  /** @ignore */
  ngOnDestroy(): void {
    this._focusMonitor.stopMonitoring(this._elementRef)

    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  writeValue(value: any) {
    this.value = value
    if (this._telInputDirective) {
      this._telInputDirective.value = value
      this._telInputDirective.updateValue()
    }
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

  /** Focuses the input. */
  public focus(): void {
    this._telInputDirective?.focus()
  }

  /** Unfocuses the input. */
  public blur(): void {
    this._telInputDirective?.blur()
  }

  public hasFocus(): boolean {
    return this._focusOrigin !== null && this._focusOrigin !== undefined
  }

}
