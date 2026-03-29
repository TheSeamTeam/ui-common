import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular'
import { expect } from 'storybook/test'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamNgSelectHarness, getHarness } from '@theseam/ui-common/testing'
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select'
import { argsToTpl } from '@theseam/ui-common/story-helpers'

const meta: Meta<NgSelectComponent> = {
  title: 'External/ngSelect',
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [NgSelectModule, ReactiveFormsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<ng-select ${argsToTpl()}></ng-select>`,
  }),
}

export default meta
type Story = StoryObj<NgSelectComponent>

export const Basic: Story = {
  args: {
    items: ['one', 'two', 'three', 'four'],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const ngSelectHarness = await getHarness(TheSeamNgSelectHarness, {
      canvasElement,
      fixture,
    })
    await expect(await ngSelectHarness.isRequired()).toBe(false)
    await expect(await ngSelectHarness.getValue()).toBe(null)
    await ngSelectHarness.clickOption({ label: 'two' })
    await expect(await ngSelectHarness.getValue()).toBe('two')
  },
}
