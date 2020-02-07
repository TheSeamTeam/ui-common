import { FocusMonitor } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ENTER, ESCAPE } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import {
  AfterViewInit,
  Component,
  ContentChild,
  DoCheck,
  ElementRef,
  EventEmitter,
  Host,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  Self,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import { AbstractControl, ControlContainer, FormControl, FormGroup } from '@angular/forms'

import { faCheck, faPen, faTimes } from '@fortawesome/free-solid-svg-icons'

import { TheSeamFormFieldComponent } from '../form-field/form-field.component'
import { ICanToggleEdit } from './models/can-toggle-edit'
import { IToggleEditRef } from './models/toggle-edit-ref'
import { ToggleEditDisplayTplDirective } from './toggle-edit-display-tpl.directive'
import { ToggleEditKeyboardListenerService } from './toggle-edit-keyboard-listener.service'


@Component({
  selector: 'seam-toggle-edit',
  templateUrl: './toggle-edit.component.html',
  styleUrls: ['./toggle-edit.component.scss']
})
export class ToggleEditComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck, ICanToggleEdit, IToggleEditRef {

  faPen = faPen
  faTimes = faTimes
  faCheck = faCheck

  private _previousDisabled = false

  /** Use `hasFocus()` to check for focus. This is only for monitoring focus lost. */
  private _focused = false
  private _focusObserver: MutationObserver
  private _actionsFocused = false
  private _submitting = false

  /**
   * Input value before editing.
   *
   * If the edit change is canceled the input value will be reset back to this
   * value.
   */
  private _beforeEditValue = null

  @HostBinding('class.toggle-edit-active') get _toggleEditActiveClass() { return this.editing }

  @Input() cancelOnBlur = true
  @Input() waitOnSubmit = false

  @Input() placeholder = ''

  @Input()
  get editing(): boolean { return this._editing }
  set editing(value: boolean) {
    if (this.disabled && value) { return }

    if (!this._editing) {
      this.updateBeforeEditValue()
    }
    this._editing = coerceBooleanProperty(value)
    this.editingChange.emit(value)
  }
  private _editing = false

  @Output() changeAccepted = new EventEmitter<IToggleEditRef>()
  @Output() changeDeclined = new EventEmitter<IToggleEditRef>()
  @Output() editingChange = new EventEmitter<boolean>()

  @ViewChild('templatePortalContent', { static: true }) templatePortalContent: TemplateRef<any>
  public templatePortal: TemplatePortal<any>
  public modalRef: OverlayRef

  @ContentChild(ToggleEditDisplayTplDirective, { static: true }) displayTpl: ToggleEditDisplayTplDirective

  constructor(
    private _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    @Optional() @Self() private controlContainer: ControlContainer,
    @Optional() @Host() private formFieldComponent: TheSeamFormFieldComponent,
    private _kbListener: ToggleEditKeyboardListenerService,
    private _focusMonitor: FocusMonitor,
    private _ngZone: NgZone,
    private _renderer: Renderer2,
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay
  ) {
    this._ngZone.runOutsideAngular(() => {
      this._focusObserver = new MutationObserver(() => {
        this._ngZone.run(() => {
          if (this.hasFocus()) {
            if (this.disabled) { return }
            this._onFocus()
          } else {
            this._onBlur()
          }
        })
      })
    })
  }

  ngOnInit() {
    this._initMonitors()
    if (this.formFieldComponent) {
      // TODO: Consider making this smarter, such as avoiding overwritting when input set.
      this.formFieldComponent.numPaddingErrors = 0
    }
  }

  ngOnDestroy() {
    this._destroyMonitors()
  }

  ngAfterViewInit() {
    if (this.formFieldComponent && this.formFieldComponent.contentInput) {
      this.formFieldComponent.contentInput.stateChanges.subscribe(_ => {
        this._checkDisabledChange()
      })
    }
    setTimeout(() => {
      this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef)
    })
    this._checkDisabledChange()
  }

  ngDoCheck() {
    this._checkDisabledChange()
  }

  private _initMonitors() {
    this._kbListener.add(this)

    this._focusMonitor.monitor(this._elementRef.nativeElement, true)
    this._focusObserver.observe(this._elementRef.nativeElement, {
      attributes: true,
      attributeFilter: ['class'],
      childList: false,
      characterData: false
    })
  }

  private _destroyMonitors() {
    this._kbListener.remove(this)

    this._focusObserver.disconnect()
    this._focused = false
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement)
    this._renderer.removeAttribute(this._elementRef.nativeElement, 'tabindex')
  }

  // Make this disabled checking implementation better. It gets called to much
  // trying to be accurate.
  private _checkDisabledChange() {
    const isDisabled = this.disabled
    if (isDisabled !== this._previousDisabled) {

    }
  }

  public get disabled() {
    const control = this.getControl()
    if (control) {
      return control.disabled
    }
    return false
  }

  public canSubmit(): boolean {
    const control = this.getControl()
    if (control) {
      return control.valid
    }
    return true
  }

  public isSubmitting(): boolean {
    return this._submitting
  }

  public submitComplete(error?: any): void {
    const control = this.getControl()
    if (control) {
      control.enable()
    }
    this._submitting = false

    if (!error) {
      this.stopEditing()
    }
  }

  public updateBeforeEditValue(): void {
    const control = this.getControl()
    if (control) {
      this._beforeEditValue = control.value
    }
  }

  public getValue(): string | null {
    const control = this.getControl()
    if (control) {
      return control.value
    }

    return null
  }

  public resetValue(): void {
    const control = this.getControl()
    if (control) {
      // Reset without emitting then update which will emit, because reset will
      // emit changes before setting pristine
      control.reset(this._beforeEditValue, { emitEvent: false })
      control.updateValueAndValidity()
    }
  }

  public isFormGroup(): boolean {
    return !!this.controlContainer
  }

  public getFormGroup(): FormGroup | null {
    if (!this.isFormGroup()) { return null }
    return <FormGroup>this.controlContainer.control
  }

  public isInFormField(): boolean {
    return !!this.formFieldComponent
  }

  public getFormControl(): FormControl |  null {
    if (!this.isInFormField()) { return null }
    if (!this.formFieldComponent.contentInput) { return null }
    return <FormControl>this.formFieldComponent.contentInput.ngControl.control
  }

  public hasControl(): boolean {
    return !!this.getControl()
  }

  public getControl(): AbstractControl | null {
    if (this.isFormGroup()) {
      return this.getFormGroup()
    } else if (this.isInFormField()) {
      return this.getFormControl()
    }
    return null
  }

  public submitEdit(): void {
    if (!this.canSubmit()) {
      return
    }

    if (this.waitOnSubmit) {
      const control = this.getControl()
      if (control) {
        control.disable()
      }
      this._submitting = true
    }

    this.stopEditing()

    this.changeAccepted.emit(<IToggleEditRef>this)
  }

  public cancelEdit(): void {
    // Reset without emitting then update which will emit, because reset will
    // emit changes before setting pristine
    this.resetValue()
    this.stopEditing()

    this.changeDeclined.emit(<IToggleEditRef>this)
  }

  private _onFocus(): void {
    // Return if already focused
    if (this._focused) { return }

    this._focused = true
    this._actionsFocused = false
  }

  private _onBlur(): void {
    // Return if focus hasn't been detected
    if (!this._focused) { return }

    if (this.editing && this.cancelOnBlur) {
      setTimeout(() => {
        if (!this._actionsFocused) {
          this.cancelEdit()
        }
      })
    }

    this._focused = false
  }

  public hasFocus(): boolean {
    return this._elementRef.nativeElement.classList.contains('cdk-focused')
  }

  public focusContent(): void {
    // Set the tab index to `-1` to allow the root element of the component to
    // receive `focus` event from javascript, but not get focused by keyboard
    // navigation. This is for the focus monitor. If a button is clicked the
    // focus monitor emits a blur before the focus of the input. This will avoid
    // the blur by letting the component itself receive focus events.
    this._renderer.setAttribute(this._elementRef.nativeElement, 'tabindex', '-1')
    this._elementRef.nativeElement.focus()
  }

  public toggleEditing(isEditing?: boolean): void {
    if (this.editing === isEditing) { return }
    const _editing = isEditing === undefined ? !this.editing : !!isEditing
    if (_editing) {
      this.startEditing()
    } else {
      this.stopEditing()
    }
  }

  public isEditing(): boolean {
    return this.editing
  }

  public startEditing(): void {
    if (this.disabled) { return }
    if (this.isEditing()) {
      return
    }

    this.updateBeforeEditValue()

    this.focusContent()

    this.editing = true

    this.modalRef = this._overlay.create({
      hasBackdrop: false,
      positionStrategy: this.getOverlayPosition(this._elementRef.nativeElement),
    })

    this.modalRef.attach(this.templatePortal)
  }

  public stopEditing(): void {
    if (!this.isEditing()) {
      return
    }

    if (this.isSubmitting()) {
      return
    }

    if (this.modalRef.hasAttached()) {
      this.modalRef.detach()
    }

    // NOTE: This is a hack to avoid a focus lost issue introduced by a focus
    // acuired issue's hack.
    this._elementRef.nativeElement.focus()
    this._elementRef.nativeElement.blur()
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement)
    this._renderer.removeAttribute(this._elementRef.nativeElement, 'tabindex')
    this._focusMonitor.monitor(this._elementRef.nativeElement, true)

    this.editing = false
  }

  public keydownEvent(event: KeyboardEvent): void {
    // tslint:disable-next-line:deprecation
    switch (event.keyCode) {
      case ESCAPE: {
        this.cancelEdit()
        break
      }
      case ENTER: {
        this.submitEdit()
        break
      }
    }
  }

  private getOverlayPosition(origin: HTMLElement): PositionStrategy {
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions())
      .withFlexibleDimensions(false)
      .withPush(false)

    return positionStrategy
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      },
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom'
      },
    ]
  }

  public resized(): void {
    if (this.modalRef && this.modalRef.hasAttached()) {
      this.modalRef.updatePosition()
    }
  }

  public actionsFocusChange(event: any): void {
    this._actionsFocused = !!event
  }

}
