import { Meta, moduleMetadata } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { APP_BASE_HREF } from '@angular/common'
import { APP_INITIALIZER, Component, Directive, Inject, importProvidersFrom, inject } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { NavigationEnd, NavigationSkipped, Route, Router, RouterModule, RouterOutlet } from '@angular/router'
import { BehaviorSubject, from, interval, Observable, of, Subject } from 'rxjs'
import { delay, filter, map, shareReplay, startWith, takeUntil, tap } from 'rxjs/operators'

import {
  faBell,
  faComment
} from '@fortawesome/free-regular-svg-icons'
import {
  faBook,
  faBuilding,
  faExclamationTriangle,
  faQuestionCircle,
  faSignature,
  faSignOutAlt,
  faUserAlt,
  faWrench
} from '@fortawesome/free-solid-svg-icons'

import { TheSeamBreadcrumbsModule } from '@theseam/ui-common/breadcrumbs'
import { TheSeamWidgetModule } from '@theseam/ui-common/widget'
import { provideNavigationReload } from '@theseam/ui-common/navigation-reload'

import { TheSeamDashboardModule } from '../dashboard/dashboard.module'
import { ISideNavItem } from '../side-nav/side-nav.models'
import { TheSeamSideNavModule } from '../side-nav/side-nav.module'
import { TheSeamTopBarModule } from '../top-bar/top-bar.module'

import { TheSeamBaseLayoutComponent } from './base-layout.component'
import { TheSeamBaseLayoutModule } from './base-layout.module'
import { THESEAM_SIDE_NAV_CONFIG } from '../side-nav'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-1',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 1" [hasConfig]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 1</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`,
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

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`,
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
</seam-widget>`,
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

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`,
})
class StoryExWidget4Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  selector: 'story-ex-dashboard',
  template: `
    <seam-dashboard
      [widgets]="widgets"
      [widgetsDraggable]="widgetsDraggable">
    </seam-dashboard>`,
  standalone: true,
  imports: [
    TheSeamDashboardModule,
  ],
})
class StoryExDashboardComponent {
  widgets = [
    { widgetId: 'widget-1', col: 0, order: 0, component: StoryExWidget1Component },
    { widgetId: 'widget-2', col: 1, order: 0, component: StoryExWidget2Component },
    { widgetId: 'widget-3', col: 2, order: 0, component: StoryExWidget3Component },
    { widgetId: 'widget-4', col: 1, order: 1, component: StoryExWidget4Component }
  ]
  widgetsDraggable = true
}

// @Component({ template: `Url: {{ router.url }}` })
// class StoryRoutePlacholderComponent {
//   constructor(public router: Router) { }
// }

@Component({
  template: `Url: {{ router.url }} [{{ countDown$ | async }}]`,
})
class StoryRoutePlacholderComponent {
  countDown$ = interval(1000).pipe(
    map(v => v + 1),
    startWith(0),
  )
  constructor(public router: Router) {
    // console.log('StoryRoutePlacholderComponent')
  }
  // ngOnInit() {
  //   console.log('StoryRoutePlacholderComponent ngOnInit')
  // }
}

const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
  {
    path: '',
    data: { breadcrumb: 'Dashboard' },
    children: [
      { path: 'example1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1' } },
      {
        path: 'dashboard',
        // component: StoryRoutePlacholderComponent,
        component: StoryExDashboardComponent,
      },
      {
        path: 'example2',
        component: StoryRoutePlacholderComponent,
        data: { breadcrumb: 'example2' },
        children: [
          { path: 'example2.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.1' } },
          { path: 'example2.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.2' } },
          { path: 'example2.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.3' } },
          { path: 'example2.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.4' } }
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
    ],
  },
]

const navItems: ISideNavItem[] = [
  {
    itemType: 'link',
    label: 'Example 1',
    icon: faSignature,
    link: 'example1',
    badge: {
      text: '5',
      theme: 'warning',
      tooltip: {
        tooltip: 'Example Tooltip',
        container: 'body'
      }
    },
    activeNavigatable: false,
  },
  {
    itemType: 'link',
    label: 'Example 2',
    icon: faBuilding,
    link: 'example2',
    children: [
      {
        itemType: 'link',
        label: 'Example 2.1',
        icon: faSignature,
        link: 'example2/example2.1',
      },
      {
        itemType: 'link',
        label: 'Example 2.2',
        icon: faBuilding,
        link: 'example2/example2.2'
      },
      {
        itemType: 'link',
        label: 'Example 2.3',
        // link: 'example2/example2.3?dtf=claimable',
        link: 'example2/example2.3',
        queryParams: {
          dtf: 'claimable'
        },
      },
      {
        itemType: 'link',
        label: 'Example 2.4',
        // link: 'example2/example2.4'
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

export default {
  title: 'Framework/Base Layout',
  component: TheSeamBaseLayoutComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot(routes, {
            useHash: true,
            // onSameUrlNavigation: 'reload',
          }),
        ),
        { provide: APP_BASE_HREF, useValue: '/' },
        {
          provide: THESEAM_SIDE_NAV_CONFIG,
          useValue: {
            activeNavigatable: true,
          },
        },
        // {
        //   provide: APP_INITIALIZER,
        //   useFactory: idleFactory,
        //   deps: [ Router ],
        // },
        provideNavigationReload({ dummyUrl: '/' }),
      ],
    }),
    moduleMetadata({
      declarations: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
        StoryRoutePlacholderComponent,
        // RouterOutletStub,
      ],
      imports: [
        TheSeamBaseLayoutModule,
        TheSeamDashboardModule,
        TheSeamSideNavModule,
        TheSeamTopBarModule,
        TheSeamWidgetModule,
        TheSeamBreadcrumbsModule,
      ],
      entryComponents: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
      ]
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Basic = () => ({
  props: {
    // logo: text('logo', 'assets/images/theseam_logo.svg'),
    // logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
    // hasTitle: boolean('hasTitle', false),
    // titleText: text('titleText', 'Dashboard'),
    // subTitleText: text('subTitleText', 'Example'),
    navItems,
    widgets: [
      { widgetId: 'widget-1', col: 0, order: 0, component: StoryExWidget1Component },
      { widgetId: 'widget-2', col: 1, order: 0, component: StoryExWidget2Component },
      { widgetId: 'widget-3', col: 2, order: 0, component: StoryExWidget3Component },
      { widgetId: 'widget-4', col: 1, order: 1, component: StoryExWidget4Component },
    ],
    faUserAlt,
    faQuestionCircle,
    faSignOutAlt,
    faBell,
    faExclamationTriangle,
    faComment,
    // widgetsDraggable: boolean('widgetsDraggable', true),
  },
  template: `
    <div style="height: 100vh; width: 100vw;">
      <seam-base-layout>
        <seam-side-nav
          *seamBaseLayoutSideBar
          [items]="navItems">
        </seam-side-nav>
        <div *seamBaseLayoutContentHeader>
          <seam-breadcrumbs class="flex-grow-1"></seam-breadcrumbs>
        </div>
        <seam-top-bar
          *seamBaseLayoutTopBar
          [logo]="logo"
          [logoSm]="logoSm"
          [hasTitle]="hasTitle"
          [titleText]="titleText"
          [subTitleText]="subTitleText">
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
        <div *seamBaseLayoutContent class="h-100">
          <router-outlet [seamRouterOutletReload]></router-outlet>
          <!--<seam-router-outlet-reload></seam-router-outlet-reload>-->
        </div>
      </seam-base-layout>
    </div>
  `,
})
