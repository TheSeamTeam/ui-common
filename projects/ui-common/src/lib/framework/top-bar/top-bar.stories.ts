import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faBell, faComment } from '@fortawesome/free-regular-svg-icons'
import { faExclamationTriangle, faQuestionCircle, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'

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
      originalDisplayName: text('originalDisplayName', 'Leslie Knope'),
      faUserAlt,
      faQuestionCircle,
      faSignOutAlt,
      faBell,
      faExclamationTriangle,
      faComment
    },
    template: `
      <seam-top-bar
        [logo]="logo"
        [logoSm]="logoSm"
        [titleText]="titleText"
        [subTitleText]="subTitleText"
        [displayName]="displayName"
        [organizationName]="organizationName"
        [originalDisplayName]="originalDisplayName">
        <seam-menu seamTopBarMenu>
          <a seamMenuItem [icon]="faUserAlt" routerLink="/profile">Profile</a>
          <button seamMenuItem [icon]="faQuestionCircle">About</button>
          <seam-menu-divider></seam-menu-divider>
          <a seamMenuItem [icon]="faSignOutAlt" routerLink="/logout">Sign out</a>
        </seam-menu>

        <button seamIconBtn *seamTopBarItem
          [icon]="faBell"
          iconType="borderless-styled-square"
          [seamMenuToggle]="notificationMenu">
          <span class="sr-only">Notifications</span>
          <seam-icon-notification iconClass="text-danger"></seam-icon-notification>
        </button>
        <seam-menu #notificationMenu>
          <div style="width: 400px">
            <a seamMenuItem [icon]="faExclamationTriangle" iconClass="text-warning" routerLink="/profile">
              There is a problem with you self-assessment answers.
            </a>
            <a seamMenuItem [icon]="faExclamationTriangle" iconClass="text-warning" routerLink="/profile">
              Your password expires in 10 days.
            </a>
            <button seamMenuItem [icon]="faComment" iconClass="text-primary">
              You have unread feedback on your document.
            </button>
            <seam-menu-footer>
              <a seamMenuFooterAction routerLink="/notifications">See All</a>
            </seam-menu-footer>
          </div>
        </seam-menu>
      </seam-top-bar>
    `
  }))
