import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FormFieldErrorListItemTplDirective } from './form-field-error-list/form-field-error-list-item-tpl.directive'
import { FormFieldErrorListItemDirective } from './form-field-error-list/form-field-error-list-item.directive'
import { FormFieldErrorListComponent } from './form-field-error-list/form-field-error-list.component'
import { FormFieldErrorComponent } from './form-field-error/form-field-error.component'

@NgModule({
  declarations: [
    FormFieldErrorComponent,
    FormFieldErrorListComponent,
    FormFieldErrorListItemDirective,
    FormFieldErrorListItemTplDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FormFieldErrorComponent,
    FormFieldErrorListComponent,
    FormFieldErrorListItemDirective,
    FormFieldErrorListItemTplDirective
  ]
})
export class TheSeamFormFieldErrorModule { }
