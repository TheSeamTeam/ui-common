import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component, Directive, Input } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, Router, RouterModule } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faSignature } from '@fortawesome/free-solid-svg-icons'

import { HorizontalNavComponent } from '../horizontal-nav/horizontal-nav.component'
import { TheSeamNavModule } from '../nav.module'
import { NavItemComponent } from './nav-item.component'

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[storyNavToggle]', standalone: true })
class StoryNavToggleDirective {
  @Input() set storyNavToggle(value: string) { this._router.navigateByUrl(value) }
  constructor(private _router: Router) { }
}

class MockHorizontalNavComponent implements Partial<HorizontalNavComponent> {
  // overlay = false
}

const meta: Meta<NavItemComponent> = {
  title: 'Framework/Nav/Item/Basic',
  component: NavItemComponent,
  decorators: [
    applicationConfig({
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        provideAnimations(),
        provideLocationMocks(),
      ],
    }),
    moduleMetadata({
      declarations: [
        StoryRoutePlacholderComponent,
      ],
      imports: [
        TheSeamNavModule,
        StoryNavToggleDirective,
      ],
      providers: [
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
        provideRouter([]),
      ],
    }),
  ],
  render: args => ({
    props: { ...args },
    template: `
      <div class="w-100 vh-100" [storyNavToggle]="currentUrl">
        <div style="height: 60px;" class="d-flex bg-light">
          <seam-nav-item
            [itemType]="itemType"
            [icon]="icon"
            [label]="label"
            [expanded]="expanded"
            [active]="active"
            [hierLevel]="hierLevel"
            [compact]="compact">
          </seam-nav-item>
        </div>
      </div>`,
  }),
  args: {
    itemType: 'basic',
    icon: faBuilding,
    label: 'Example 1',
    expanded: false,
    active: false,
    hierLevel: 0,
    compact: false,
  },
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
          { path: 'example1/example1.2.1', component: StoryRoutePlacholderComponent },
          { path: 'example1/example1.2.2', component: StoryRoutePlacholderComponent },
          { path: 'example1/example1.2.3', component: StoryRoutePlacholderComponent },
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
      itemType: 'basic',
      label: 'Example 1',
      icon: faBuilding,
      children: [
        {
          itemType: 'link',
          label: 'Example 1.1',
          icon: faSignature,
          link: 'example1/example1.1',
        },
        // {
        //   itemType: 'link',
        //   label: 'Example 1.2',
        //   icon: faBuilding,
        //   link: 'example1/example1.2',
        // },
        {
          itemType: 'basic',
          label: 'Example 1.2',
          icon: faBuilding,
          children: [
            {
              itemType: 'link',
              label: 'Example 1.1',
              icon: faSignature,
              link: 'example1/example1.2.1',
            },
            {
              itemType: 'link',
              label: 'Example 1.2',
              icon: faBuilding,
              link: 'example1/example1.2.2',
            },
            {
              itemType: 'link',
              label: 'Example 1.3',
              link: 'example1/example1.2.3',
            },
          ]
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
            [children]="children">
          </seam-nav-item>
        </div>

        <div class="p-4">
          <router-outlet></router-outlet>
          <div>
            <a routerLink="/example1">Set Route: '/example1'</a><br>
            <a routerLink="/example1/example1.1">Set Route: '/example1/example1.1'</a><br>
            <a routerLink="/example1/example1.2">Set Route: '/example1/example1.2'</a><br>
            <a routerLink="/example1/example1.3">Set Route: '/example1/example1.3'</a><br>
          </div>
        </div>
      </div>`
  }),
}
