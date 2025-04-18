import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { APP_BASE_HREF } from '@angular/common'
import { Component, importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'

import { faBuilding, faCompass } from '@fortawesome/free-regular-svg-icons'
import { faSignature } from '@fortawesome/free-solid-svg-icons'
import { StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

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
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
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
        ),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    }),
    moduleMetadata({
      declarations: [
        StoryRoutePlacholderComponent
      ],
      imports: [
        RouterModule,
        TheSeamSideNavModule
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Basic: Story = args => ({
  applicationConfig: {
    providers: [
      importProvidersFrom(StoryInitialRouteModule.forRoot('/example3/ex2/example1.3')),
    ],
  },
  props: {
    items: [
      {
        itemType: 'link',
        label: 'Example 1',
        icon: faSignature,
        link: 'example1',
        activeNavigatable: true,
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
            link: 'example3/example1.3',
            activeNavigatable: true,
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
        <seam-side-nav [items]="items" [menuItemTooltipConfig]="{ behavior: 'collapseOnly', class: 'bg-danger' }"></seam-side-nav>
      </div>

      <div class="p-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})

export const Collapsed: Story = args => ({
  applicationConfig: {
    providers: [
      importProvidersFrom(StoryInitialRouteModule.forRoot('/example2')),
    ],
  },
  props: {
    items: [
      {
        itemType: 'link',
        label: 'Example 1',
        icon: faSignature,
        link: 'example1',
        badge: {
          text: '5',
          theme: 'info',
          // tooltip: 'ExampleToolTip'
          tooltip: {
            tooltip: 'Example Tooltip rergerge',
            container: 'body'
          }
        }
      },
      {
        itemType: 'link',
        label: 'Example 2',
        icon: faBuilding,
        link: 'example2',
        badge: {
          text: '5',
          theme: 'warning',
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
            link: 'example2/example1.3',
            badge: {
              text: '5',
              theme: 'info',
              // tooltip: 'ExampleToolTip'
              tooltip: {
                tooltip: 'Example Tooltip rergerge',
                container: 'body'
              }
            }
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
      <div class="h-100">
        <seam-side-nav [items]="items" [expanded]="false"></seam-side-nav>
      </div>

      <div class="p-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
