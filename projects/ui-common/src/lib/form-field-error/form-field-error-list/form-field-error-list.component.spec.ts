import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { createTestComponentFactory, Spectator } from '@netbasal/spectator'

import { FormFieldErrorComponent } from '../form-field-error/form-field-error.component'
import { FormFieldErrorListComponent, IErrorRecord } from './form-field-error-list.component'

// tslint:disable:no-non-null-assertion

function countRecordsByValidator(validatorName: string, records: IErrorRecord[]): number {
  return (records || []).filter(v => v.validatorName === validatorName).length
}

describe('FormFieldErrorListComponent', () => {
  let spectator: Spectator<FormFieldErrorListComponent>
  const createComponent = createTestComponentFactory({
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
    const control = new FormControl()
    spectator = createComponent({ control })
    expect(spectator.component).toBeTruthy()
  })

  it('should show placeholder when control is not dirty', fakeAsync(() => {
    const control = new FormControl()
    spectator = createComponent({ control })
    let count = 0
    spectator.component.displayRecords$.subscribe(v => count = countRecordsByValidator('__padding__', v))
    tick()
    expect(count).toBe(1)
  }))

  it('should show placeholder when control is dirty without a validator', fakeAsync(() => {
    const control = new FormControl()
    spectator = createComponent({ control })
    let count = 0
    spectator.component.displayRecords$.subscribe(v => count = countRecordsByValidator('__padding__', v))
    control.markAsDirty()
    tick()
    expect(count).toBe(1)
  }))

  it('should show placeholder when control is dirty with a validator without a message', fakeAsync(() => {
    const control = new FormControl(undefined, [ Validators.required ])
    spectator = createComponent({ control })
    let count = 0
    spectator.component.displayRecords$.subscribe(v => count = countRecordsByValidator('__padding__', v))
    control.markAsDirty()
    tick()
    expect(control.errors!.required).toBeDefined()
    expect(count).toBe(1)
  }))

  it('should not show placeholder when control is dirty with a validator with a message', fakeAsync(() => {
    const control = new FormControl(undefined, [ Validators.required ])
    const errors: IErrorRecord[] = [
      { validatorName: 'required', error: null, message: 'Required' }
    ]
    spectator = createComponent({ control, errors })
    let records: IErrorRecord[] = []
    spectator.component.displayRecords$.subscribe(v => records = v)
    control.markAsDirty()
    tick()


    // TODO: Fix bug making the error messages not update correctly initially
    spectator.component.errors = errors
    tick()


    expect(control.errors!.required).toBeDefined()
    console.log(control.errors)
    console.log(records)
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
