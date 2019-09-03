import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'

import { faBuilding, faSignature } from '@fortawesome/free-solid-svg-icons'

import { TheSeamSideNavModule } from './side-nav.module'

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}

storiesOf('Framework/SideNav', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        StoryRoutePlacholderComponent
      ],
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([
          { path: 'example1', component: StoryRoutePlacholderComponent },
          { path: 'example2', component: StoryRoutePlacholderComponent },
          { path: 'example3', component: StoryRoutePlacholderComponent }
        ], { useHash: true }),
        TheSeamSideNavModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ]
    },
    props: {
      navItems: [
        {
          label: 'Example 1',
          icon: faSignature,
          link: 'example1',
        },
        {
          label: 'Example 2',
          icon: faBuilding,
          link: 'example2',
          children: [
            {
              label: 'Example 1.1',
              icon: faSignature,
              link: 'example1.1',
            },
            {
              label: 'Example 1.2',
              icon: faBuilding,
              link: 'example1.2'
            },
            {
              label: 'Example 1.3',
              link: 'example1.3'
            },
            {
              label: 'Example 1.4',
              // link: 'example1.4'
            }
          ]
        },
        {
          label: 'Example 3',
          link: 'example3'
        },
        {
          label: 'Example 4',
          // link: 'example4'
        }
      ]
    },
    template: `
      <seam-side-nav [items]="navItems"></seam-side-nav>


      <div class="mt-4">
        <router-outlet></router-outlet>
      </div>
    `
  }))
