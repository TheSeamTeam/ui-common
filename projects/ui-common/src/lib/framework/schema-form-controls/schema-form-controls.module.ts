import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule } from '@ajsf/core'
import { NgSelectModule } from '@ng-select/ng-select'

import { TheSeamCheckboxModule } from '../../checkbox/index'
import { TheSeamFormFieldModule } from '../../form-field/index'

import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormInputComponent } from './schema-form-input/schema-form-input.component'
import { TheSeamSchemaFormNumberComponent } from './schema-form-number/schema-form-number.component'
import { TheSeamSchemaFormSelectComponent } from './schema-form-select/schema-form-select.component'
import { TheSeamSchemaFormSubmitComponent } from './schema-form-submit/schema-form-submit.component'

const controls = [
  TheSeamSchemaFormCheckboxComponent,
  TheSeamSchemaFormSubmitComponent,
  TheSeamSchemaFormSelectComponent,
  TheSeamSchemaFormInputComponent,
  TheSeamSchemaFormNumberComponent
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
    TheSeamCheckboxModule,
    NgSelectModule
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