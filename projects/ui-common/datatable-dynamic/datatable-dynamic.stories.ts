import { moduleMetadata } from '@storybook/angular'

import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { Component, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Route, RouterModule } from '@angular/router'

import {
  DataFilterSearchComponent,
  DataFilterTextComponent,
  DataFilterToggleButtonsComponent,
  THESEAM_DATA_FILTER_OPTIONS
} from '@theseam/ui-common/data-filters'
import { DatatableExportButtonComponent, DatatableMenuBarTextComponent, THESEAM_MENUBAR_ITEM_DATA } from '@theseam/ui-common/datatable'
import {
  DynamicActionApiService,
  DynamicActionLinkService,
  DynamicActionModalService,
  ExportersDataEvaluator,
  JexlEvaluator,
  THESEAM_DYNAMIC_ACTION,
  THESEAM_DYNAMIC_DATA,
  THESEAM_DYNAMIC_VALUE_EVALUATOR
} from '@theseam/ui-common/dynamic'
import { DynamicComponentManifest, TheSeamDynamicComponentLoaderModule } from '@theseam/ui-common/dynamic-component-loader'
import { TheSeamModalModule } from '@theseam/ui-common/modal'

import { THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM } from './datatable-dynamic-menu-bar-token'
import { DatatableDynamicComponent } from './datatable-dynamic.component'
import { TheSeamDatatableDynamicModule } from './datatable-dynamic.module'
import { StoryModalOneModule, StoryModalTwoModule } from './_story-data/datatable-modals'
import { exampleData1 } from './_story-data/dynamic-data-1'


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
class StoryExModalLazyComponent { }

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
class StoryExModalLazyModule { }

// This array defines which "componentId" maps to which lazy-loaded module.
// const manifest: DynamicComponentManifest[] = [
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

const routes: Route[] = [
  // {
  //   path: 'story-ex-modal',
  //   loadChildren: () => ExampleModalModule,
  //   outlet: 'modal'
  // }
]

// storiesOf('Components/Datatable/Dynamic', module)
//   .addDecorator(withKnobs)

//   .add('Basic', () => ({
//     moduleMetadata: {
//       declarations: [ ],
//       imports: [
//         BrowserAnimationsModule,
//         HttpClientModule,
//         RouterModule.forRoot(routes, { useHash: true }),
//         TheSeamDatatableDynamicModule,
//         // ExampleModalModule
//         TheSeamDynamicComponentLoaderModule.forRoot([
//           {
//             componentId: 'story-ex-modal',
//             path: 'story-ex-modal',

//             // Lazy Load. Lazy load if you can to avoid us accidentally making the
//             // inital app bundle to large as we keep adding modals.
//             // loadChildren: () => import('./story-ex-modal-lazy/story-ex-modal-lazy.module').then(m => m.StoryExModalLazyModule)

//             // Non-lazy Load
//             loadChildren: () => StoryExModalLazyModule
//           }
//         ])
//       ],
//       entryComponents: [ ]
//     },
//     props: {
//       data: exampleData1
//     },
//     template: `
//       <div style="width: 100vw; height: 100vh;" class="p-1">
//         <div class="alert alert-danger">
//           This component is still being worked on. Not all features are guaranteed
//           to work yet, but eventually we plan to start building the datatables in
//           our app from json with this component when all necessary features are stable.
//         </div>
//         <seam-datatable-dynamic class="w-100 h-100" [data]="data"></seam-datatable-dynamic>
//       </div>
//     `
//   }))


const manifests: DynamicComponentManifest[] = [
  {
    componentId: 'story-modal-1',
    path: 'story-modal-1',
    loadChildren: () => StoryModalOneModule
  },
  {
    componentId: 'story-modal-2',
    path: 'story-modal-2',
    loadChildren: () => StoryModalTwoModule
  }
]

export default {
  title: 'Datatable Dynamic/Components',
  component: DatatableDynamicComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes, { useHash: true }),
        TheSeamDatatableDynamicModule,
        // ExampleModalModule
        TheSeamDynamicComponentLoaderModule.forRoot([
          ...manifests,
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
      providers: [
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },

        { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionApiService, multi: true },
        { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionLinkService, multi: true },
        { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionModalService, multi: true },

        {
          provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
          useValue: { name: 'filter-search', component: DataFilterSearchComponent, dataToken: THESEAM_DATA_FILTER_OPTIONS },
          multi: true
        },
        {
          provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
          useValue: { name: 'filter-text', component: DataFilterTextComponent, dataToken: THESEAM_DATA_FILTER_OPTIONS },
          multi: true
        },
        {
          provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
          useValue: { name: 'filter-buttons', component: DataFilterToggleButtonsComponent, dataToken: THESEAM_DATA_FILTER_OPTIONS },
          multi: true
        },
        {
          provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
          useValue: { name: 'export-button', component: DatatableExportButtonComponent, dataToken: THESEAM_DYNAMIC_DATA },
          multi: true
        },
        {
          provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
          useValue: { name: 'text', component: DatatableMenuBarTextComponent, dataToken: THESEAM_MENUBAR_ITEM_DATA },
          multi: true
        }
      ]
    })
  ],
  excludeStories: [ 'StoryExModalLazyComponent', 'StoryExModalLazyModule' ]
}

export const Dynamic = () => ({
  props: {
      data: exampleData1
  },
  template: `
    <div style="width: 100vw; height: 100vh;" class="p-1 d-flex flex-column">
      <!--<div class="alert alert-danger">
        This component is still being worked on. Not all features are guaranteed
        to work yet, but eventually we plan to start building the datatables in
        our app from json with this component when all necessary features are stable.
      </div>-->
      <div class="d-flex flex-column h-100">
        <seam-datatable-dynamic class="w-100 h-100" [def]="data"></seam-datatable-dynamic>
      </div>
    </div>
  `
})

Dynamic.story = {
  name: 'Dynamic'
}
