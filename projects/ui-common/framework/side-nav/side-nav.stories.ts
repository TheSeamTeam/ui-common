import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'

import { faBuilding, faCompass } from '@fortawesome/free-regular-svg-icons'
import { faSignature } from '@fortawesome/free-solid-svg-icons'

import { SideNavComponent } from './side-nav.component'
import { TheSeamSideNavModule } from './side-nav.module'

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}

export default {
  title: 'Framework/SideNav',
  component: SideNavComponent,
  decorators: [
    moduleMetadata({
      declarations: [
        StoryRoutePlacholderComponent
      ],
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([
          { path: 'example1', component: StoryRoutePlacholderComponent },
          {
            path: 'example2',
            component: StoryRoutePlacholderComponent,
            children: [
              { path: 'example1.1', component: StoryRoutePlacholderComponent },
              { path: 'example1.2', component: StoryRoutePlacholderComponent },
              { path: 'example1.3', component: StoryRoutePlacholderComponent },
              { path: 'example1.4', component: StoryRoutePlacholderComponent }
            ]
          },
          {
            path: 'example3',
            component: StoryRoutePlacholderComponent,
            children: [
              { path: 'example1.1', component: StoryRoutePlacholderComponent },
              { path: 'example1.2', component: StoryRoutePlacholderComponent },
              { path: 'example1.3', component: StoryRoutePlacholderComponent },
              { path: 'example1.4', component: StoryRoutePlacholderComponent },
              {
                path: 'ex2',
                component: StoryRoutePlacholderComponent,
                children: [
                  { path: 'example1.1', component: StoryRoutePlacholderComponent },
                  { path: 'example1.2', component: StoryRoutePlacholderComponent },
                  { path: 'example1.3', component: StoryRoutePlacholderComponent },
                  { path: 'example1.4', component: StoryRoutePlacholderComponent }
                ]
              }
            ]
          },
          { path: 'example4', component: StoryRoutePlacholderComponent },
          { path: 'example5', component: StoryRoutePlacholderComponent }
        ], { useHash: true }),
        TheSeamSideNavModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ]
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  }
} as Meta

export const Basic: Story = (args) => ({
  props: {
    items: [
      {
        itemType: 'link',
        label: 'Example 1',
        icon: faSignature,
        link: 'example1',
      },
      {
        itemType: 'link',
        label: 'Example 2',
        icon: faBuilding,
        link: 'example2',
        badge: {
          text: '5',
          theme: 'primary',
          // tooltip: 'ExampleToolTip'
          tooltip: {
            tooltip: 'Example Tooltip rergerge',
            container: 'body'
          }
        },
        children: [
          {
            itemType: 'link',
            label: 'Example 1.1',
            icon: faSignature,
            link: 'example2/example1.1',
          },
          {
            itemType: 'link',
            label: 'Example 1.2',
            icon: faBuilding,
            link: 'example2/example1.2'
          },
          {
            itemType: 'link',
            label: 'Example 1.3',
            link: 'example2/example1.3'
          },
          {
            itemType: 'link',
            label: 'Example 1.4',
            // link: 'example2/example1.4'
          }
        ]
      },
      {
        itemType: 'basic',
        label: 'Example 3',
        icon: faCompass,
        badge: {
          text: '5'
        },
        children: [
          {
            itemType: 'link',
            label: 'Example 1.1',
            icon: faSignature,
            link: 'example3/example1.1',
          },
          {
            itemType: 'link',
            label: 'Example 1.2',
            icon: faBuilding,
            link: 'example3/example1.2'
          },
          {
            itemType: 'link',
            label: 'Example 1.3',
            link: 'example3/example1.3'
          },
          {
            itemType: 'link',
            label: 'Example 1.4',
            // link: 'example3/example1.4'
          },
          {
            itemType: 'basic',
            label: 'Example 3.2',
            icon: faCompass,
            children: [
              {
                itemType: 'link',
                label: 'Example 1.1',
                icon: faSignature,
                link: 'example3/ex2/example1.1',
              },
              {
                itemType: 'link',
                label: 'Example 1.2',
                icon: faBuilding,
                link: 'example3/ex2/example1.2'
              },
              {
                itemType: 'link',
                label: 'Example 1.3',
                link: 'example3/ex2/example1.3'
              },
              {
                itemType: 'link',
                label: 'Example 1.4',
                // link: 'example3/ex2/example1.4'
              },
              {
                itemType: 'link',
                label: 'Example 1.3',
                link: 'example3/ex2/example1.3'
              },
            ]
          },
          {
            itemType: 'link',
            label: 'Example 1.3',
            link: 'example3/example1.3'
          },
        ]
      },
      { itemType: 'divider' },
      {
        itemType: 'title',
        label: 'Extra'
      },
      {
        itemType: 'link',
        label: 'Example 4',
        icon: faSignature,
        link: 'example4'
      },
      {
        itemType: 'link',
        label: 'Example 5',
        icon: faBuilding,
        // link: 'example5'
      }
    ]
  },
  template: `
    <div class="d-flex flex-row vh-100">
      <div style="width: 260px;" class="h-100">
        <seam-side-nav [items]="items"></seam-side-nav>
      </div>

      <div class="p-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
