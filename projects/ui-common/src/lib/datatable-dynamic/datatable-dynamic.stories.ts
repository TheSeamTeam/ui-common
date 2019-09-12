import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { TheSeamDatatableDynamicModule } from './datatable-dynamic.module'

import { exampleData1 } from './_story-data/dynamic-data-1'


storiesOf('Datatable/Dynamic', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [ ],
      imports: [
        BrowserAnimationsModule,
        TheSeamDatatableDynamicModule
      ],
      entryComponents: [ ]
    },
    props: {
      data: exampleData1
    },
    template: `
      <div style="width: 100vw; height: 100vh;">
        <seam-datatable-dynamic class="w-100 h-100" [data]="data"></seam-datatable-dynamic>
      </div>
    `
  }))
