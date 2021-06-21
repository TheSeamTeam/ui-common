import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { TheSeamFormFieldErrorModule } from '@theseam/ui-common/form-field-error'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { FormFieldErrorDirective } from './form-field-error.directive'
import { FormFieldHelpTextDirective } from './form-field-help-text.directive'
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
    FormFieldRequiredIndicatorComponent,
    FormFieldHelpTextDirective
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
    FormFieldRequiredIndicatorComponent,
    FormFieldHelpTextDirective
  ]
})
export class TheSeamFormFieldModule { }
