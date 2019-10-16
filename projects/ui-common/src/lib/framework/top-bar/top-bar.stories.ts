import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faQuestionCircle, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'

import { TheSeamTopBarModule } from './top-bar.module'

storiesOf('Framework|TopBar', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        TheSeamTopBarModule,
        RouterModule.forRoot([], { useHash: true })
      ]
    },
    props: {
      logo: text('logo', 'assets/images/theseam_logo.svg'),
      logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
      titleText: text('titleText', 'Dashboard'),
      subTitleText: text('subTitleText', 'Example'),
      displayName: text('displayName', 'Mark Berry'),
      organizationName: text('organizationName', 'The Seam'),
      faUserAlt,
      faQuestionCircle,
      faSignOutAlt
    },
    template: `
      <seam-top-bar
        [logo]="logo"
        [logoSm]="logoSm"
        [titleText]="titleText"
        [subTitleText]="subTitleText"
        [displayName]="displayName"
        [organizationName]="organizationName">
        <seam-menu seamTopBarMenu>
          <a seamMenuItem [icon]="faUserAlt" routerLink="/profile">Profile</a>
          <button seamMenuItem [icon]="faQuestionCircle">About</button>
          <seam-menu-divider></seam-menu-divider>
          <a seamMenuItem [icon]="faSignOutAlt" routerLink="/logout">Sign out</a>
        </seam-menu>
      </seam-top-bar>
    `
  }))
