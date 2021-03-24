import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { faBell, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '@theseam/ui-common/widget'

import { TheSeamDashboardModule } from '../dashboard.module'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-1',
  template: `<seam-widget [icon]="faWrench" titleText="Example Widget 1" [loading]="!(initialized$ | async)">
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
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-2',
  template: `<seam-widget [icon]="faWrench" titleText="Lazy Widget 2" [loading]="!(initialized$ | async)">
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
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-3',
  template: `<seam-widget [icon]="faWrench" titleText="Lazy Widget 3" [loading]="!(initialized$ | async)">
  <seam-widget-content-header>Widget example 3</seam-widget-content-header>

  <seam-widget-tile-list>
    <button *ngFor="let item of items" seam-widget-tile [icon]="faBell">{{ item }}</button>
  </seam-widget-tile-list>

  <seam-widget-footer-text *ngIf="p?.length">Submitted: {{ Date.now() | date: 'yyyy-MM-dd h:mm aaa' }}</seam-widget-footer-text>
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
  template: `<seam-widget [icon]="faWrench" titleText="Lazy Widget 4" [loading]="!(initialized$ | async)">
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
  initialized$ = of(true).pipe(delay(1000))
  items = [ 'one', 'two', 'three', 'four' ]
}

storiesOf('Framework/Dashboard', module)
  .addDecorator(withKnobs)

  .add('Widgets', () => ({
    moduleMetadata: {
      declarations: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component
      ],
      imports: [
        BrowserAnimationsModule,
        TheSeamWidgetModule,
        TheSeamDashboardModule
      ],
      entryComponents: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component
      ]
    },
    props: {
      widgets: [
        { widgetId: 'widget-1', col: 0, order: 0, component: StoryExWidget1Component },
        { widgetId: 'widget-2', col: 1, order: 0, component: StoryExWidget2Component },
        { widgetId: 'widget-3', col: 2, order: 0, component: StoryExWidget3Component },
        { widgetId: 'widget-4', col: 1, order: 1, component: StoryExWidget4Component }
      ]
    },
    template: `
      <div style="height: 100vh;">
        <seam-dashboard-widgets [widgets]="widgets"></seam-dashboard-widgets>
      </div>
    `
  }))
