import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { TheSeamFormFieldModule } from '../form-field/form-field.module'
import { TheSeamTelInputDirective } from './tel-input.directive'
import { TheSeamTelInputComponent } from './tel-input/tel-input.component'

@NgModule({
  declarations: [
    TheSeamTelInputDirective,
    TheSeamTelInputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TheSeamFormFieldModule
  ],
  exports: [
    TheSeamTelInputDirective,
    TheSeamTelInputComponent
  ]
})
export class TheSeamTelInputModule { }
