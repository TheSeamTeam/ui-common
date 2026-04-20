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

import { TheSeamSignatureInputImgComponent } from '@theseam/ui-common/signature-input'

@Component({
  selector: 'story-img-form-host',
  imports: [ReactiveFormsModule, TheSeamSignatureInputImgComponent],
  template: `
    <seam-signature-input-img
      [formControl]="control"
    ></seam-signature-input-img>
    <div class="mt-2 small text-muted">
      Captured value:
      {{ control.value ? control.value.length + ' char data URL' : '(empty)' }}
    </div>
  `,
})
class StoryImgFormHostComponent {
  readonly control = new FormControl<string | null>(null)
}

const meta: Meta<TheSeamSignatureInputImgComponent> = {
  title: 'Signature Input/Img',
  tags: ['autodocs'],
  component: TheSeamSignatureInputImgComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
    componentWrapperDecorator(
      (story) => `<div style="padding: 16px;">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<TheSeamSignatureInputImgComponent>

/** Standalone image uploader. Click or drag a file onto the drop zone. */
export const Basic: Story = {}

/** Upload area wired to a reactive FormControl. */
export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [StoryImgFormHostComponent] })],
  render: () => ({
    template: `<story-img-form-host></story-img-form-host>`,
  }),
}
