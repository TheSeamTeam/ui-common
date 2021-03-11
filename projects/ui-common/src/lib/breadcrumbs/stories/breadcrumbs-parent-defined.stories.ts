import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryEmptyWithRouteComponent, StoryInitialRouteModule } from '@lib/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

storiesOf('Components/Breadcrumbs', module)

  .add('Parent Defined', () => ({
    moduleMetadata: {
      declarations: [
        BreadcrumbsComponent,
        StoryEmptyComponent,
        StoryEmptyWithRouteComponent
      ],
      providers: [ ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        RouterModule.forRoot([
          {
            path: 'home',
            component: StoryEmptyWithRouteComponent,
            data: {
              breadcrumb: 'Home'
            },
            children: [
              {
                path: '',
                component: StoryEmptyComponent,
              }
            ]
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
