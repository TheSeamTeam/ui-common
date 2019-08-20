import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { TheSeamFormFieldErrorModule } from '../form-field-error/form-field-error.module'
import { TheSeamSharedModule } from '../shared/shared.module'

import { FormFieldErrorDirective } from './form-field-error.directive'
import { FormFieldLabelTplDirective } from './form-field-label-tpl.directive'
import { FormFieldComponent } from './form-field.component'
import { InputDirective } from './input.directive'

@NgModule({
  declarations: [
    FormFieldComponent,
    InputDirective,
    FormFieldErrorDirective,
    FormFieldLabelTplDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TheSeamFormFieldErrorModule,
    TheSeamSharedModule
  ],
  exports: [
    FormFieldComponent,
    InputDirective,
    FormFieldErrorDirective,
    FormFieldLabelTplDirective
  ]
})
export class TheSeamFormFieldModule { }
