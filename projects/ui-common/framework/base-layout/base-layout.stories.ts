import { Meta, moduleMetadata } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { APP_BASE_HREF } from '@angular/common'
import { Component, Inject, importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { NavigationEnd, Route, Router, RouterModule } from '@angular/router'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { delay, filter, map, shareReplay, tap } from 'rxjs/operators'

import {
  faBell,
  faCalendar,
  faComment
} from '@fortawesome/free-regular-svg-icons'
import {
  faAngleDown,
  faBook,
  faBuilding,
  faExclamationTriangle,
  faQuestionCircle,
  faSignature,
  faSignOutAlt,
  faTimes,
  faUserAlt,
  faWrench
} from '@fortawesome/free-solid-svg-icons'

import { TheSeamBreadcrumbsModule } from '@theseam/ui-common/breadcrumbs'
import { TheSeamWidgetModule } from '@theseam/ui-common/widget'

import { TheSeamDashboardModule } from '../dashboard/dashboard.module'
import { ISideNavItem } from '../side-nav/side-nav.models'
import { TheSeamSideNavModule } from '../side-nav/side-nav.module'
import { TheSeamTopBarModule } from '../top-bar/top-bar.module'

import { Optional } from '@angular/core'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLayoutService } from '@theseam/ui-common/layout'
import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'
import { notNullOrUndefined } from '@theseam/ui-common/utils'
import {
  horizontalNavItemHasChildren,
  INavItem,
  NavItemExpandedEvent,
  TheSeamNavModule
} from '../nav'
import { TheSeamNavService } from '../nav/nav.service'
import type { ITheSeamBaseLayoutRef } from './base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from './base-layout-tokens'
import { TheSeamBaseLayoutComponent } from './base-layout.component'
import { TheSeamBaseLayoutModule } from './base-layout.module'

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

@Component({ template: `Url: {{ router.url }}` })
class StoryRoutePlacholderComponent {
  constructor(public router: Router) { }
}

const routes: Route[] = [
  {
    path: '',
    data: { breadcrumb: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        component: StoryRoutePlacholderComponent,
      },
      {
        path: 'example1',
        component: StoryRoutePlacholderComponent,
        data: { breadcrumb: 'example1' },
        children: [
          { path: 'example1.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.1' } },
          { path: 'example1.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.2' } },
          { path: 'example1.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.3' } },
          { path: 'example1.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example1.4' } }
        ]
      },
      {
        path: 'example2',
        component: StoryRoutePlacholderComponent,
        data: { breadcrumb: 'example2' },
        children: [
          { path: 'example2.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.1' } },
          {
            path: 'example2.2',
            component: StoryRoutePlacholderComponent,
            data: { breadcrumb: 'example2.2' },
            children: [
              { path: 'example2.2.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.1' } },
              {
                path: 'example2.2.2',
                component: StoryRoutePlacholderComponent,
                data: { breadcrumb: 'example2.2.2' },
                children: [
                  { path: 'example2.2.2.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.2.2.1' } },
                  { path: 'example2.2.2.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.2.2.2' } },
                  { path: 'example2.2.2.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.2.2.3' } },
                  { path: 'example2.2.2.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.2.2.4' } }
                ]
              },
              { path: 'example2.2.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.3' } },
            ]
          },
          {
            path: 'example2.3',
            component: StoryRoutePlacholderComponent,
            data: { breadcrumb: 'example2.3' },
            children: [
              { path: 'example2.3.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.1' } },
              {
                path: 'example2.3.2',
                component: StoryRoutePlacholderComponent,
                data: { breadcrumb: 'example2.3.2' },
                children: [
                  { path: 'example2.3.2.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.3.2.1' } },
                  { path: 'example2.3.2.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.3.2.2' } },
                  { path: 'example2.3.2.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.3.2.3' } },
                ]
              },
              { path: 'example2.3.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.3' } },
            ]
          },
          { path: 'example2.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example2.4' } }
        ]
      },
      {
        path: 'example3',
        component: StoryRoutePlacholderComponent,
        data: { breadcrumb: 'example3' },
        children: [
          { path: 'example3.1', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example3.1' } },
          { path: 'example3.2', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example3.2' } },
          { path: 'example3.3', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example3.3' } },
          { path: 'example3.4', component: StoryRoutePlacholderComponent, data: { breadcrumb: 'example3.4' } }
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
    badge: {
      text: '5',
      theme: 'warning',
      tooltip: {
        tooltip: 'Example Tooltip',
        container: 'body'
      }
    },
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
        badge: {
          text: '5',
          theme: 'danger',
          tooltip: {
            tooltip: 'Example 2.1 Tooltip',
            container: 'body'
          }
        }
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
        link: 'example2/example2.3'
      },
      {
        itemType: 'link',
        label: 'Example 2.4',
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
        label: 'Example 3.1',
        icon: faSignature,
        link: 'example3/example3.1',
      },
      {
        itemType: 'link',
        label: 'Example 3.2',
        icon: faBuilding,
        link: 'example3/example3.2'
      },
      {
        itemType: 'link',
        label: 'Example 3.3',
        link: 'example3/example3.3'
      },
      {
        itemType: 'link',
        label: 'Example 3.4',
        // link: 'example3/example3.4'
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

const horizontalNavItems: INavItem[] = [
  {
    itemType: 'link',
    label: 'Dashboard',
    link: 'dashboard'
  },
  {
    itemType: 'link',
    label: 'Example 1',
    link: 'example1',
    children: [
      {
        itemType: 'link',
        label: 'Example 1.1',
        link: 'example1/example1.1',
      },
      {
        itemType: 'link',
        label: 'Example 1.2',
        link: 'example1/example1.2',
        badge: {
          text: '5',
          theme: 'danger',
          // tooltip: 'ExampleToolTip'
          tooltip: {
            tooltip: 'Example 1.2 Tooltip',
            container: 'body'
          }
        }
      },
      {
        itemType: 'link',
        label: 'Example 1.3',
        link: 'example1/example1.3',
      },
      {
        itemType: 'link',
        label: 'Example 1.4',
      }
    ]
  },
  {
    itemType: 'link',
    label: 'Example 2',
    link: 'example2',
    children: [
      {
        itemType: 'link',
        label: 'Example 2.1',
        link: 'example2/example2.1',
      },
      {
        itemType: 'link',
        label: 'Example 2.2',
        link: 'example2/example2.2',
        children: [
          {
            itemType: 'link',
            label: 'Example 2.2.1',
            link: 'example2/example2.2/example2.2.1',
          },
          {
            itemType: 'basic',
            label: 'Example 2.2.2',
            // link: 'example2/example2.2/example2.2.2',
            children: [
              {
                itemType: 'link',
                label: 'Example 2.2.2.1',
                link: 'example2/example2.2/example2.2.2/example2.2.2.1',
              },
              {
                itemType: 'link',
                label: 'Example 2.2.2.2',
                link: 'example2/example2.2/example2.2.2/example2.2.2.2',
              },
              {
                itemType: 'link',
                label: 'Example 2.2.2.3',
                link: 'example2/example2.2/example2.2.2/example2.2.2.3',
              },
            ]
          },
          {
            itemType: 'link',
            label: 'Example 2.2.3',
            link: 'example2/example2.2/example2.2.3',
          },
        ]
      },
      {
        itemType: 'basic',
        label: 'Example 2.3',
        children: [
          {
            itemType: 'link',
            label: 'Example 2.3.1',
            link: 'example2/example2.3/example2.3.1',
          },
          {
            itemType: 'link',
            label: 'Example 2.3.2',
            link: 'example2/example2.3/example2.3.2',
            children: [
              {
                itemType: 'link',
                label: 'Example 2.3.2.1',
                link: 'example2/example2.3/example2.3.2/example2.3.2.1',
              },
              {
                itemType: 'link',
                label: 'Example 2.3.2.2',
                link: 'example2/example2.3/example2.3.2/example2.3.2.2',
              },
              {
                itemType: 'link',
                label: 'Example 2.3.2.3',
                link: 'example2/example2.3/example2.3.2/example2.3.2.3',
              },
            ]
          },
          {
            itemType: 'link',
            label: 'Example 2.3.3',
            link: 'example2/example2.3/example2.3.3',
          },
        ]
      },
      {
        itemType: 'link',
        label: 'Example 2.4',
      }
    ]
  },
  {
    itemType: 'basic',
    label: 'Example 3',
    children: [
      {
        itemType: 'link',
        label: 'Example 3.1',
        link: 'example3/example3.1',
      },
      {
        itemType: 'link',
        label: 'Example 3.2',
        link: 'example3/example3.2',
      },
      {
        itemType: 'link',
        label: 'Example 3.3',
        link: 'example3/example3.3',
      },
      {
        itemType: 'link',
        label: 'Example 3.4',
      }
    ]
  },
  { itemType: 'divider' },
  {
    itemType: 'link',
    label: 'Example 4',
    link: 'example4'
  },
  {
    itemType: 'link',
    label: 'Example 5',
    link: 'example5'
  }
]

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-base-layout',
  styles: [`
    :host::ng-deep .top-bar-items--left {
       flex-grow: 1;
       align-items: stretch;
    }

    :host::ng-deep .base-layout-top-bar-container {
      box-shadow: 0 0 6px gray;
    }

    :host .app-mobile::ng-deep .base-layout-top-bar-container {
      height: 58px;
    }

    .profile-button {
      width: 35px;
      height: 35px;
      background-color: white;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 100%;
      border: 2px solid #357ebd;
      padding: 0;

    }

    :host::ng-deep .seam-nav-item--focused {
      border-bottom: 1px solid #357ebd;
    }

    :host::ng-deep .base-layout-content-container-footer .profile-button {
      border-color: white;
    }

    :host::ng-deep .base-layout-side-bar-nav-content-mobile {
      top: 58px;
    }

    :host .app-mobileNav::ng-deep .base-layout-side-bar-nav-content-mobile {
      bottom: 49px;
    }

    :host::ng-deep .base-layout-nav-toggle {
      padding: 0;
      margin: 0 .5rem;
    }

    :host .app-mobileNav::ng-deep .base-layout-nav-toggle {
      margin-right: 0;
    }

    :host::ng-deep .base-layout-nav-toggle .mobile-nav-bars {
      position: relative;
      width: 35px;
      height: 28px;
    }

    :host::ng-deep .base-layout-nav-toggle .mobile-nav-bar {
      position: absolute;
      left: 0;
      width: 35px;
      height: 5px;
      border-radius: 5px;
      background: #357ebd;
      transition: .3s;
    }
    :host::ng-deep .base-layout-nav-toggle .mobile-nav-bar.mobile-nav-bar__top {
      top: 0;
      transform-origin: top left;
    }
    :host::ng-deep .base-layout-nav-toggle .mobile-nav-bar.mobile-nav-bar__middle {
      top: calc(50% - 2.5px);
    }
    :host::ng-deep .base-layout-nav-toggle .mobile-nav-bar.mobile-nav-bar__bottom {
      bottom: 0;
      transform-origin: bottom left;
    }

    :host::ng-deep .base-layout-nav-toggle.base-layout-nav-toggle--expanded .mobile-nav-bar__top {
      transform: translateX(6px) rotate(45deg);
    }
    :host::ng-deep .base-layout-nav-toggle.base-layout-nav-toggle--expanded .mobile-nav-bar__middle {
      opacity: 0;
    }
    :host::ng-deep .base-layout-nav-toggle.base-layout-nav-toggle--expanded .mobile-nav-bar__bottom {
      transform: translateX(6px) rotate(-45deg);
    }`
  ],
  template: `<div style="height: 100vh; width: 100vw;" [class.app-desktop]="!(isMobile$ | async)" [class.app-mobile]="isMobile$ | async" [class.app-mobileNav]="isMobileNav$ | async">
    <seam-base-layout [showSidebar]="false" mobileBreakpoint="lt-md">
      <seam-top-bar
        *seamBaseLayoutTopBar
        [logo]="logo"
        [hasTitle]="hasTitle"
        [titleText]="titleText"
        [subTitleText]="subTitleText"
        [hasTopBarMenuButton]="!(isMobileNav$ | async)"
        [navToggleAlign]="navToggleAlign$ | async">
        <seam-menu seamTopBarMenu>
          <a seamMenuItem [icon]="faUserAlt" routerLink="/profile">Profile</a>
          <button seamMenuItem [icon]="faQuestionCircle">About</button>
          <seam-menu-divider></seam-menu-divider>
          <a seamMenuItem [icon]="faSignOutAlt" routerLink="/logout">Sign out</a>
        </seam-menu>

        <ng-container *ngIf="!(isMobile$ | async)">
          <div class="w-100 top-bar-nav-wrapper"
            *seamTopBarItem="'left'"
            [seamOverlayScrollbar]="{ overflowBehavior: { x: 'scroll', y: 'hidden' } }">
            <seam-horizontal-nav
              [items]="horizontalNavItems"
              [hierLevel]="1"
              childAction="none"
              expandAction="expandOnly"
              class="ml-2"
              (navItemExpanded)="_navItemExpanded($event)">
            </seam-horizontal-nav>
          </div>
        </ng-container>

        <ng-container *ngIf="!(isMobileNav$ | async)">
          <button *seamTopBarItem
            seamIconBtn
            [icon]="faBell"
            iconType="borderless-styled-square"
            [seamMenuToggle]="notificationMenu">
            <span class="sr-only">Notifications</span>
            <seam-icon-notification iconClass="text-danger"></seam-icon-notification>
          </button>
        </ng-container>

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

        <ng-container *seamTopBarMenuBtnDetail>
          <div class="d-flex align-items-center">
            <div class="profile-button mr-2" style="background-image: url({{ logoSm }});"></div>
            Test User 1
          </div>
        </ng-container>

        <ng-container *seamTopBarCompactMenuBtnDetail>
          <div class="profile-button" style="background-image: url({{ logoSm }});"></div>
        </ng-container>

        <ng-container *seamTopBarNavToggleBtnDetail>
          <div class="mobile-nav-bars">
            <span class="mobile-nav-bar mobile-nav-bar__top"></span>
            <span class="mobile-nav-bar mobile-nav-bar__middle"></span>
            <span class="mobile-nav-bar mobile-nav-bar__bottom"></span>
          </div>
        </ng-container>

      </seam-top-bar>
      <div *seamBaseLayoutContentHeader class="d-flex justify-content-between h-100 overflow-hidden">
        <ng-container *ngIf="!(isMobile$ | async)">
          <div class="w-100 h-100"
            [seamOverlayScrollbar]="{ overflowBehavior: { x: 'scroll', y: 'hidden' } }">
            <seam-horizontal-nav
              [items]="levelTwoItems$ | async"
              [hierLevel]="2">
            </seam-horizontal-nav>
          </div>
        </ng-container>
        <ng-container *ngIf="!(isMobileNav$ | async)">
          <seam-menu #cropYearMenu>
            <button seamMenuItem (click)="_setActiveCropYear(2020)">2020</button>
            <button seamMenuItem (click)="_setActiveCropYear(2021)">2021</button>
            <button seamMenuItem (click)="_setActiveCropYear(2022)">2022</button>
            <button seamMenuItem (click)="_setActiveCropYear(2023)">2023</button>
          </seam-menu>
          <button type="button" class="d-flex align-items-center mr-2 btn border-none text-decoration-none py-0" [seamMenuToggle]="cropYearMenu">
            {{ activeCropYear$ | async }}
            <div class="pl-2 d-flex flex-column">
              <seam-icon class="d-block" [icon]="faAngleDown"></seam-icon>
            </div>
          </button>
        </ng-container>
      </div>
      <seam-side-nav
        *seamBaseLayoutSideBar
        [items]="horizontalNavItems"
        [hasHeaderToggle]="false"
        [hideEmptyIcon]="true"
        [expandOrigin]="expandOrigin$ | async"
        [expandWidth]="expandWidth$ | async"
        [toggleIcon]="faTimes"
        indentSize="0">
        <div class="p-2" *seamBaseLayoutSideBarHeader>
          <img [src]="logo" height="40px">
        </div>
        <ng-container *seamBaseLayoutSideBarFooter>
          <div class="bg-white py-1 px-2 border-top" *ngIf="isMobileNav$ | async">
            <span>Copyright &copy; 2021
              <a href="https://www.theseam.com" target="_blank">
                The Seam, LLC
              </a>
            </span>
          </div>
        </ng-container>
      </seam-side-nav>

      <seam-dashboard
        *seamBaseLayoutContent
        [widgets]="widgets"
        [widgetsDraggable]="widgetsDraggable">
      </seam-dashboard>

      <div *seamBaseLayoutContentFooter>
        <div class="bg-white py-1 px-2 border-top" *ngIf="!(isMobileNav$ | async); else mobileFooter">
          <span>Copyright &copy; 2021
            <a href="https://www.theseam.com" target="_blank">
              The Seam, LLC
            </a>
          </span>
        </div>
        <ng-template #mobileFooter>
          <div class="bg-primary py-1 px-2 d-flex align-items-center justify-content-around">
            <button
              seamButton
              type="button"
              class="btn"
              [seamMenuToggle]="cropYearMenu">
              {{ activeCropYear$ | async }}
            </button>
            <seam-menu baseWidth="600" #cropYearMenu>
              <button seamMenuItem (click)="_setActiveCropYear(2020)">2020</button>
              <button seamMenuItem (click)="_setActiveCropYear(2021)">2021</button>
              <button seamMenuItem (click)="_setActiveCropYear(2022)">2022</button>
              <button seamMenuItem (click)="_setActiveCropYear(2023)">2023</button>
            </seam-menu>

            <button class="profile-button"
              seamButton
              [seamMenuToggle]="seamTopBarMenu"
              style="background-image: url({{ logoSm }});">
              <span class="sr-only">Profile</span>
            </button>
            <seam-menu baseWidth="600" #seamTopBarMenu>
              <a seamMenuItem [icon]="faUserAlt" routerLink="/profile">Profile</a>
              <button seamMenuItem [icon]="faQuestionCircle">About</button>
              <seam-menu-divider></seam-menu-divider>
              <a seamMenuItem [icon]="faSignOutAlt" routerLink="/logout">Sign out</a>
            </seam-menu>

            <button
              seamIconBtn
              [icon]="faBell"
              iconType="borderless-styled-square"
              [seamMenuToggle]="notificationMenu">
              <span class="sr-only">Notifications</span>
              <seam-icon-notification iconClass="text-danger"></seam-icon-notification>
            </button>
            <seam-menu baseWidth="600" #notificationMenu>
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
            </seam-menu>
          </div>
        </ng-template>

      </div>
    </seam-base-layout>
  </div>`
})
class StoryExBaseLayoutComponent {
  faUserAlt = faUserAlt
  faQuestionCircle = faQuestionCircle
  faSignOutAlt = faSignOutAlt
  faBell = faBell
  faExclamationTriangle = faExclamationTriangle
  faComment = faComment
  faAngleDown = faAngleDown
  faCalendar = faCalendar
  faTimes = faTimes

  horizontalNavItems = horizontalNavItems

  logo = 'assets/images/theseam_logo.svg'
  logoSm = 'assets/images/theseam_logo_notext.svg'

  widgets = [
    { widgetId: 'widget-1', col: 0, order: 0, component: StoryExWidget1Component },
    { widgetId: 'widget-2', col: 1, order: 0, component: StoryExWidget2Component },
    { widgetId: 'widget-3', col: 2, order: 0, component: StoryExWidget3Component },
    { widgetId: 'widget-4', col: 1, order: 1, component: StoryExWidget4Component }
  ]

  public levelTwoItems$: Observable<INavItem[]>

  private _activeCropYear = new BehaviorSubject<number>(2020)
  public activeCropYear$ = this._activeCropYear.asObservable()

  public isMobile$: Observable<boolean>
  public isMobileNav$: Observable<boolean>

  public expandOrigin$: Observable<string>
  public expandWidth$: Observable<string>
  public navToggleAlign$: Observable<string>

  public _focusedItem = new BehaviorSubject<INavItem | null | undefined>(undefined)
  public focusedItem$ = this._focusedItem.asObservable()

  constructor(
    private readonly _layout: TheSeamLayoutService,
    private readonly _router: Router,
    private readonly _nav: TheSeamNavService,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) _baseLayout: ITheSeamBaseLayoutRef
  ) {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(event => {
      _baseLayout?.registeredNav?.collapse()
      this._focusActiveItem()
    })

    this.isMobile$ = this._layout.isMobile$

    this.isMobileNav$ = this._layout.observe('lt-sm')

    this.expandOrigin$ = this.isMobileNav$.pipe(
      map(isMobileNav => isMobileNav ? 'right' : 'left')
    )
    this.expandWidth$ = this.isMobileNav$.pipe(
      map(isMobileNav => isMobileNav ? '100%' : '450px')
    )
    this.navToggleAlign$ = this.isMobileNav$.pipe(
      map(isMobileNav => isMobileNav ? 'right' : 'left')
    )

    this._focusActiveItem()
    this.levelTwoItems$ = this.focusedItem$.pipe(
      map(focusedItem => {
        if (notNullOrUndefined(focusedItem) && horizontalNavItemHasChildren(focusedItem)) {
          return focusedItem.children
        }

        return []
      })
    )
  }

  _focusActiveItem() {
    const activeItem = this._findActiveItem(this.horizontalNavItems)
    this._focusedItem.next(activeItem)
  }

  _findActiveItem(items: INavItem[]): INavItem | undefined {
    const activeItem = items.find(i => this._nav.horizontalNavLinkActive(i))

    if (activeItem !== undefined) {
      return activeItem
    }

    return items.find(i => horizontalNavItemHasChildren(i) &&
      this._findActiveItem(i.children) !== undefined)
  }

  _navItemExpanded(event: NavItemExpandedEvent) {
    // Ignore 'expanded' bool for top-level items
    // A click event should always treat expanded = true
    this._focusedItem.next(event.navItem)
  }

  _setActiveCropYear(cropYear: number) {
    this._activeCropYear.next(cropYear)
  }
}

export default {
  title: 'Framework/Base Layout',
  component: TheSeamBaseLayoutComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
        ),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    }),
    moduleMetadata({
      declarations: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
        StoryRoutePlacholderComponent,
        StoryExBaseLayoutComponent
      ],
      imports: [
        TheSeamBaseLayoutModule,
        TheSeamDashboardModule,
        TheSeamSideNavModule,
        TheSeamTopBarModule,
        TheSeamWidgetModule,
        TheSeamBreadcrumbsModule,
        TheSeamNavModule,
        TheSeamIconModule,
        TheSeamScrollbarModule,
        TheSeamButtonsModule
      ],
      entryComponents: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
        StoryExBaseLayoutComponent
      ]
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Basic = () => ({
  props: {
    logo: 'assets/images/theseam_logo.svg',
    logoSm: 'assets/images/theseam_logo_notext.svg',
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
        <seam-dashboard
          *seamBaseLayoutContent
          [widgets]="widgets"
          [widgetsDraggable]="widgetsDraggable">
        </seam-dashboard>
      </seam-base-layout>
    </div>
  `,
})

// Using wrapper StoryExBaseLayoutComponent component to manage double nav items
export const HorizontalNav = () => ({
  template: `<story-ex-base-layout></story-ex-base-layout>`
})
