import { boolean, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { Component } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import {
  faBell, faBuilding, faChartLine, faCompass, faFilePdf, faSignature,
  faUsers, faWrench
} from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'

import { TheSeamFormFieldModule } from '@lib/ui-common/form-field'
import { TheSeamIconModule } from '@lib/ui-common/icon'
import { TheSeamWidgetModule } from '../../widget/index'
import { TheSeamBaseLayoutModule } from '../base-layout/index'
import { TheSeamDashboardModule } from '../dashboard/index'
import { DynamicDatatablePageComponent } from '../dynamic-pages/dynamic-datatable-page/dynamic-datatable-page.component'
import { DynamicPagesModule } from '../dynamic-pages/dynamic-pages.module'
import { TheSeamDynamicRouterModule } from '../dynamic-router/dynamic-router.module'
import { HierarchyLevelResolver } from '../dynamic-router/resolvers/hierarchy-level.resolver'
import { TheSeamSideNavModule } from '../side-nav/index'
import { TheSeamTopBarModule } from '../top-bar/index'

import { exampleData2 } from '../../datatable-dynamic/_story-data/dynamic-data-2'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-1',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 1"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 1</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`
})
class StoryExWidget1Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true)
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-2',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 2"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 2</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`
})
class StoryExWidget2Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true)
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-3',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 3"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">
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
  initialized$ = of(true)
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-4',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 4"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 4</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
</seam-widget>`
})
class StoryExWidget4Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true)
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-5',
  template: `<seam-widget [icon]="faUsers" titleText="2019 Member Enrollments"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">

  <seam-widget-tile-list>
    <button seam-widget-tile [icon]="tileIcon">17 members.</button>
    <button seam-widget-tile [icon]="tileIcon"
      [notificationIcon]="faClock" notificationIconClass="text-danger">13 pending approvals.</button>
    [notificationIcon]="faClock" notificationIconClass="text-danger"
  </seam-widget-tile-list>
</seam-widget>`
})
class StoryExWidget5Component {
  faUsers = faUsers
  faClock = faClock
  tileIcon = 'assets/images/icons8-user-groups-ab17c7.png'
  initialized$ = of(true)
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-6',
  template: `<seam-widget [icon]="faSignature" titleText="Bill of Ladings"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">

  <table class="table table-striped mb-0">
    <thead>
      <tr>
        <th scope="col"></th>
        <th scope="col">Bill of Lading</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">
          <seam-icon [icon]="faFilePdf" iconClass="text-danger"></seam-icon>
        </th>
        <td>8514071</td>
        <td>In Transit</td>
      </tr>
      <tr>
        <th scope="row">
          <seam-icon [icon]="faFilePdf" iconClass="text-danger"></seam-icon>
        </th>
        <td>8513935</td>
        <td>In Transit</td>
      </tr>
      <tr>
        <th scope="row">
          <seam-icon [icon]="faFilePdf" iconClass="text-danger"></seam-icon>
        </th>
        <td>8514006</td>
        <td>Awaiting Signature</td>
      </tr>
      <tr>
        <th scope="row">
          <seam-icon [icon]="faFilePdf" iconClass="text-danger"></seam-icon>
        </th>
        <td>8513991</td>
        <td>In Transit</td>
      </tr>
      <tr>
        <th scope="row">
          <seam-icon [icon]="faFilePdf" iconClass="text-danger"></seam-icon>
        </th>
        <td>8514077</td>
        <td>Complete</td>
      </tr>
    </tbody>
  </table>

</seam-widget>`
})
class StoryExWidget6Component {
  faSignature = faSignature
  faFilePdf = faFilePdf
  initialized$ = of(true)
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-7',
  template: `<seam-widget [icon]="faChartLine" titleText="Product Trends By Month"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">

  <img [src]="figureImg" />

</seam-widget>`
})
class StoryExWidget7Component {
  faChartLine = faChartLine
  initialized$ = of(true)
  figureImg = 'assets/images/chart.png'
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-8',
  template: `<seam-widget [icon]="faClock" titleText="Example Text"
    [hasConfig]="true" [canCollapse]="true" [loading]="!(initialized$ | async)">

  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
  nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
  qui officia deserunt mollit anim id est laborum. <a>More…</a></p>

</seam-widget>`
})
class StoryExWidget8Component {
  faClock = faClock
  initialized$ = of(true)
}



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'name-ex',
  template: `
    <div>Name: {{ name$ | async }}</div>
  `
})
class StoryNameExComponent {

  name$: Observable<string | undefined>

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    console.log('name-ex', this)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))

    console.log('config', this._router.config)
    console.log('config2', this._route.routeConfig)
    // this._router.config.unshift(this._routes)
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'user-details-ex',
  template: `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a routerLink="/">Dashboard</a></li>
        <li class="breadcrumb-item"><a routerLink="/users">Users</a></li>
        <li class="breadcrumb-item active" aria-current="page">Detail</li>
      </ol>
    </nav>

    <div>User Details</div>
  `
})
class UserDetailsExComponent {

  name$: Observable<string | undefined>

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    console.log('user-details-ex', this)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))

    // console.log('config', this._router.config)
    // console.log('config2', this._route.routeConfig)
    // this._router.config.unshift(this._routes)
  }
}



storiesOf('Framework/Examples', module)
  .addDecorator(withKnobs)

  .add('Table With Detail Nav', () => ({
    moduleMetadata: {
      declarations: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
        StoryExWidget5Component,
        StoryExWidget6Component,
        StoryExWidget7Component,
        StoryExWidget8Component,

        StoryNameExComponent,
        UserDetailsExComponent
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        TheSeamFormFieldModule,
        TheSeamDynamicRouterModule,
        RouterModule.forRoot([
          {
            path: 'users',
            component: DynamicDatatablePageComponent,
            data: {
              name: 'Users',
              tableDef: exampleData2
            },
            resolve: {
              hierLevel: HierarchyLevelResolver
            },
            // loadChildren: () => Promise.resolve(LevelTwoModule)
            // loadChildren: () => of(LevelTwoModule)
            children: [
              {
                path: 'details',
                component: UserDetailsExComponent,
                data: { },
                resolve: {
                  hierLevel: HierarchyLevelResolver
                }
              },
            ]
          },
          {
            path: 'documents',
            component: StoryNameExComponent,
            data: {
              name: 'Documents'
            },
            resolve: {
              hierLevel: HierarchyLevelResolver
            },
            // loadChildren: () => Promise.resolve(LevelTwoModule)
            // loadChildren: () => of(LevelTwoModule)
          },
          {
            path: 'settings',
            component: StoryNameExComponent,
            data: {
              name: 'Settings'
            },
            resolve: {
              hierLevel: HierarchyLevelResolver
            },
            // loadChildren: () => Promise.resolve(LevelTwoModule)
            // loadChildren: () => of(LevelTwoModule)
          },
          {
            path: 'status',
            component: StoryNameExComponent,
            data: {
              name: 'Status'
            },
            resolve: {
              hierLevel: HierarchyLevelResolver
            },
            // loadChildren: () => Promise.resolve(LevelTwoModule)
            // loadChildren: () => of(LevelTwoModule)
          }
        ], { useHash: true }),
        TheSeamBaseLayoutModule,
        TheSeamDashboardModule,
        TheSeamSideNavModule,
        TheSeamTopBarModule,
        TheSeamWidgetModule,
        DynamicPagesModule,
        TheSeamIconModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
      entryComponents: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component,
        StoryExWidget5Component,
        StoryExWidget6Component,
        StoryExWidget7Component,
        StoryExWidget8Component,
        UserDetailsExComponent
      ]
    },
    props: {
      navItems: [
        {
          itemType: 'link',
          label: 'Dashboard',
          icon: faSignature,
          link: '/',
        },
        {
          itemType: 'basic',
          label: 'Tables',
          icon: faBuilding,
          children: [
            {
              itemType: 'link',
              label: 'Users',
              icon: faSignature,
              link: 'users',
            },
            {
              itemType: 'link',
              label: 'Documents',
              icon: faBuilding,
              link: 'documents'
            }
          ]
        },
        { itemType: 'divider' },
        {
          itemType: 'title',
          label: 'Admin'
        },
        {
          itemType: 'link',
          label: 'Settings',
          icon: faSignature,
          link: 'settings'
        },
        {
          itemType: 'link',
          label: 'Status',
          icon: faBuilding,
          link: 'status'
        }
      ],
      widgets: [
        { col: 1, order: 1, type: StoryExWidget1Component },
        { col: 2, order: 2, type: StoryExWidget2Component },
        { col: 3, order: 1, type: StoryExWidget3Component },
        { col: 2, order: 2, type: StoryExWidget4Component },
        { col: 3, order: 0, type: StoryExWidget5Component },
        { col: 1, order: 0, type: StoryExWidget6Component },
        { col: 2, order: 0, type: StoryExWidget7Component },
        { col: 2, order: 1, type: StoryExWidget8Component }
      ],
      logo: text('logo', 'assets/images/theseam_logo.svg'),
      logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
      titleText: text('titleText', 'Dashboard'),
      subTitleText: text('subTitleText', 'Example'),
      dashboardBreadcrubs: boolean('Breadcrumbs on Dashboard', true),
    },
    template: `
      <div style="height: 100vh; width: 100vw;">
        <seam-base-layout>
          <seam-side-nav
            *seamBaseLayoutSideBar
            [items]="navItems">
          </seam-side-nav>
          <seam-top-bar
            *seamBaseLayoutTopBar
            [logo]="logo"
            [logoSm]="logoSm"
            [titleText]="titleText"
            [subTitleText]="subTitleText">
          </seam-top-bar>

          <seam-hierarchy-router-outlet *seamBaseLayoutContent>
            <nav aria-label="breadcrumb" *ngIf="dashboardBreadcrubs">
              <ol class="breadcrumb">
                <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
              </ol>
            </nav>
            <seam-dashboard [widgets]="widgets"></seam-dashboard>
          </seam-hierarchy-router-outlet>
        </seam-base-layout>
      </div>
    `
  }))
