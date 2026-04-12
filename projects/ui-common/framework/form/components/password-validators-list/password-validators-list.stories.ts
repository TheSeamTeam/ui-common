import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect } from 'storybook/test'
import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import { createPasswordFormGroup } from '../../controls/create-password-form-group'
import { TheSeamPasswordValidatorsListComponent } from './password-validators-list.component'
import { TheSeamPasswordValidatorsListHarness } from './testing/password-validators-list.harness'

const meta: Meta<TheSeamPasswordValidatorsListComponent> = {
  title: 'Framework/Form/PasswordValidatorsList',
  component: TheSeamPasswordValidatorsListComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<TheSeamPasswordValidatorsListComponent>

export const Pristine: Story = {
  render: (args) => {
    const form = createPasswordFormGroup()
    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <div style="margin-bottom: 16px;">
            <label>Password</label>
            <input type="password" formControlName="password1" />
          </div>
          <div style="margin-bottom: 16px;">
            <label>Confirm Password</label>
            <input type="password" formControlName="password2" />
          </div>
        </form>
        <seam-password-validators-list [control]="form" />
      `,
    }
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamPasswordValidatorsListHarness, {
      canvasElement,
      fixture,
    })

    await expect(await harness.getItemCount()).toBe(7)

    const header = await harness.getHeaderText()
    await expect(header).toContain('Password must meet the following')

    const messages = await harness.getItemMessages()
    await expect(messages).toContain('Be at least 8 characters.')
    await expect(messages).toContain('At least one lowercase letter.')
    await expect(messages).toContain('At least one uppercase letter.')
    await expect(messages).toContain('At least one number.')
    await expect(messages).toContain(
      'At least one special character (!, @, #, etc.).',
    )
    await expect(messages).toContain('Cannot contain "password".')
    await expect(messages).toContain('Both password fields must match.')

    // No icons when pristine
    await expect(await harness.getIconCount()).toBe(0)
  },
}

export const WeakPassword: Story = {
  render: (args) => {
    const form = createPasswordFormGroup()
    form.controls.password1.setValue('weak')
    form.controls.password1.markAsDirty()
    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <div style="margin-bottom: 16px;">
            <label>Password</label>
            <input type="password" formControlName="password1" />
          </div>
          <div style="margin-bottom: 16px;">
            <label>Confirm Password</label>
            <input type="password" formControlName="password2" />
          </div>
        </form>
        <seam-password-validators-list [control]="form" />
      `,
    }
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamPasswordValidatorsListHarness, {
      canvasElement,
      fixture,
    })

    await expect(await harness.getItemCount()).toBe(7)

    // 6 field validators should show icons (password1 is dirty)
    // Match validator hidden (only one field dirty)
    await expect(await harness.getIconCount()).toBe(6)
    await expect(await harness.getErrorCount()).toBeGreaterThan(0)
  },
}

export const StrongPassword: Story = {
  render: (args) => {
    const form = createPasswordFormGroup()
    form.controls.password1.setValue('MyStr0ng!')
    form.controls.password1.markAsDirty()
    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <div style="margin-bottom: 16px;">
            <label>Password</label>
            <input type="password" formControlName="password1" />
          </div>
          <div style="margin-bottom: 16px;">
            <label>Confirm Password</label>
            <input type="password" formControlName="password2" />
          </div>
        </form>
        <seam-password-validators-list [control]="form" />
      `,
    }
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamPasswordValidatorsListHarness, {
      canvasElement,
      fixture,
    })

    await expect(await harness.getItemCount()).toBe(7)

    // All 6 field validators pass
    await expect(await harness.getSuccessCount()).toBe(6)
    await expect(await harness.getErrorCount()).toBe(0)
  },
}

export const MatchingPasswords: Story = {
  render: (args) => {
    const form = createPasswordFormGroup()
    form.controls.password1.setValue('MyStr0ng!')
    form.controls.password1.markAsDirty()
    form.controls.password2.setValue('MyStr0ng!')
    form.controls.password2.markAsDirty()
    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <div style="margin-bottom: 16px;">
            <label>Password</label>
            <input type="password" formControlName="password1" />
          </div>
          <div style="margin-bottom: 16px;">
            <label>Confirm Password</label>
            <input type="password" formControlName="password2" />
          </div>
        </form>
        <seam-password-validators-list [control]="form" />
      `,
    }
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamPasswordValidatorsListHarness, {
      canvasElement,
      fixture,
    })

    await expect(await harness.getItemCount()).toBe(7)

    // All 7 validators pass (both fields dirty, matching)
    await expect(await harness.getIconCount()).toBe(7)
    await expect(await harness.getSuccessCount()).toBe(7)
    await expect(await harness.getErrorCount()).toBe(0)
  },
}

export const MismatchedPasswords: Story = {
  render: (args) => {
    const form = createPasswordFormGroup()
    form.controls.password1.setValue('MyStr0ng!')
    form.controls.password1.markAsDirty()
    form.controls.password2.setValue('Different!')
    form.controls.password2.markAsDirty()
    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <div style="margin-bottom: 16px;">
            <label>Password</label>
            <input type="password" formControlName="password1" />
          </div>
          <div style="margin-bottom: 16px;">
            <label>Confirm Password</label>
            <input type="password" formControlName="password2" />
          </div>
        </form>
        <seam-password-validators-list [control]="form" />
      `,
    }
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamPasswordValidatorsListHarness, {
      canvasElement,
      fixture,
    })

    await expect(await harness.getItemCount()).toBe(7)

    // 6 field validators pass, 1 match validator fails
    await expect(await harness.getIconCount()).toBe(7)
    await expect(await harness.getSuccessCount()).toBe(6)
    await expect(await harness.getErrorCount()).toBe(1)
  },
}

export const CustomMinLength: Story = {
  render: (args) => {
    const form = createPasswordFormGroup({ minLength: 12 })
    form.controls.password1.setValue('MyStr0ng!')
    form.controls.password1.markAsDirty()
    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <div style="margin-bottom: 16px;">
            <label>Password (min 12 chars)</label>
            <input type="password" formControlName="password1" />
          </div>
          <div style="margin-bottom: 16px;">
            <label>Confirm Password</label>
            <input type="password" formControlName="password2" />
          </div>
        </form>
        <seam-password-validators-list [control]="form" />
      `,
    }
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamPasswordValidatorsListHarness, {
      canvasElement,
      fixture,
    })

    await expect(await harness.getItemCount()).toBe(7)

    // "MyStr0ng!" is 9 chars — fails 12-char minimum
    // 5 pass, 1 fails (length), match hidden
    await expect(await harness.getIconCount()).toBe(6)
    await expect(await harness.getSuccessCount()).toBe(5)
    await expect(await harness.getErrorCount()).toBe(1)
  },
}
