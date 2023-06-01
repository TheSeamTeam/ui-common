import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamCarouselComponent } from './carousel.component'
import { TheSeamCarouselModule } from './carousel.module'
import { TheSeamCarouselHarness } from './testing'

const meta: Meta = {
  title: 'Carousel/Components',
  component: TheSeamCarouselComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamCarouselModule
      ]
    })
  ],
}

export default meta
type Story = StoryObj<TheSeamCarouselComponent>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-carousel
        style="width: 500px; margin: 50px auto;"
        class="shadow rounded p-2">
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">1</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">2</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">3</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">4</div>
        </ng-template>
      </seam-carousel>`
  }),
  play: async ({ canvasElement, fixture }) => {
    const carouselHarness = await getHarness(TheSeamCarouselHarness, { canvasElement, fixture })
    await expectFn(await carouselHarness.hasPreviousSlideButton()).toBe(true)
    await expectFn(await carouselHarness.hasNextSlideButton()).toBe(true)
    await expectFn(await carouselHarness.hasSlideButtons()).toBe(true)
    await expectFn(await carouselHarness.hasAutoPlayToggleButton()).toBe(true)
  },
}

export const Fast: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-carousel
        slideInterval="1000"
        style="width: 500px; margin: 50px auto;"
        class="shadow rounded p-2">
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">1</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">2</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">3</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">4</div>
        </ng-template>
      </seam-carousel>`
  })
}

export const AutoplayOff: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-carousel
        [autoPlay]="false"
        style="width: 500px; margin: 50px auto;"
        class="shadow rounded p-2">
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">1</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">2</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">3</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">4</div>
        </ng-template>
      </seam-carousel>`
  }),
  play: async ({ canvasElement, fixture }) => {
    const carouselHarness = await getHarness(TheSeamCarouselHarness, { canvasElement, fixture })
    await expectFn(await carouselHarness.activeTileIndex()).toBe('0')
    await carouselHarness.goToNextSlide()
    await expectFn(await carouselHarness.activeTileIndex()).toBe('1')
    await carouselHarness.goToSlide(3)
    await expectFn(await carouselHarness.activeTileIndex()).toBe('3')
    await carouselHarness.goToNextSlide()
    await expectFn(await carouselHarness.activeTileIndex()).toBe('0')
    await carouselHarness.goToPreviousSlide()
    await expectFn(await carouselHarness.activeTileIndex()).toBe('3')
    await carouselHarness.goToSlide(0)
    await expectFn(await carouselHarness.activeTileIndex()).toBe('0')
  },
}

export const NoButtons: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-carousel
        [showPager]="false"
        [showNavButtons]="false"
        [showPauseButton]="false"
        style="width: 500px; margin: 50px auto;"
        class="shadow rounded p-2">
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">1</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">2</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">3</div>
        </ng-template>
        <ng-template seamCarouselSlide>
          <div class="text-center p-4">4</div>
        </ng-template>
      </seam-carousel>`
  }),
  play: async ({ canvasElement, fixture }) => {
    const carouselHarness = await getHarness(TheSeamCarouselHarness, { canvasElement, fixture })
    await expectFn(await carouselHarness.hasPreviousSlideButton()).toBe(false)
    await expectFn(await carouselHarness.hasNextSlideButton()).toBe(false)
    await expectFn(await carouselHarness.hasSlideButtons()).toBe(false)
    await expectFn(await carouselHarness.hasAutoPlayToggleButton()).toBe(false)
  },
}
