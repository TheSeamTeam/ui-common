import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component, Directive, Input } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'

import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faSignature } from '@fortawesome/free-solid-svg-icons'

import { TheSeamSideNavModule } from '../side-nav.module'
import { SideNavItemComponent } from './side-nav-item.component'

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[storyNavToggle]' })
class StoryNavToggleDirective {
  @Input() set storyNavToggle(value: string) { this._router.navigateByUrl(value) }
  constructor(private _router: Router) { }
}

export default {
  title: 'Framework/SideNav/Item/Basic',
  component: SideNavItemComponent,
  decorators: [
    moduleMetadata({
      declarations: [
        StoryRoutePlacholderComponent
      ],
      imports: [
        BrowserAnimationsModule,
        TheSeamSideNavModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ]
    })
  ]
} as Meta

export const NoChildren: Story = (args) => ({
  moduleMetadata: {
    imports: [
      RouterModule.forRoot([], { useHash: true }),
    ]
  },
  props: {
    itemType: 'basic',
    label: 'Example 1',
    icon: faBuilding
  },
  template: `
    <div class="d-flex flex-row vh-100">
      <div style="width: 260px; background-color: #e9ecef;" class="h-100">
        <seam-side-nav-item
          [itemType]="itemType"
          [icon]="icon"
          [label]="label">
        </seam-side-nav-item>
      </div>
    </div>`
})

export const WithChildren: Story = (args) => ({
  moduleMetadata: {
    declarations: [
      StoryNavToggleDirective
    ],
    imports: [
      RouterModule.forRoot([
        { path: 'example1', component: StoryRoutePlacholderComponent },
        { path: 'example1/example1.1', component: StoryRoutePlacholderComponent },
        { path: 'example1/example1.2', component: StoryRoutePlacholderComponent },
        { path: 'example1/example1.3', component: StoryRoutePlacholderComponent },
        { path: 'example1/example1.2.1', component: StoryRoutePlacholderComponent },
        { path: 'example1/example1.2.2', component: StoryRoutePlacholderComponent },
        { path: 'example1/example1.2.3', component: StoryRoutePlacholderComponent },
        { path: 'example2', component: StoryRoutePlacholderComponent }
      ], { useHash: true })
    ]
  },
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
        link: 'example1/example1.1'
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
            link: 'example1/example1.2.1'
          },
          {
            itemType: 'link',
            label: 'Example 1.2',
            icon: faBuilding,
            link: 'example1/example1.2.2'
          },
          {
            itemType: 'link',
            label: 'Example 1.3',
            link: 'example1/example1.2.3'
          },
        ]
      },
      {
        itemType: 'link',
        label: 'Example 1.3',
        link: 'example1/example1.3'
      },
    ]
  },
  template: `
    <div class="d-flex flex-row vh-100" [storyNavToggle]="currentUrl">
      <div style="width: 260px; background-color: #e9ecef;" class="h-100">
        <seam-side-nav-item
          [itemType]="itemType"
          [icon]="icon"
          [label]="label"
          [children]="children">
        </seam-side-nav-item>
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
})
