// import { boolean, text, withKnobs } from '@storybook/addon-knobs'
import { moduleMetadata } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faBell, faComment } from '@fortawesome/free-regular-svg-icons'
import { faExclamationTriangle, faQuestionCircle, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'

import { TheSeamTopBarComponent } from './top-bar.component'
import { TheSeamTopBarModule } from './top-bar.module'

export default {
  title: 'Framework/Top Bar',
  component: TheSeamTopBarComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
        ),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamTopBarModule,
      ],
    }),
    // withKnobs
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    }
  }
}

export const Basic = () => ({
  props: {
    // logo: text('logo', 'assets/images/theseam_logo.svg'),
    // logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
    // hasTitle: boolean('hasTitle', false),
    // titleText: text('titleText', 'Dashboard'),
    // subTitleText: text('subTitleText', 'Example'),
    faUserAlt,
    faQuestionCircle,
    faSignOutAlt,
    faBell,
    faExclamationTriangle,
    faComment
  },
  template: `
    <seam-top-bar #seamTopBar
      [logo]="logo"
      [logoSm]="logoSm"
      [hasTitle]="hasTitle"
      [titleText]="titleText"
      [subTitleText]="subTitleText">

      <ng-template seamTopBarMenuBtnDetail>
        <div>Mark Berry</div>
        <div>The Seam</div>
      </ng-template>

      <seam-menu seamTopBarMenu>
        <seam-menu-header class="px-2" *ngIf="seamTopBar?.isMobile$ | async">
          <div>Mark Berry</div>
          <div>The Seam</div>
        </seam-menu-header>
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
      <seam-menu #notificationMenu baseWidth="400">
        <a seamMenuItem [icon]="faExclamationTriangle" iconClass="text-warning" routerLink="/profile">
          There is a problem with your self-assessment answers.
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
      </seam-menu>
    </seam-top-bar>
  `
})

Basic.story = {
  name: 'Basic'
}

export const ExternalLink = () => ({
  props: {
    // logo: text('logo', 'assets/images/theseam_logo.svg'),
    // logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
    // hasTitle: boolean('hasTitle', false),
    // titleText: text('titleText', 'Dashboard'),
    // subTitleText: text('subTitleText', 'Example'),
    logoHref: 'https://www.trustuscotton.org/',
    faUserAlt,
    faQuestionCircle,
    faSignOutAlt,
    faBell,
    faExclamationTriangle,
    faComment
  },
  template: `
    <seam-top-bar #seamTopBar
      [logo]="logo"
      [logoSm]="logoSm"
      [hasTitle]="hasTitle"
      [titleText]="titleText"
      [subTitleText]="subTitleText"
      [logoHref]="logoHref">

      <ng-template seamTopBarMenuBtnDetail>
        <div>Mark Berry</div>
        <div>The Seam</div>
      </ng-template>

      <seam-menu seamTopBarMenu>
        <seam-menu-header class="px-2" *ngIf="seamTopBar?.isMobile$ | async">
          <div>Mark Berry</div>
          <div>The Seam</div>
        </seam-menu-header>
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
      <seam-menu #notificationMenu baseWidth="400">
        <a seamMenuItem [icon]="faExclamationTriangle" iconClass="text-warning" routerLink="/profile">
          There is a problem with your self-assessment answers.
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
      </seam-menu>
    </seam-top-bar>
  `
})

ExternalLink.story = {
  name: 'External Link'
}
