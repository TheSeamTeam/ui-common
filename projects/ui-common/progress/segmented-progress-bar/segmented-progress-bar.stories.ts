import { applicationConfig, Meta, StoryObj } from '@storybook/angular'
import { expect, fn } from 'storybook/test'
import { provideAnimations } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamSegmentedProgressBarComponent } from './segmented-progress-bar.component'
import { TheSeamSegmentedProgressBarStep } from './segmented-progress-bar.models'
import { TheSeamSegmentedProgressBarHarness } from '../testing/segmented-progress-bar.harness'

const sampleSteps: TheSeamSegmentedProgressBarStep[] = [
  { label: 'Step 1', value: 'step-1', completed: true },
  { label: 'Step 2', value: 'step-2', completed: true },
  { label: 'Step 3', value: 'step-3', completed: false },
  { label: 'Step 4', value: 'step-4', completed: false },
]

const meta: Meta<TheSeamSegmentedProgressBarComponent> = {
  title: 'Progress/Components/SegmentedProgressBar',
  component: TheSeamSegmentedProgressBarComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamSegmentedProgressBarComponent>

export const Basic: Story = {
  args: {
    progressSteps: sampleSteps,
    clickable: false,
    enableTooltip: false,
    cellClicked: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamSegmentedProgressBarHarness, {
      canvasElement,
    })
    const cells = await harness.getCells()
    await expect(cells).toHaveLength(4)
    await expect(await cells[0].getState()).toBe('complete')
    await expect(await cells[1].getState()).toBe('complete')
    await expect(await cells[2].getState()).toBe('default')
    await expect(await cells[3].getState()).toBe('default')

    await harness.clickCell(0)
    await expect(args.cellClicked).not.toHaveBeenCalled()
  },
}

export const Clickable: Story = {
  args: {
    progressSteps: sampleSteps,
    clickable: true,
    enableTooltip: true,
    cellClicked: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamSegmentedProgressBarHarness, {
      canvasElement,
    })
    await harness.clickCell(2)
    await expect(args.cellClicked).toHaveBeenCalledTimes(1)
    await expect(args.cellClicked).toHaveBeenCalledWith(sampleSteps[2])
  },
}
