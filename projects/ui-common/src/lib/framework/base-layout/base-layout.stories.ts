import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Route, Router, RouterModule } from '@angular/router'
import { of } from 'rxjs'
import { delay } from 'rxjs/operators'

import {
  faBell,
  faBook,
  faBuilding,
  faQuestionCircle,
  faSignature,
  faSignOutAlt,
  faUserAlt,
  faWrench
} from '@fortawesome/free-solid-svg-icons'

import { TheSeamBreadcrumbsModule } from '../../breadcrumbs/index'
import { TheSeamWidgetModule } from '../../widget/index'
import { TheSeamDashboardModule } from '../dashboard/dashboard.module'
import { ISideNavItem } from '../side-nav/side-nav.models'
import { TheSeamSideNavModule } from '../side-nav/side-nav.module'
import { TheSeamTopBarModule } from '../top-bar/top-bar.module'

import { TheSeamBaseLayoutModule } from './base-layout.module'


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-1',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 1" [hasConfig]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 1</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'MM-dd-yyyy h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`
})
class StoryExWidget1Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-2',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 2" [hasConfig]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 2</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'MM-dd-yyyy h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`
})
class StoryExWidget2Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-3',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 3" [hasConfig]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 3</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items.slice(0, 2)" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <a seam-widget-footer-link routerLink="/example1">See All</a>
</seam-widget>`
})
class StoryExWidget3Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-4',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 4" [hasConfig]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 4</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'MM-dd-yyyy h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`
})
class StoryExWidget4Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}


const routes: Route[] = [
  {
    path: '',
    data: { breadcrumb: 'Dashboard' },
    children: [
      { path: 'example1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1' } },
      {
        path: 'example2',
        component: StoryRoutePlacholderComponent,
        data: { breadcrumb: 'example2' },
        children: [
          { path: 'example1.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.1' } },
          { path: 'example1.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.2' } },
          { path: 'example1.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.3' } },
          { path: 'example1.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.4' } }
        ]
      },
      {
        path: 'example3',
        component: StoryRoutePlacholderComponent,
        data: { breadcrumb: 'example3' },
        children: [
          { path: 'example1.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.1' } },
          { path: 'example1.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.2' } },
          { path: 'example1.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.3' } },
          { path: 'example1.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.4' } }
        ]
      },
      { path: 'example4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example4' } },
      { path: 'example5', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example5' } }
    ]
  }
]

const navItems: ISideNavItem[] = [
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
    icon: faBook,
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
      }
    ]
  },
  {
    itemType: 'link',
    label: 'Example 4',
    link: 'example4'
  },
  {
    itemType: 'link',
    label: 'Example 5',
    // link: 'example5'
  }
]

storiesOf('Framework|BaseLayout', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
        StoryRoutePlacholderComponent
      ],
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        TheSeamBaseLayoutModule,
        TheSeamDashboardModule,
        TheSeamSideNavModule,
        TheSeamTopBarModule,
        TheSeamWidgetModule,
        TheSeamBreadcrumbsModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
      entryComponents: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component
      ]
    },
    props: {
      logo: text('logo', 'assets/images/theseam_logo.svg'),
      logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
      hasTitle: boolean('hasTitle', false),
      titleText: text('titleText', 'Dashboard'),
      subTitleText: text('subTitleText', 'Example'),
      displayName: text('displayName', 'Mark Berry'),
      organizationName: text('organizationName', 'The Seam'),
      hasNotificationsMenu: boolean('hasNotificationsMenu', true),
      navItems,
      widgets: [
        { col: 1, order: 0, type: StoryExWidget1Component },
        { col: 2, order: 0, type: StoryExWidget2Component },
        { col: 3, order: 0, type: StoryExWidget3Component },
        { col: 2, order: 1, type: StoryExWidget4Component }
      ],
      faUserAlt: faUserAlt,
      faQuestionCircle: faQuestionCircle,
      faSignOutAlt: faSignOutAlt
    },
    template: `
      <div style="height: 100vh; width: 100vw;">
        <seam-base-layout>
          <seam-side-nav
            *seamBaseLayoutSideBar
            [items]="navItems">
          </seam-side-nav>
          <div class="p-1" *seamBaseLayoutContentHeader>
            <seam-breadcrumbs></seam-breadcrumbs>
          </div>
          <seam-top-bar
            *seamBaseLayoutTopBar
            [logo]="logo"
            [logoSm]="logoSm"
            [hasTitle]="hasTitle"
            [titleText]="titleText"
            [subTitleText]="subTitleText"
            [displayName]="displayName"
            [organizationName]="organizationName"
            [hasNotificationsMenu]="hasNotificationsMenu">
            <seam-menu seamTopBarMenu>
              <a seamMenuItem [icon]="faUserAlt" routerLink="/profile">Profile</a>
              <button seamMenuItem [icon]="faQuestionCircle">About</button>
              <seam-menu-divider></seam-menu-divider>
              <a seamMenuItem [icon]="faSignOutAlt" routerLink="/logout">Sign out</a>
            </seam-menu>
          </seam-top-bar>
          <seam-dashboard
            *seamBaseLayoutContent
            [widgets]="widgets">
          </seam-dashboard>
        </seam-base-layout>
      </div>
    `
  }))
