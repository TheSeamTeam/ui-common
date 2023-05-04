// import { select, text, withKnobs } from '@storybook/addon-knobs'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { CommonModule } from '@angular/common'
import { Component, importProvidersFrom, Inject, NgModule } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamDynamicRouterModule } from '../dynamic-router.module'
import { HierarchyLevelResolver } from '../resolvers/hierarchy-level.resolver'

@Component({
  selector: 'sub-name-ex',
  template: `<div>Sub Name: {{ name$ | async }}</div><router-outlet></router-outlet>`,
})
class StorySubNameExComponent {

  name$: Observable<string | undefined>

  constructor(
    private _route: ActivatedRoute
  ) {
    // console.log('sub-name-ex', this)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))
  }
}

@Component({
  selector: 'name-ex',
  template: `
    <div>Name: {{ name$ | async }}</div>
    <router-outlet></router-outlet>
  `
})
class StoryNameExComponent {

  name$: Observable<string | undefined>

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    // console.log('name-ex', this)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))

    // console.log('config', this._router.config)
    // console.log('config2', this._route.routeConfig)
    // this._router.config.unshift(this._routes)
  }
}

@Component({
  selector: 'story-ex-base',
  template: `
    URL: {{ _router.url }}
    <div class="my-2 p-2">
      <form class="mb-2" (ngSubmit)="go()">
        <input seamInput [formControl]="_control">
      </form>
      <button class="btn btn-sm btn-light" type="button" [routerLink]="_control.value">Go</button>
    </div>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
class StoryExBaseComponent {

  _control = new FormControl('/name-ex/sub-name')

  constructor(
    private _route: ActivatedRoute,
    public _router: Router
  ) {
    // console.log('this._route', this._route)
    // console.log('this._router', this._router)
  }

  public go() {
    if (this._control.value) {
      this._router.navigateByUrl(this._control.value)
    }
  }
}

// ////////////////////////////////////////////////////////////////////////////
// Recursive Id Start
// ////////////////////////////////////////////////////////////////////////////
@Component({
  selector: 'recursive-id-start-1',
  template: `
    <div>
      <div>{{ type$ | async }} : {{ id$ | async }}</div>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="table/{{ nextId }}">Next[table]</button>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="new/{{ nextId }}">Next[new]</button>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="edit/{{ nextId }}">Next[edit]</button>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="view/{{ nextId }}">Next[view]</button>
    </div>
    <router-outlet></router-outlet>
  `
})
class RecursiveIdOneComponent {

  id$: Observable<string | undefined>
  type$: Observable<string | undefined>

  nextId = (Math.random() * 1 * 50).toFixed(0)

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.id$ = this._route.paramMap.pipe(map(v => v.get('id') || undefined))
    this.type$ = this._route.data.pipe(map(v => v['type'] || undefined))
  }

}

@Component({
  selector: 'recursive-id-start-2',
  template: `
    <div>
      <div>{{ type$ | async }} : {{ id$ | async }}</div>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="table/{{ nextId }}">Next[table]</button>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="new/{{ nextId }}">Next[new]</button>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="edit/{{ nextId }}">Next[edit]</button>
      <button type="button" class="btn btn-sm btn-light px-4" routerLink="view/{{ nextId }}">Next[view]</button>
    </div>
    <router-outlet></router-outlet>
  `
})
class RecursiveIdTwoComponent {

  id$: Observable<string | undefined>
  type$: Observable<string | undefined>

  nextId = (Math.random() * 1 * 50).toFixed(0)

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.id$ = this._route.paramMap.pipe(map(v => v.get('id') || undefined))
    // this.type$ = this._route.data.pipe(map(v => v['type'] || undefined))
    this.type$ = this._route.paramMap.pipe(map(v => v.get('type') || undefined))
  }

}

@Component({
  selector: 'recursive-id-start-3',
  template: `
    <seam-hierarchy-router-outlet>
      <div>
        <div>Type: {{ type$ | async }}</div>
        <button type="button" class="btn btn-sm btn-light px-4" routerLink="table/{{ nextId }}">Next[table]</button>
        <button type="button" class="btn btn-sm btn-light px-4" routerLink="new/{{ nextId }}">Next[new]</button>
        <button type="button" class="btn btn-sm btn-light px-4" routerLink="edit/{{ nextId }}">Next[edit]</button>
        <button type="button" class="btn btn-sm btn-light px-4" routerLink="view/{{ nextId }}">Next[view]</button>
        <button type="button" class="btn btn-sm btn-light px-4" routerLink="{{ nextId }}">Next Random</button>
      </div>
    </seam-hierarchy-router-outlet>
    <!--<router-outlet></router-outlet>-->
  `,
  styles: [`
    :host {
      display: block;
      background: rgba(30,30,80,0.3);
      outline: red;
      width: 100%;
      height: 100px;
    }
  `]
})
class RecursiveIdThreeComponent {

  type$: Observable<string | undefined>

  nextId = (Math.random() * 1 * 50).toFixed(0)

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.type$ = this._route.paramMap.pipe(map(v => v.get('type') || undefined))
  }

}

@NgModule({
  declarations: [
    RecursiveIdOneComponent,
    RecursiveIdTwoComponent,
    RecursiveIdThreeComponent
  ],
  imports: [
    CommonModule,
    TheSeamDynamicRouterModule,
    RouterModule.forChild([
      // {
      //   path: 'table/:id',
      //   component: RecursiveIdOneComponent,
      //   data: { type: 'table' },
      //   loadChildren: () => RecursiveIdModule
      // },
      // {
      //   path: 'new/:id',
      //   component: RecursiveIdOneComponent,
      //   data: { type: 'new' },
      //   loadChildren: () => RecursiveIdModule
      // },
      // {
      //   path: 'edit/:id',
      //   component: RecursiveIdOneComponent,
      //   data: { type: 'edit' },
      //   loadChildren: () => RecursiveIdModule
      // },
      // {
      //   path: 'view/:id',
      //   component: RecursiveIdOneComponent,
      //   data: { type: 'view' },
      //   loadChildren: () => RecursiveIdModule
      // }

      // {
      //   path: ':type/:id',
      //   component: RecursiveIdTwoComponent,
      //   // data: { type: 'view' },
      //   loadChildren: () => RecursiveIdModule
      // }

      {
        path: ':type',
        component: RecursiveIdThreeComponent,
        resolve: {
          hierLevel: HierarchyLevelResolver
        },
        loadChildren: () => RecursiveIdModule
      }
    ])
  ],
  entryComponents: [ ]
})
class RecursiveIdModule { }
// ////////////////////////////////////////////////////////////////////////////
// Recursive Id End
// ////////////////////////////////////////////////////////////////////////////

@NgModule({
  declarations: [
    StorySubNameExComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'sub-name',
        component: StorySubNameExComponent,
        loadChildren: () => RecursiveIdModule
      }
    ])
  ],
  entryComponents: [
    StorySubNameExComponent
  ]
})
class LevelTwoModule { }

//
// Example
//

@Component({
  selector: 'ex-1',
  template: `
    <seam-hierarchy-router-outlet>
      <button type="button" routerLink="/ex-1/ex-2">Next</button>
    </seam-hierarchy-router-outlet>
  `
})
class StoryEx1Component {
  // constructor() {
  //   console.log('[StoryEx1Component]')
  // }
}

@Component({
  selector: 'ex-2',
  template: `
    <seam-hierarchy-router-outlet>
      <button type="button" routerLink="/ex-1">Prev</button>
      <button type="button" routerLink="/ex-1/ex-2/ex-3">Next</button>
    </seam-hierarchy-router-outlet>
  `
})
class StoryEx2Component {
  // constructor() {
  //   console.log('[StoryEx2Component]')
  // }
}

@Component({
  selector: 'ex-2',
  template: `
    <seam-hierarchy-router-outlet>
      <button type="button" routerLink="/ex-1/ex-2">Prev</button>
    </seam-hierarchy-router-outlet>
  `
})
class StoryEx3Component {
  // constructor() {
  //   console.log('[StoryEx3Component]')
  // }
}

export default {
  title: 'Framework/Dynamic Router',
  // component: BreadcrumbsComponent,
  decorators: [
    // withKnobs
    // moduleMetadata({

    // })
  ]
} as Meta

export const Recursive: Story = args => ({
  applicationConfig: {
    providers: [
      provideAnimations(),
      importProvidersFrom(
        RouterModule.forRoot([
          {
            path: 'name-ex',
            component: StoryNameExComponent,
            data: {
              name: 'Mark',
            },
            // loadChildren: () => Promise.resolve(LevelTwoModule)
            loadChildren: () => of(LevelTwoModule),
          }
        ], { useHash: true }),
      ),
    ],
  },
  moduleMetadata: {
    declarations: [
      StoryNameExComponent,
      StoryExBaseComponent,
    ],
    imports: [
      RouterModule,
      ReactiveFormsModule,
      TheSeamFormFieldModule,
      TheSeamDynamicRouterModule,
    ],
    entryComponents: [
      StoryNameExComponent,
    ],
  },
  props: { },
  template: `
    <story-ex-base></story-ex-base>
  `,
})

export const Example: Story = args => ({
  applicationConfig: {
    providers: [
      provideAnimations(),
      importProvidersFrom(
        RouterModule.forRoot([
          {
            path: '',
            pathMatch: 'full',
            redirectTo: '/ex-1',
          },
          {
            path: 'ex-1',
            component: StoryEx1Component,
            children: [
              {
                path: 'ex-2',
                component: StoryEx2Component,
                children: [
                  {
                    path: 'ex-3',
                    component: StoryEx3Component,
                  },
                ],
              },
            ],
          }
        ], { useHash: true }),
      ),
    ],
  },
  moduleMetadata: {
    declarations: [
      StoryEx1Component,
      StoryEx2Component,
      StoryEx3Component,
    ],
    imports: [
      RouterModule,
      ReactiveFormsModule,
      TheSeamFormFieldModule,
      TheSeamDynamicRouterModule,
    ],
    entryComponents: [

    ],
  },
  props: { },
  template: `
    <router-outlet></router-outlet>
  `,
})

// storiesOf('Framework/DynamicRouter', module)
//   .addDecorator(withKnobs)

//   .add('Recursive', () => ({
//     moduleMetadata: {
//       declarations: [
//         StoryNameExComponent,
//         StoryExBaseComponent
//       ],
//       imports: [
//         BrowserAnimationsModule,
//         ReactiveFormsModule,
//         TheSeamFormFieldModule,
//         TheSeamDynamicRouterModule,
//         RouterModule.forRoot([
//           {
//             path: 'name-ex',
//             component: StoryNameExComponent,
//             data: {
//               name: 'Mark'
//             },
//             // loadChildren: () => Promise.resolve(LevelTwoModule)
//             loadChildren: () => of(LevelTwoModule)
//           }
//         ], { useHash: true })
//       ],
//       entryComponents: [
//         StoryNameExComponent
//       ]
//     },
//     props: { },
//     template: `
//       <story-ex-base></story-ex-base>
//     `
//   }))

//   .add('Example', () => ({
//     moduleMetadata: {
//       declarations: [
//         StoryEx1Component,
//         StoryEx2Component,
//         StoryEx3Component
//       ],
//       imports: [
//         BrowserAnimationsModule,
//         ReactiveFormsModule,
//         TheSeamFormFieldModule,
//         TheSeamDynamicRouterModule,
//         RouterModule.forRoot([
//           {
//             path: '',
//             pathMatch: 'full',
//             redirectTo: '/ex-1',
//           },
//           {
//             path: 'ex-1',
//             component: StoryEx1Component,
//             children: [
//               {
//                 path: 'ex-2',
//                 component: StoryEx2Component,
//                 children: [
//                   {
//                     path: 'ex-3',
//                     component: StoryEx3Component
//                   }
//                 ]
//               }
//             ]
//           }
//         ], { useHash: true })
//       ],
//       entryComponents: [

//       ]
//     },
//     props: { },
//     template: `
//       <router-outlet></router-outlet>
//     `
//   }))
