import { Component, signal } from '@angular/core'
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect } from 'storybook/test'
import { provideAnimations } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import {
  SignatureInputPanelResult,
  TheSeamSignatureInputPanelComponent,
  TheSeamSignatureInputPanelHarness,
} from '@theseam/ui-common/signature-input'

/**
 * Story host that lets the reader exercise the panel outside of a modal
 * (the panel emits a `result` output so it can be embedded anywhere).
 */
@Component({
  selector: 'story-signature-input-panel-host',
  imports: [TheSeamSignatureInputPanelComponent],
  template: `
    <div class="mb-2">
      <seam-signature-input-panel
        (result)="onResult($event)"
      ></seam-signature-input-panel>
    </div>
    @if (lastResult(); as r) {
      <pre class="p-2 bg-light border rounded"
        >{{ r.type
        }}{{
          r.type === 'submit'
            ? ' — value received (' + r.value.length + ' chars)'
            : ''
        }}</pre
      >
    }
  `,
})
class StoryPanelHostComponent {
  readonly lastResult = signal<SignatureInputPanelResult | null>(null)
  onResult(result: SignatureInputPanelResult) {
    this.lastResult.set(result)
  }
}

const meta: Meta<TheSeamSignatureInputPanelComponent> = {
  title: 'Signature Input/Panel',
  tags: ['autodocs'],
  component: TheSeamSignatureInputPanelComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
    componentWrapperDecorator(
      (story) => `<div style="padding: 16px; width: 560px;">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<TheSeamSignatureInputPanelComponent>

/**
 * Default: rendered inline with a result listener. Flip between tabs to try
 * the pen, text, or upload variants. Submitting emits a `SignatureInputPanelResult`.
 */
export const Default: Story = {
  decorators: [moduleMetadata({ imports: [StoryPanelHostComponent] })],
  render: () => ({
    template: `<story-signature-input-panel-host></story-signature-input-panel-host>`,
  }),
}

/**
 * Verifies initial render: the panel mounts with submit disabled and no
 * registered input selected beyond the default "pen" tab.
 */
export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamSignatureInputPanelHarness, {
      canvasElement,
    })
    await expect(await harness.isSubmitDisabled()).toBe(true)
    await expect(await harness.getActiveType()).toBe('pen')
  },
}

/**
 * Switching tabs exchanges the active input component. The submit button
 * stays disabled until the new tab's control holds a non-empty value.
 */
export const SwitchTabs: Story = {
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamSignatureInputPanelHarness, {
      canvasElement,
    })
    await harness.showType('text')
    await expect(await harness.getActiveType()).toBe('text')

    await harness.showType('img')
    await expect(await harness.getActiveType()).toBe('img')

    await harness.showType('pen')
    await expect(await harness.getActiveType()).toBe('pen')
  },
}
