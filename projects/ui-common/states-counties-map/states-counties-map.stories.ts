import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular'
import { expect, fn, waitFor } from 'storybook/test'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamStatesCountiesMapComponent } from './states-counties-map.component'
import { TheSeamStatesCountiesMapHarness } from './testing/states-counties-map.harness'

// A mid-sized state (Alabama, FIPS 01) renders quickly and has enough counties
// to exercise selection + click behavior without being visually noisy.
const ALABAMA_FIPS = '01'
// A handful of Alabama county FIPS codes for selection stories.
const SELECTED_COUNTIES = ['01001', '01003', '01005']

const meta: Meta<TheSeamStatesCountiesMapComponent> = {
  title: 'StatesCountiesMap/Components/StatesCountiesMap',
  component: TheSeamStatesCountiesMapComponent,
  // The component fills its host, which has no intrinsic size. Wrap every
  // story in a fixed-size container so there's something for the SVG to
  // measure. Inputs/outputs are bound automatically by Storybook from the
  // component's compodoc metadata — no custom template needed.
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 480px; height: 320px;">${story}</div>`,
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<TheSeamStatesCountiesMapComponent>

export const Basic: Story = {
  args: {
    stateNumber: ALABAMA_FIPS,
    selectedCountyIds: [],
    countyClick: fn(),
    countyEnter: fn(),
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamStatesCountiesMapHarness, {
      canvasElement,
    })
    await waitFor(async () => {
      await expect(await harness.hasRendered()).toBe(true)
    })
    const counties = await harness.getCountyPaths()
    await expect(counties.length).toBeGreaterThan(0)
    await expect(await harness.getSelectedCountyIds()).toEqual([])
  },
}

export const WithSelection: Story = {
  args: {
    stateNumber: ALABAMA_FIPS,
    selectedCountyIds: SELECTED_COUNTIES,
    countyClick: fn(),
    countyEnter: fn(),
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamStatesCountiesMapHarness, {
      canvasElement,
    })
    await waitFor(async () => {
      const ids = await harness.getSelectedCountyIds()
      await expect(ids.sort()).toEqual([...SELECTED_COUNTIES].sort())
    })
  },
}

export const EmitsClickAndEnter: Story = {
  args: {
    stateNumber: ALABAMA_FIPS,
    selectedCountyIds: [],
    countyClick: fn(),
    countyEnter: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamStatesCountiesMapHarness, {
      canvasElement,
    })
    await waitFor(async () => {
      await expect(await harness.hasRendered()).toBe(true)
    })
    await harness.clickCounty('01001')
    await expect(args.countyClick).toHaveBeenCalledTimes(1)
    await expect(args.countyClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '01001' }),
    )

    await harness.enterCounty('01003')
    await expect(args.countyEnter).toHaveBeenCalledWith(
      expect.objectContaining({ id: '01003' }),
    )
  },
}

export const NoStateSelected: Story = {
  args: {
    stateNumber: null,
    selectedCountyIds: [],
    countyClick: fn(),
    countyEnter: fn(),
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamStatesCountiesMapHarness, {
      canvasElement,
    })
    await expect(await harness.hasRendered()).toBe(false)
  },
}
