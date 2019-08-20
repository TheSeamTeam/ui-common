import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamFormFieldModule } from '../form-field/form-field.module'
import { TheSeamToggleGroupModule } from '../toggle-group/toggle-group.module'

import { DataFilterTextComponent } from './filters/data-filter-text/data-filter-text.component'
import { DataFilterToggleButtonsComponent } from './filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component'

const filterComponents = [
  DataFilterTextComponent,
  DataFilterToggleButtonsComponent
]

@NgModule({
  declarations: [
    ...filterComponents
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TheSeamFormFieldModule,
    FontAwesomeModule,
    TheSeamToggleGroupModule
  ],
  exports: [
    ...filterComponents
  ],
  entryComponents: [
    ...filterComponents
  ]
})
export class TheSeamDataFiltersModule { }
