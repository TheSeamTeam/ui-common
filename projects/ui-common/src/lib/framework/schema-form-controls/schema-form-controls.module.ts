import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule } from '@ajsf/core'

import { TheSeamCheckboxModule } from '../../checkbox/index'
import { TheSeamFormFieldModule } from '../../form-field/index'

import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormSubmitComponent } from './schema-form-submit/schema-form-submit.component'

const controls = [
  TheSeamSchemaFormCheckboxComponent,
  TheSeamSchemaFormSubmitComponent
]

@NgModule({
  declarations: [
    ...controls
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
    TheSeamCheckboxModule
  ],
  exports: [
    ...controls,
    JsonSchemaFormModule
  ],
  entryComponents: [
    ...controls
  ]
})
export class TheSeamSchemaFormControlsModule { }
