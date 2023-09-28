import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { faShare } from '@fortawesome/free-solid-svg-icons'
import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamIconModule } from '../icon.module'
import { IconComponent } from './icon.component'
import { TheSeamIconComponentHarness, toIconLookup } from '../testing/icon.harness'
import { SeamIcon } from '../icon'

const ASSET_URL = 'assets/images/icons8-cotton-filled-48.png'
const ASSET2_URL = 'assets/images/landdb-14d6a0.PNG'

interface StoryExtraProps {
  icon2: SeamIcon | undefined | null
}

const meta: Meta<IconComponent & StoryExtraProps> = {
  title: 'Icon/Components/Basic',
  component: IconComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamIconModule
      ]
    })
  ]
}

export default meta
type Story = StoryObj<IconComponent & StoryExtraProps>

export const Url: Story = {
  args: {
    icon: ASSET_URL,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toBe(ASSET_URL)
    await expectFn(await harness.getIconType()).toBe(undefined)
    await expectFn(await harness.isDisabled()).toBe(false)
  },
}

export const UrlStyledSquare: Story = {
  name: 'Url(styled-square)',
  args: {
    icon: ASSET_URL,
    iconType: 'styled-square',
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toBe(ASSET_URL)
    await expectFn(await harness.getIconType()).toBe('styled-square')
    await expectFn(await harness.isDisabled()).toBe(false)
  },
}

export const UrlImageFill: Story = {
  name: 'Url(image-fill)',
  render: args => ({
    props: { ...args },
    template: `
      <div class="p-5">
        <div class="alert alert-warning">Only partially implemented so far for images. The image will shrink but not grow currently.</div>

        <div class="border mb-2" style="height: 200px; width: 200px;">
          <seam-icon [icon]="icon" iconType="image-fill"></seam-icon>
        </div>

        <div class="border" style="height: 200px; width: 200px;">
          <seam-icon [icon]="icon2" iconType="image-fill"></seam-icon>
        </div>
      </div>`,
  }),
  args: {
    icon: ASSET_URL,
    icon2: ASSET2_URL,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness.with({ icon: ASSET_URL }), { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toBe(ASSET_URL)
    await expectFn(await harness.getIconType()).toBe('image-fill')
    await expectFn(await harness.isDisabled()).toBe(false)

    const harness2 = await getHarness(TheSeamIconComponentHarness.with({ icon: ASSET2_URL }), { canvasElement, fixture })
    await expectFn(await harness2.getIcon()).toBe(ASSET2_URL)
    await expectFn(await harness2.getIconType()).toBe('image-fill')
    await expectFn(await harness2.isDisabled()).toBe(false)
  },
}

export const FontAwesome: Story = {
  name: 'FontAwesome',
  render: args => ({
    props: {
      ...args,
      icon: faShare,
    },
  }),
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toStrictEqual(toIconLookup(faShare))
    await expectFn(await harness.getIconType()).toBe(undefined)
    await expectFn(await harness.isDisabled()).toBe(false)
  },
}

export const FontAwesomeStyledSquare: Story = {
  name: 'FontAwesome(styled-square)',
  render: args => ({
    props: {
      ...args,
      icon: faShare,
    },
  }),
  args: {
    iconType: 'styled-square',
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toStrictEqual(toIconLookup(faShare))
    await expectFn(await harness.getIconType()).toBe('styled-square')
    await expectFn(await harness.isDisabled()).toBe(false)
  },
}

export const FontAwesomeImageFill: Story = {
  name: 'FontAwesome(image-fill)',
  render: args => ({
    props: {
      ...args,
      icon: faShare,
    },
  }),
  args: {
    iconType: 'image-fill',
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toStrictEqual(toIconLookup(faShare))
    await expectFn(await harness.getIconType()).toBe('image-fill')
    await expectFn(await harness.isDisabled()).toBe(false)
  },
}

export const DefaultIcon: Story = {
  args: {
    defaultIcon: ASSET2_URL,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toBe(ASSET2_URL)
    await expectFn(await harness.getIconType()).toBe(undefined)
    await expectFn(await harness.isDisabled()).toBe(false)
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamIconComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getIcon()).toBe(undefined)
    await expectFn(await harness.getIconType()).toBe(undefined)
    await expectFn(await harness.isDisabled()).toBe(true)
  },
}
