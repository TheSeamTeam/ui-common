import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { TheSeamFormFieldModule } from '@lib/ui-common/form-field'

import { TheSeamPhoneNumberPipe } from './phone-number.pipe'
import { TheSeamTelInputDirective } from './tel-input.directive'
import { TheSeamTelInputComponent } from './tel-input/tel-input.component'

@NgModule({
  declarations: [
    TheSeamTelInputDirective,
    TheSeamTelInputComponent,
    TheSeamPhoneNumberPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TheSeamFormFieldModule
  ],
  exports: [
    TheSeamTelInputDirective,
    TheSeamTelInputComponent,
    TheSeamPhoneNumberPipe
  ]
})
export class TheSeamTelInputModule { }
