import { A11yModule } from '@angular/cdk/a11y'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { ModalCloseDirective } from './directives/modal-close.directive'
import { ModalFooterTplDirective } from './directives/modal-footer-tpl.directive'
import { ModalHeaderIconTplDirective } from './directives/modal-header-icon-tpl.directive'
import { ModalHeaderTitleTplDirective } from './directives/modal-header-title-tpl.directive'
import { ModalTitleDirective } from './directives/modal-title.directive'
import { ModalDirective } from './directives/modal.directive'
import { ModalBodyComponent } from './modal-body/modal-body.component'
import { ModalConfig } from './modal-config'
import { ModalContainerComponent } from './modal-container/modal-container.component'
import { ModalFooterComponent } from './modal-footer/modal-footer.component'
import { ModalHeaderComponent } from './modal-header/modal-header.component'
import {
  MODAL_CONFIG,
  MODAL_CONTAINER,
  MODAL_REF,
  THESEAM_MODAL_SCROLL_STRATEGY_PROVIDER
} from './modal-injectors'
import { ModalRef } from './modal-ref'
import { Modal } from './modal.service'
import { ModalComponent } from './modal/modal.component'
import { RouteModalComponent } from './route-modal/route-modal.component'

@NgModule({
  declarations: [
    ModalComponent,
    ModalFooterTplDirective,
    ModalHeaderIconTplDirective,
    ModalHeaderTitleTplDirective,
    RouteModalComponent,
    ModalDirective,
    ModalContainerComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalCloseDirective
  ],
  imports: [
    CommonModule,
    OverlayModule,
    FontAwesomeModule,
    RouterModule,
    ReactiveFormsModule,
    PortalModule,
    A11yModule,
  ],
  exports: [
    ModalComponent,
    ModalFooterTplDirective,
    ModalHeaderIconTplDirective,
    ModalHeaderTitleTplDirective,
    RouteModalComponent,
    ModalDirective,
    // Re-export the PortalModule so that people extending the `CdkDialogContainer`
    // don't have to remember to import it or be faced with an unhelpful error.
    PortalModule,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalCloseDirective
  ],
  providers: [
    Modal,
    THESEAM_MODAL_SCROLL_STRATEGY_PROVIDER,
    { provide: MODAL_REF, useValue: ModalRef },
    { provide: MODAL_CONTAINER, useValue: ModalContainerComponent },
    { provide: MODAL_CONFIG, useValue: ModalConfig },
  ],
  entryComponents: [
    RouteModalComponent,
    ModalContainerComponent
  ],
})
export class TheSeamModalModule { }
