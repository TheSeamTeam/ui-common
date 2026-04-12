import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'

import { createPasswordFormGroup } from '../../controls/create-password-form-group'
import {
  TheSeamPasswordValidatorsListComponent,
  TheSeamPasswordValidatorItem,
} from './password-validators-list.component'
import { TheSeamPasswordValidatorsListHarness } from './testing/password-validators-list.harness'

@Component({
  template: `<seam-password-validators-list [control]="form" />`,
  standalone: true,
  imports: [TheSeamPasswordValidatorsListComponent],
})
class DefaultHostComponent {
  form = createPasswordFormGroup()
}

@Component({
  template: `<seam-password-validators-list
    [control]="form"
    [validators]="customValidators"
  />`,
  standalone: true,
  imports: [TheSeamPasswordValidatorsListComponent],
})
class CustomHostComponent {
  form = new FormGroup({
    password1: new FormControl(''),
    password2: new FormControl(''),
  })
  customValidators: TheSeamPasswordValidatorItem[] = [
    { validatorName: 'required', message: 'Password is required.' },
    {
      validatorName: 'passwordMatch',
      message: 'Passwords must match.',
      target: 'group',
    },
  ]
}

describe('TheSeamPasswordValidatorsListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DefaultHostComponent, ReactiveFormsModule],
    })
  })

  async function setup() {
    const fixture = TestBed.createComponent(DefaultHostComponent)
    fixture.detectChanges()
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      TheSeamPasswordValidatorsListHarness,
    )
    return { fixture, harness }
  }

  it('should display the header', async () => {
    const { harness } = await setup()
    const header = await harness.getHeaderText()
    expect(header).toContain('Password must meet the following')
    expect(header).toContain('requirements:')
  })

  it('should render all 7 default validator items', async () => {
    const { harness } = await setup()
    const count = await harness.getItemCount()
    expect(count).toBe(7)
  })

  it('should display correct messages for default validators', async () => {
    const { harness } = await setup()
    const messages = await harness.getItemMessages()
    expect(messages).toContain('Be at least 8 characters.')
    expect(messages).toContain('At least one lowercase letter.')
    expect(messages).toContain('At least one uppercase letter.')
    expect(messages).toContain('At least one number.')
    expect(messages).toContain(
      'At least one special character (!, @, #, etc.).',
    )
    expect(messages).toContain('Cannot contain "password".')
    expect(messages).toContain('Both password fields must match.')
  })

  it('should not show icons when fields are pristine', async () => {
    const { harness } = await setup()
    const texts = await harness.getIconContainerTexts()
    texts.forEach((text) => expect(text).toBe(''))
  })

  it('should show icons when password1 is dirty', async () => {
    const { fixture, harness } = await setup()
    const form = fixture.componentInstance.form
    form.controls.password1.setValue('weak')
    form.controls.password1.markAsDirty()
    fixture.detectChanges()

    const count = await harness.getItemCount()
    expect(count).toBe(7)
  })

  it('should keep all items when password meets all criteria', async () => {
    const { fixture, harness } = await setup()
    const form = fixture.componentInstance.form
    form.controls.password1.setValue('MyStr0ng!')
    form.controls.password1.markAsDirty()
    fixture.detectChanges()

    const count = await harness.getItemCount()
    expect(count).toBe(7)
  })

  it('should handle both fields dirty for match validator', async () => {
    const { fixture, harness } = await setup()
    const form = fixture.componentInstance.form
    form.controls.password1.setValue('MyStr0ng!')
    form.controls.password1.markAsDirty()
    form.controls.password2.setValue('MyStr0ng!')
    form.controls.password2.markAsDirty()
    fixture.detectChanges()

    const count = await harness.getItemCount()
    expect(count).toBe(7)
  })
})

describe('TheSeamPasswordValidatorsListComponent with custom validators', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomHostComponent, ReactiveFormsModule],
    })
  })

  async function setup() {
    const fixture = TestBed.createComponent(CustomHostComponent)
    fixture.detectChanges()
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      TheSeamPasswordValidatorsListHarness,
    )
    return { fixture, harness }
  }

  it('should render only custom validator items', async () => {
    const { harness } = await setup()
    const count = await harness.getItemCount()
    expect(count).toBe(2)
  })

  it('should display custom messages', async () => {
    const { harness } = await setup()
    const messages = await harness.getItemMessages()
    expect(messages).toEqual(['Password is required.', 'Passwords must match.'])
  })
})
