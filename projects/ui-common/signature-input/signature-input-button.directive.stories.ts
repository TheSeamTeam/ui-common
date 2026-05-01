import { Component, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { applicationConfig, Meta, StoryObj } from '@storybook/angular'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamSignatureInputButtonDirective } from '@theseam/ui-common/signature-input'

@Component({
  selector: 'story-sig-button-host',
  imports: [
    ReactiveFormsModule,
    TheSeamButtonsModule,
    TheSeamSignatureInputButtonDirective,
  ],
  template: `
    <div class="p-3" style="max-width: 480px;">
      <p>
        Click <strong>Sign</strong> to open the signature panel. Submitting
        writes the rendered data URL to the bound form control; the preview
        below reflects whatever the control currently holds.
      </p>

      <button
        seamButton
        theme="primary"
        seamSignatureInput
        [formControl]="control"
        (signed)="lastEvent.set('signed')"
        (canceled)="lastEvent.set('canceled')"
      >
        Sign
      </button>

      <div class="mt-3">
        <div class="small text-muted">
          Last event: {{ lastEvent() ?? '(none)' }}
        </div>
        @if (control.value; as dataUrl) {
          <img
            [src]="dataUrl"
            alt="Captured signature"
            class="mt-2 border rounded"
            style="max-width: 300px; max-height: 80px;"
          />
        } @else {
          <div class="mt-2 text-black-50 font-italic">
            No signature captured yet.
          </div>
        }
      </div>
    </div>
  `,
})
class StorySignatureButtonHostComponent {
  readonly control = new FormControl<string | null>(null)
  readonly lastEvent = signal<'signed' | 'canceled' | null>(null)
}

const meta: Meta<StorySignatureButtonHostComponent> = {
  title: 'Signature Input/Button',
  tags: ['autodocs'],
  component: StorySignatureButtonHostComponent,
  decorators: [applicationConfig({ providers: [provideAnimations()] })],
}

export default meta
type Story = StoryObj<StorySignatureButtonHostComponent>

/**
 * A `seamButton` paired with `seamSignatureInput` on a reactive form
 * control. Clicking opens the signature input modal; submitting routes the
 * value back through the form control.
 */
export const WithFormControl: Story = {}
