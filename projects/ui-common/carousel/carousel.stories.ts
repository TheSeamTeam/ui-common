import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamCarouselComponent } from './carousel.component'
import { TheSeamCarouselModule } from './carousel.module'

export default {
  title: 'Carousel/Components',
  component: TheSeamCarouselComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamCarouselModule
      ]
    })
  ],
}

export const Basic = ({ ...args }) => ({
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
})

export const Fast = ({ ...args }) => ({
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

export const AutoplayOff = ({ ...args }) => ({
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
})

export const NoButtons = ({ ...args }) => ({
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
})
