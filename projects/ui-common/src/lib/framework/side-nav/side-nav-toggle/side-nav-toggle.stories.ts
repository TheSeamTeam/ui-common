import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component, Directive, Input } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'

import { faBuilding, faCompass } from '@fortawesome/free-regular-svg-icons'
import { faSignature } from '@fortawesome/free-solid-svg-icons'

import { TheSeamSideNavModule } from '../side-nav.module'

storiesOf('Framework/SideNav/Toggle', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamSideNavModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
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
          <seam-side-nav-toggle
            >
          </seam-side-nav-toggle>
        </div>
      </div>
    `
  }))
