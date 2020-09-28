import { CommonModule } from '@angular/common'
import { Directive, NgModule } from '@angular/core'

import {
  Framework,
  FrameworkLibraryService,
  JsonSchemaFormModule,
  JsonSchemaFormService,
  WidgetLibraryModule, WidgetLibraryService
} from '@ajsf/core'

import { TheSeamSchemaFormControlsModule } from '../schema-form-controls/schema-form-controls.module'
import { TheSeamFramework } from './schema-form-framework'
import { TheSeamSchemaFormFrameworkComponent } from './schema-form-framework.component'

@NgModule({
  declarations: [
    TheSeamSchemaFormFrameworkComponent
  ],
  imports: [
    CommonModule,
    JsonSchemaFormModule,
    TheSeamSchemaFormControlsModule,
    WidgetLibraryModule,
  ],
  providers: [
    JsonSchemaFormService,
    FrameworkLibraryService,
    WidgetLibraryService,
    { provide: Framework, useClass: TheSeamFramework, multi: true }
  ],
  exports: [
    TheSeamSchemaFormFrameworkComponent,
    JsonSchemaFormModule
  ],
  entryComponents: [
    TheSeamSchemaFormFrameworkComponent
  ]
})
export class TheSeamSchemaFormModule { }
