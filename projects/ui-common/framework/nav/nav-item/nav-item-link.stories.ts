import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { Component, Directive, Input } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, Router, RouterModule } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faSignature } from '@fortawesome/free-solid-svg-icons'

import { HorizontalNavComponent } from '../horizontal-nav/horizontal-nav.component'
import { NavItemComponent } from './nav-item.component'
import { TheSeamNavService } from '../nav.service'

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}

@Directive({ selector: '[storyNavToggle]' })
class StoryNavToggleDirective {
  @Input() set storyNavToggle(value: string) { this._router.navigateByUrl(value) }
  constructor(private _router: Router) { }
}

class MockHorizontalNavComponent implements Partial<HorizontalNavComponent> {
  // overlay = false
}

const meta: Meta<NavItemComponent> = {
  title: 'Framework/Nav/Item/Link',
  component: NavItemComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
      ],
    }),
    moduleMetadata({
      imports: [
        StoryNavToggleDirective,
      ],
      providers: [
        TheSeamNavService, // Normally would be provided by HorizontalNavComponent.
        { provide: HorizontalNavComponent, useClass: MockHorizontalNavComponent },
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<NavItemComponent>

export const NoChildren: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([
          { path: 'example1', component: StoryRoutePlacholderComponent },
          { path: 'example2', component: StoryRoutePlacholderComponent },
        ]),
      ],
    }),
    moduleMetadata({
      imports: [
        RouterModule,
      ],
    }),
  ],
  render: args => ({
    props: {
      currentUrl: 'example2',
      itemType: 'link',
      label: 'Example 1',
      icon: faBuilding,
      link: 'example1',
      queryParams: [],
      children: [],
    },
    template: `
      <div class="w-100 vh-100" [storyNavToggle]="currentUrl">
        <div style="height: 60px;" class="d-flex bg-light">
          <seam-nav-item
            [itemType]="itemType"
            [icon]="icon"
            [label]="label"
            [link]="link"
            [queryParams]="queryParams"
            [children]="children">
          </seam-nav-item>
        </div>

        <div class="p-4">
          <router-outlet></router-outlet>
          <div>
            <a routerLink="/example1">Set Active</a><br>
            <a routerLink="/example2">Set Inactive</a>
          </div>
        </div>
      </div>
    `,
  }),
}

export const WithChildren: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([
          { path: 'example1', component: StoryRoutePlacholderComponent },
          { path: 'example1/example1.1', component: StoryRoutePlacholderComponent },
          { path: 'example1/example1.2', component: StoryRoutePlacholderComponent },
          { path: 'example1/example1.3', component: StoryRoutePlacholderComponent },
          { path: 'example2', component: StoryRoutePlacholderComponent },
        ]),
      ],
    }),
    moduleMetadata({
      imports: [
        RouterModule,
      ],
    }),
  ],
  render: args => ({
    props: {
      currentUrl: 'example1',

      itemType: 'link',
      label: 'Example 1',
      icon: faBuilding,
      link: 'example1',
      children: [
        {
          itemType: 'link',
          label: 'Example 1.1',
          icon: faSignature,
          link: 'example1/example1.1',
        },
        {
          itemType: 'link',
          label: 'Example 1.2',
          icon: faBuilding,
          link: 'example1/example1.2',
        },
        {
          itemType: 'link',
          label: 'Example 1.3',
          link: 'example1/example1.3',
        },
      ],
    },
    template: `
      <div class="w-100 vh-100" [storyNavToggle]="currentUrl">
        <div style="height: 60px;" class="d-flex bg-light">
          <seam-nav-item
            [itemType]="itemType"
            [icon]="icon"
            [label]="label"
            [link]="link"
            [children]="children"
            childAction="menu">
          </seam-nav-item>
        </div>

        <div class="p-4">
          <router-outlet></router-outlet>
          <div>
            <a routerLink="/example1">Set Route: '/example1'</a><br>
            <a routerLink="/example1/example1.1">Set Route: '/example1/example1.1'</a><br>
            <a routerLink="/example1/example1.2">Set Route: '/example1/example1.2'</a><br>
            <a routerLink="/example1/example1.3">Set Route: '/example1/example1.3'</a><br>
            <a routerLink="/example2">Set Route: '/example2'</a><br>
          </div>
        </div>
      </div>`,
  }),
}
