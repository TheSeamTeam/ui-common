import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule } from '@ajsf/core'
import { NgSelectModule } from '@ng-select/ng-select'

import { TheSeamButtonsModule } from '@lib/ui-common/buttons'
import { TheSeamCheckboxModule } from '@lib/ui-common/checkbox'
import { TheSeamFormFieldModule } from '@lib/ui-common/form-field'
import { TheSeamMenuModule } from './../../menu/menu.module'

import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormInputComponent } from './schema-form-input/schema-form-input.component'
import { TheSeamSchemaFormNumberComponent } from './schema-form-number/schema-form-number.component'
import { TheSeamSchemaFormSelectComponent } from './schema-form-select/schema-form-select.component'
import { TheSeamSchemaFormSubmitSplitComponent } from './schema-form-submit-split/schema-form-submit-split.component'
import { TheSeamSchemaFormSubmitComponent } from './schema-form-submit/schema-form-submit.component'

const controls = [
  TheSeamSchemaFormCheckboxComponent,
  TheSeamSchemaFormSubmitComponent,
  TheSeamSchemaFormSelectComponent,
  TheSeamSchemaFormInputComponent,
  TheSeamSchemaFormNumberComponent,
  TheSeamSchemaFormSubmitSplitComponent
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
    TheSeamMenuModule,
    TheSeamButtonsModule,
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
