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

import { TheSeamSignatureInputTextComponent } from '@theseam/ui-common/signature-input'

@Component({
  selector: 'story-text-form-host',
  imports: [ReactiveFormsModule, TheSeamSignatureInputTextComponent],
  template: `
    <seam-signature-input-text
      [formControl]="control"
    ></seam-signature-input-text>
    <div class="mt-2 small text-muted">
      Captured value:
      {{ control.value ? control.value.length + ' char data URL' : '(empty)' }}
    </div>
  `,
})
class StoryTextFormHostComponent {
  readonly control = new FormControl<string | null>(null)
}

const meta: Meta<TheSeamSignatureInputTextComponent> = {
  title: 'Signature Input/Text',
  tags: ['autodocs'],
  component: TheSeamSignatureInputTextComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
    componentWrapperDecorator(
      (story) => `<div style="padding: 16px;">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<TheSeamSignatureInputTextComponent>

/** Standalone text-to-canvas signature. Requires Google Fonts to be reachable. */
export const Basic: Story = {}

/** Bound to a reactive FormControl — the typical usage. */
export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [StoryTextFormHostComponent] })],
  render: () => ({
    template: `<story-text-form-host></story-text-form-host>`,
  }),
}
