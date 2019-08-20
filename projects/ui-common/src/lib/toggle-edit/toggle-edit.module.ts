import { A11yModule } from '@angular/cdk/a11y'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamFormFieldModule } from '../form-field/form-field.module'
import { TheSeamLoadingModule } from '../loading/loading.module'
import { TheSeamSharedModule } from '../shared/shared.module'

import { ToggleEditActionsContainerComponent } from './toggle-edit-actions-container/toggle-edit-actions-container.component'
import { ToggleEditDisplayTplDirective } from './toggle-edit-display-tpl.directive'
import { ToggleEditComponent } from './toggle-edit.component'

@NgModule({
  declarations: [
    ToggleEditDisplayTplDirective,
    ToggleEditActionsContainerComponent,
    ToggleEditComponent,
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    TheSeamFormFieldModule,
    OverlayModule,
    PortalModule,
    A11yModule,
    TheSeamLoadingModule
  ],
  exports: [
    ToggleEditDisplayTplDirective,
    ToggleEditComponent
  ]
})
export class TheSeamToggleEditModule { }
