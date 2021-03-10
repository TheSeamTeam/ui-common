import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { TheSeamFormFieldErrorModule } from '@lib/ui-common/form-field-error'
import { TheSeamSharedModule } from '@lib/ui-common/shared'

import { FormFieldErrorDirective } from './form-field-error.directive'
import { FormFieldLabelTplDirective } from './form-field-label-tpl.directive'
import { FormFieldRequiredIndicatorComponent } from './form-field-required-indicator.component'
import { TheSeamFormFieldComponent } from './form-field.component'
import { InputDirective } from './input.directive'

@NgModule({
  declarations: [
    TheSeamFormFieldComponent,
    InputDirective,
    FormFieldErrorDirective,
    FormFieldLabelTplDirective,
    FormFieldRequiredIndicatorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TheSeamFormFieldErrorModule,
    TheSeamSharedModule
  ],
  exports: [
    TheSeamFormFieldComponent,
    InputDirective,
    FormFieldErrorDirective,
    FormFieldLabelTplDirective,
    FormFieldRequiredIndicatorComponent
  ]
})
export class TheSeamFormFieldModule { }
