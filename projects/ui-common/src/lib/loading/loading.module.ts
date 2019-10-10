import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { NgxLoadingModule } from 'ngx-loading'

import { TheSeamLoadingOverlayService } from './loading-overlay.service'
import { defaultThemeConfig } from './loading-themes'
import { LoadingComponent } from './loading/loading.component'

// NOTE: Named export used for this because of a function calling bug in the builder.
export const loadingForRoot = NgxLoadingModule.forRoot(defaultThemeConfig)

@NgModule({
  declarations: [LoadingComponent],
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    loadingForRoot
  ],
  providers: [
    TheSeamLoadingOverlayService
  ],
  exports: [LoadingComponent],
  entryComponents: [LoadingComponent]
})
export class TheSeamLoadingModule { }
