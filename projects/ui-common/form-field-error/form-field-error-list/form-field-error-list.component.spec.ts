import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { UntypedFormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest'

import { FormFieldErrorComponent } from '../form-field-error/form-field-error.component'
import { FormFieldErrorListComponent, IErrorRecord } from './form-field-error-list.component'

function countRecordsByValidator(validatorName: string, records: IErrorRecord[]): number {
  return (records || []).filter(v => v.validatorName === validatorName).length
}

describe('FormFieldErrorListComponent', () => {
  let spectator: Spectator<FormFieldErrorListComponent>
  const createComponent = createComponentFactory({
    component: FormFieldErrorListComponent,
    declarations: [
      FormFieldErrorComponent
    ],
    imports: [
      ReactiveFormsModule
    ]
  })

  it('should create', () => {
    spectator = createComponent()
    expect(spectator.component).toBeTruthy()
  })

  it('should create with control', () => {
    const control = new UntypedFormControl()
    spectator = createComponent({ props: { control } })
    expect(spectator.component).toBeTruthy()
  })

  it('should show placeholder when control is not dirty', fakeAsync(() => {
    const control = new UntypedFormControl()
    spectator = createComponent({ props: { control } })
    let count = 0
    spectator.component.displayRecords$.subscribe(v => count = countRecordsByValidator('__padding__', v))
    tick()
    expect(count).toBe(1)
  }))

  it('should show placeholder when control is dirty without a validator', fakeAsync(() => {
    const control = new UntypedFormControl()
    spectator = createComponent({ props: { control } })
    let count = 0
    spectator.component.displayRecords$.subscribe(v => count = countRecordsByValidator('__padding__', v))
    control.markAsDirty()
    tick()
    expect(count).toBe(1)
  }))

  it('should show placeholder when control is dirty with a validator without a message', fakeAsync(() => {
    const control = new UntypedFormControl(undefined, [ Validators.required ])
    spectator = createComponent({ props: { control } })
    let count = 0
    spectator.component.displayRecords$.subscribe(v => count = countRecordsByValidator('__padding__', v))
    control.markAsDirty()
    tick()
    expect(control?.errors?.required).toBeDefined()
    expect(count).toBe(1)
  }))

  it('should not show placeholder when control is dirty with a validator with a message', fakeAsync(() => {
    const control = new UntypedFormControl(undefined, [ Validators.required ])
    const errors: IErrorRecord[] = [
      { validatorName: 'required', error: null, message: 'Required' }
    ]
    spectator = createComponent({ props: { control, errors } })
    let records: IErrorRecord[] = []
    spectator.component.displayRecords$.subscribe(v => records = v)
    control.markAsDirty()
    tick()

    // TODO: Fix bug making the error messages not update correctly initially
    spectator.component.errors = errors
    tick()

    expect(control?.errors?.required).toBeDefined()
    // console.log(control.errors)
    // console.log(records)
    expect(countRecordsByValidator('__padding__', records)).toBe(0)
    expect(countRecordsByValidator('required', records)).toBe(1)
  }))

  // it('should show placeholder when no errors', () => {

  // })

  // it('should show placeholder when error exists without message or template', () => {

  // })

  // it('should update number of errors if maxErrors changes', () => {

  // })
})
