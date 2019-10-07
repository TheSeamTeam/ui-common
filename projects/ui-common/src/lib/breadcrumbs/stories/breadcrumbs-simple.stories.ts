import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryInitialRouteModule } from '../../../stories/helpers/index'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

storiesOf('Components|Breadcrumbs', module)

  .add('Simple', () => ({
    moduleMetadata: {
      declarations: [
        BreadcrumbsComponent,
        StoryEmptyComponent
      ],
      providers: [ ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        RouterModule.forRoot([
          {
            path: 'home',
            component: StoryEmptyComponent,
            data: {
              breadcrumb: 'Home'
            }
          }
        ], { useHash: true }),
        StoryInitialRouteModule.forRoot('/home')
      ]
    },
    props: { },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `
  }))
