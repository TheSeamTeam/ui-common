import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { Component } from '@angular/core'
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations'
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common'
import { of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { faBell, faWrench } from '@fortawesome/free-solid-svg-icons'

import {
  TheSeamWidgetModule,
  THESEAM_WIDGET_PREFERENCES_ACCESSOR,
} from '@theseam/ui-common/widget'
import { StoryPreferencesAccessorService } from '@theseam/ui-common/story-helpers'

import { DashboardComponent } from '../dashboard.component'
import { TheSeamDashboardModule } from '../dashboard.module'
import { DashboardWidgetsComponent } from './dashboard-widgets.component'

@Component({
  selector: 'story-ex-widget-1',
  template: `<seam-widget
    [icon]="faWrench"
    titleText="Example Widget 1"
    [loading]="!(initialized$ | async)"
    [canCollapse]="true"
  >
    <seam-widget-content-header>Widget example 1</seam-widget-content-header>

    <seam-widget-tile-list>
      <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">
        {{ item }}
      </button>
    </seam-widget-tile-list>

    <seam-widget-footer-text *ngIf="p?.length"
      >Submitted:
      {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text
    >
  </seam-widget>`,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, TheSeamWidgetModule],
})
class StoryExWidget1Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = ['one', 'two', 'three', 'four']
}

@Component({
  selector: 'story-ex-widget-2',
  template: `<seam-widget
    [icon]="faWrench"
    titleText="Lazy Widget 2"
    [loading]="!(initialized$ | async)"
    [canCollapse]="true"
  >
    <seam-widget-content-header>Widget example 2</seam-widget-content-header>

    <seam-widget-tile-list>
      <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">
        {{ item }}
      </button>
    </seam-widget-tile-list>

    <seam-widget-footer-text *ngIf="p?.length"
      >Submitted:
      {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text
    >
  </seam-widget>`,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, TheSeamWidgetModule],
})
class StoryExWidget2Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = ['one', 'two', 'three', 'four']
}

@Component({
  selector: 'story-ex-widget-3',
  template: `<seam-widget
    [icon]="faWrench"
    titleText="Lazy Widget 3"
    [loading]="!(initialized$ | async)"
    [canCollapse]="true"
  >
    <seam-widget-content-header>Widget example 3</seam-widget-content-header>

    <seam-widget-tile-list>
      <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">
        {{ item }}
      </button>
    </seam-widget-tile-list>

    <seam-widget-footer-text *ngIf="p?.length"
      >Submitted:
      {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text
    >
  </seam-widget>`,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, TheSeamWidgetModule],
})
class StoryExWidget3Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = ['one', 'two', 'three', 'four']
}

@Component({
  selector: 'story-ex-widget-4',
  template: `<seam-widget
    [icon]="faWrench"
    titleText="Lazy Widget 4"
    [loading]="!(initialized$ | async)"
    [canCollapse]="true"
  >
    <seam-widget-content-header>Widget example 4</seam-widget-content-header>

    <seam-widget-tile-list>
      <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">
        {{ item }}
      </button>
    </seam-widget-tile-list>

    <seam-widget-footer-text *ngIf="p?.length"
      >Submitted:
      {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text
    >
  </seam-widget>`,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, TheSeamWidgetModule],
})
class StoryExWidget4Component {
  faWrench = faWrench
  faBell = faBell
  initialized$ = of(true).pipe(delay(1000))
  items = ['one', 'two', 'three', 'four']
}

const meta: Meta<DashboardWidgetsComponent> = {
  title: 'Framework/Dashboard/Widgets',
  component: DashboardWidgetsComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    // moduleMetadata({
    //   imports: [
    //     TheSeamWidgetModule,
    //     TheSeamDashboardModule,
    //   ],
    // }),
  ],
}

export default meta
type Story = StoryObj<DashboardWidgetsComponent>

export const Basic: Story = {
  render: (args) => ({
    moduleMetadata: {
      providers: [
        {
          provide: THESEAM_WIDGET_PREFERENCES_ACCESSOR,
          useClass: StoryPreferencesAccessorService,
        },
      ],
    },
    props: {
      widgets: [
        {
          widgetId: 'widget-1',
          col: 0,
          order: 0,
          component: StoryExWidget1Component,
        },
        {
          widgetId: 'widget-2',
          col: 1,
          order: 0,
          component: StoryExWidget2Component,
        },
        {
          widgetId: 'widget-3',
          col: 2,
          order: 0,
          component: StoryExWidget3Component,
        },
        {
          widgetId: 'widget-4',
          col: 1,
          order: 1,
          component: StoryExWidget4Component,
        },
      ],
    },
    template: `
      <div style="height: 100vh;">
        <seam-dashboard-widgets [widgets]="widgets"></seam-dashboard-widgets>
      </div>
    `,
  }),
}

// storiesOf('Framework/Dashboard', module)
//   // .addDecorator(withKnobs)

//   .add('Widgets', () => ({
//     moduleMetadata: {
//       declarations: [
//         StoryExWidget1Component,
//         StoryExWidget2Component,
//         StoryExWidget3Component,
//         StoryExWidget4Component
//       ],
//       imports: [
//         BrowserAnimationsModule,
//         TheSeamWidgetModule,
//         TheSeamDashboardModule
//       ],
//     },
//     props: {
//       widgets: [
//         { widgetId: 'widget-1', col: 0, order: 0, component: StoryExWidget1Component },
//         { widgetId: 'widget-2', col: 1, order: 0, component: StoryExWidget2Component },
//         { widgetId: 'widget-3', col: 2, order: 0, component: StoryExWidget3Component },
//         { widgetId: 'widget-4', col: 1, order: 1, component: StoryExWidget4Component }
//       ]
//     },
//     template: `
//       <div style="height: 100vh;">
//         <seam-dashboard-widgets [widgets]="widgets"></seam-dashboard-widgets>
//       </div>
//     `
//   }))
