import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { Component, NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { TheSeamDynamicComponentLoaderModule } from '../dynamic-component-loader/dynamic-component-loader.module'
import { TheSeamModalModule } from '../modal/index'

import { exampleData1 } from './_story-data/dynamic-data-1'
import { TheSeamDatatableDynamicModule } from './datatable-dynamic.module'

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'story-ex-modal-lazy',
  template: `
    <seam-modal-header>
      <h4 seamModalTitle>
        Example Header
      </h4>
      <button seamModalClose class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>

    <seam-modal-body>
      Example Body
    </seam-modal-body>

    <seam-modal-footer>
      <button class="btn btn-lightgray" seamModalClose>Cancel</button>
      <button class="btn btn-success" type="submit">Share</button>
    </seam-modal-footer>
  `
})
export class StoryExModalLazyComponent { }

@NgModule({
  declarations: [
    StoryExModalLazyComponent
  ],
  imports: [
    CommonModule,
    TheSeamModalModule,
    TheSeamDynamicComponentLoaderModule.forChild(StoryExModalLazyComponent),
  ],
  entryComponents: [
    StoryExModalLazyComponent
  ]
})
export class StoryExModalLazyModule { }

// This array defines which "componentId" maps to which lazy-loaded module.
// const manifest: IDynamicComponentManifest[] = [
//   {
//     componentId: 'widget-one',
//     path: 'widget-one',

//     // Lazy Load. Lazy load if you can to avoid us accidentally making the
//     // inital app bundle to large as we keep adding modals.
//     // loadChildren: () => import('./story-ex-modal-lazy/story-ex-modal-lazy.module').then(m => m.StoryExModalLazyModule)

//     // Non-lazy Load
//     loadChildren: () => StoryExModalLazyModule
//   }
// ]

// @NgModule({
//   declarations: [
//     // StoryExRouteModalComponent
//   ],
//   imports: [
//     // RouterModule.forChild([
//     //   {
//     //     path: '',
//     //     component: StoryExRouteModalComponent
//     //   }
//     // ]),
//     TheSeamDynamicComponentLoaderModule.forModule({
//       componentId: 'widget-one',
//       path: 'widget-one',

//       // Lazy Load. Lazy load if you can to avoid us accidentally making the
//       // inital app bundle to large as we keep adding modals.
//       // loadChildren: () => import('./story-ex-modal-lazy/story-ex-modal-lazy.module').then(m => m.StoryExModalLazyModule)

//       // Non-lazy Load
//       loadChildren: () => StoryExModalLazyModule
//     }),
//     TheSeamModalModule
//   ],
//   exports: [
//     // RouterModule
//   ],
//   entryComponents: [
//     // StoryExRouteModalComponent
//   ]
// })
// class ExampleModalModule { }

const routes = [
  // {
  //   path: 'story-ex-modal',
  //   loadChildren: () => ExampleModalModule,
  //   outlet: 'modal'
  // }
]

storiesOf('Components/Datatable/Dynamic', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [ ],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(routes, { useHash: true }),
        TheSeamDatatableDynamicModule,
        // ExampleModalModule
        TheSeamDynamicComponentLoaderModule.forRoot([
          {
            componentId: 'story-ex-modal',
            path: 'story-ex-modal',

            // Lazy Load. Lazy load if you can to avoid us accidentally making the
            // inital app bundle to large as we keep adding modals.
            // loadChildren: () => import('./story-ex-modal-lazy/story-ex-modal-lazy.module').then(m => m.StoryExModalLazyModule)

            // Non-lazy Load
            loadChildren: () => StoryExModalLazyModule
          }
        ])
      ],
      entryComponents: [ ]
    },
    props: {
      data: exampleData1
    },
    template: `
      <div style="width: 100vw; height: 100vh;" class="p-1 d-flex flex-column">
        <div class="alert alert-danger">
          This component is still being worked on. Not all features are guaranteed
          to work yet, but eventually we plan to start building the datatables in
          our app from json with this component when all necessary features are stable.
        </div>
        <div class="d-flex flex-column h-100">
          <seam-datatable-dynamic class="w-100 h-100" [data]="data"></seam-datatable-dynamic>
        </div>
      </div>
    `
  }))
