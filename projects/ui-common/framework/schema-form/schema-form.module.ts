import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import {
  Framework,
  FrameworkLibraryService,
  JsonSchemaFormModule,
  JsonSchemaFormService,
  WidgetLibraryModule, WidgetLibraryService,
} from '@ajsf/core'

import { TheSeamFramework } from './schema-form-framework'
import { TheSeamSchemaFormFrameworkComponent } from './schema-form-framework.component'

@NgModule({
  imports: [
    CommonModule,
    JsonSchemaFormModule,
    WidgetLibraryModule,
    TheSeamSchemaFormFrameworkComponent,
  ],
  providers: [
    JsonSchemaFormService,
    FrameworkLibraryService,
    WidgetLibraryService,
    { provide: Framework, useClass: TheSeamFramework, multi: true },
  ],
  exports: [
    TheSeamSchemaFormFrameworkComponent,
    JsonSchemaFormModule,
  ],
})
export class TheSeamSchemaFormModule { }
