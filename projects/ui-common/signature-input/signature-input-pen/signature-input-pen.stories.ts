import { Component } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamSignatureInputPenComponent } from '@theseam/ui-common/signature-input'

/**
 * Reactive-forms host wiring the pen component to a typed FormControl
 * and displaying the captured data URL length.
 */
@Component({
  selector: 'story-pen-form-host',
  imports: [ReactiveFormsModule, TheSeamSignatureInputPenComponent],
  template: `
    <seam-signature-input-pen
      [formControl]="control"
    ></seam-signature-input-pen>
    <div class="mt-2 small text-muted">
      Captured value:
      {{ control.value ? control.value.length + ' char data URL' : '(empty)' }}
    </div>
  `,
})
class StoryPenFormHostComponent {
  readonly control = new FormControl<string | null>(null)
}

const meta: Meta<TheSeamSignatureInputPenComponent> = {
  title: 'Signature Input/Pen',
  tags: ['autodocs'],
  component: TheSeamSignatureInputPenComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
    componentWrapperDecorator(
      (story) => `<div style="padding: 16px;">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<TheSeamSignatureInputPenComponent>

/** Standalone pen canvas with no form integration. */
export const Basic: Story = {}

/** Pen bound to a reactive FormControl — the typical usage. */
export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [StoryPenFormHostComponent] })],
  render: () => ({
    template: `<story-pen-form-host></story-pen-form-host>`,
  }),
}
