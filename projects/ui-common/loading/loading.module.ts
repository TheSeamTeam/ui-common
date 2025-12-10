import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { NgModule } from '@angular/core'

import { TheSeamLoadingComponent } from './loading/loading.component'

@NgModule({
  imports: [TheSeamLoadingComponent],
  exports: [OverlayModule, PortalModule, TheSeamLoadingComponent],
})
export class TheSeamLoadingModule {}
