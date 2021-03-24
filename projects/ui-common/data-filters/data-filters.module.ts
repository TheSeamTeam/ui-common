import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamToggleGroupModule } from '@theseam/ui-common/toggle-group'

import { THESEAM_DATA_FILTER_DEF } from './data-filter-def'
import { DataFilterSearchComponent } from './filters/data-filter-search/data-filter-search.component'
import { DataFilterTextComponent } from './filters/data-filter-text/data-filter-text.component'
import { DataFilterToggleButtonsComponent } from './filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component'

const filterComponents = [
  DataFilterSearchComponent,
  DataFilterTextComponent,
  DataFilterToggleButtonsComponent
]

const filterDefProviders = [
  { provide: THESEAM_DATA_FILTER_DEF, useValue: { name: 'search', component: DataFilterSearchComponent }, multi: true },
  { provide: THESEAM_DATA_FILTER_DEF, useValue: { name: 'text', component: DataFilterTextComponent }, multi: true },
  { provide: THESEAM_DATA_FILTER_DEF, useValue: { name: 'toggle-buttons', component: DataFilterToggleButtonsComponent }, multi: true },
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
    TheSeamToggleGroupModule,
    TheSeamIconModule
  ],
  providers: [
    ...filterDefProviders
  ],
  exports: [
    ...filterComponents
  ],
  entryComponents: [
    ...filterComponents
  ]
})
export class TheSeamDataFiltersModule { }
