import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { TheSeamDynamicRouterModule } from '../dynamic-router.module'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'name-ex-1',
  template: `Name: {{ name }}`
})
class StoryNameExComponent {

  name$: Observable<string | undefined>

  constructor(
    private _route: ActivatedRoute
  ) {
    console.log(this._route)
    this.name$ = this._route.data.pipe(map(v => v['name'] || undefined))
  }
}

storiesOf('Framework/DynamicRouter', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        StoryNameExComponent
      ],
      imports: [
        BrowserAnimationsModule,
        TheSeamDynamicRouterModule,
        RouterModule.forRoot([], { useHash: true })
      ],
      entryComponents: [
        StoryNameExComponent
      ]
    },
    props: { },
    template: `
      Example
      <router-outlet></router-outlet>
    `
  }))
