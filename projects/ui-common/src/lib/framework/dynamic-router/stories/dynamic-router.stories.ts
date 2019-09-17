import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component, Inject, NgModule } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Route, Router, RouterModule, RouterStateSnapshot, ROUTES, UrlTree } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { CommonModule } from '@angular/common'
import { TheSeamFormFieldModule } from '../../../form-field/index'
import { TheSeamDynamicRouterModule } from '../dynamic-router.module'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sub-name-ex',
  template: `<div>Sub Name: {{ name$ | async }}</div><router-outlet></router-outlet>`,
})
class StorySubNameExComponent {

  name$: Observable<string | undefined>

  constructor(
    private _route: ActivatedRoute
  ) {
    console.log('sub-name-ex', this)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))
  }
}

@Component({
  // tslint:disable-next-line:component-selector
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
    private _router: Router,
    @Inject(ROUTES) private _routes: Route
  ) {
    console.log('name-ex', this)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))

    console.log('_routes', this._routes)
    console.log('config', this._router.config)
    console.log('config2', this._route.routeConfig)
    // this._router.config.unshift(this._routes)
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-base',
  template: `
    URL: {{ _router.url }}
    <div class="my-2 p-2">
      <div class="mb-2">
        <input seamInput [formControl]="_control">
      </div>
      <button class="btn btn-sm btn-light" type="button" [routerLink]="_control.value">Go</button>
    </div>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
class StoryExBaseComponent {

  _control = new FormControl('/name-ex')

  constructor(
    private _route: ActivatedRoute,
    public _router: Router
  ) {
    console.log('this._route', this._route)
    console.log('this._router', this._router)
    this._control.setValue(this._router.url)
  }
}



// ////////////////////////////////////////////////////////////////////////////
// Recursive Id Start
// ////////////////////////////////////////////////////////////////////////////
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'recursive-id-start',
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
class RecursiveIdComponent {

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

@NgModule({
  declarations: [
    RecursiveIdComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'table/:id',
        component: RecursiveIdComponent,
        data: { type: 'table' },
        loadChildren: () => RecursiveIdModule
      },
      {
        path: 'new/:id',
        component: RecursiveIdComponent,
        data: { type: 'new' },
        loadChildren: () => RecursiveIdModule
      },
      {
        path: 'edit/:id',
        component: RecursiveIdComponent,
        data: { type: 'edit' },
        loadChildren: () => RecursiveIdModule
      },
      {
        path: 'view/:id',
        component: RecursiveIdComponent,
        data: { type: 'view' },
        loadChildren: () => RecursiveIdModule
      }
    ])
  ],
  entryComponents: [
    RecursiveIdComponent
  ]
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


storiesOf('Framework/DynamicRouter', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        StoryNameExComponent,
        StoryExBaseComponent
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        TheSeamFormFieldModule,
        TheSeamDynamicRouterModule,
        RouterModule.forRoot([
          {
            path: 'name-ex',
            component: StoryNameExComponent,
            data: {
              name: 'Mark'
            },
            // loadChildren: () => Promise.resolve(LevelTwoModule)
            loadChildren: () => of(LevelTwoModule)
          }
        ], { useHash: true })
      ],
      entryComponents: [
        StoryNameExComponent
      ]
    },
    props: { },
    template: `
      <story-ex-base></story-ex-base>
    `
  }))
